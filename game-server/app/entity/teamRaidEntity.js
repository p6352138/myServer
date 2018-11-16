/**
 * Date: 2018/10/11
 * Author: liuguolai
 * Description: 组队副本管理
 */
let util = require('util');
let pomelo = require('pomelo');
let Entity = _require('./entity');
let messageService = _require('../services/messageService');
let consts = _require('../common/consts');
let raidHelper = _require('../helper/raidHelper');
let heroTpl = _require('../data/Hero');
let raidTpl = _require('../data/Raid');
let heroAttriTpl = _require('../data/HeroAttributes');
var entityFactory = _require('./entityFactory');

let TeamRaidEntity = function (opts) {
    opts = opts || {};
    Entity.call(this, opts);

    let channelService = pomelo.app.get('channelService');
    this.channel = channelService.getChannel(this.id, true);
};

util.inherits(TeamRaidEntity, Entity);
module.exports = TeamRaidEntity;

let pro = TeamRaidEntity.prototype;

// 开启新的组队副本
pro.initTeamRaid = function (raidID, teamMembers) {
    this.raidID = raidID;
    this.teamMembers = teamMembers;
    this.members = {};  // id映射
    this.prepareInfo = {};
    this.confirmMembers = new Set();
    this.state = consts.Raid.STATE_TEAM_SELECT_HERO;
    this.rooms = [];

    // 开始选择英雄
    let teamInfo = [], prepareMems = {};
    for (let member of teamMembers) {
        let id = member.id, sid = member.sid;
        teamInfo.push({
            uid: id,
            openid: member.openid,
            name: member.name
        })
        this.members[id] = member;
        this.confirmMembers.add(id);
        prepareMems[id] = sid;
        this.channel.add(id, sid);
    }
    let serverId = pomelo.app.getServerId();
    let self = this;
    for (let id in prepareMems) {
        pomelo.app.rpc.connector.entryRemote.onTeamRaidBegin.toServer(
            prepareMems[id], id, serverId, self.id, teamInfo, function (uid, code, prepareInfo) {
                if (code === consts.Code.FAIL) {
                    self.logger.error("get fighter[%s] prepareInfo failed.", uid);
                }
                self.prepareInfo[uid] = prepareInfo;
                delete prepareMems[uid];
                // 进入选英雄，60s倒计时
                if (Object.getOwnPropertyNames(prepareMems).length === 0) {
                    this.timer = setTimeout(self._selectRoom.bind(self, 1), 1000 * 60);
                }
            }.bind(self, id)
        )
    }
};

pro._notifyToTeamMembers = function (excludeUid, funcName, ...args) {
    for (let uid in this.members) {
        if (uid === excludeUid)
            continue;
        let member = this.members[uid];
        pomelo.app.rpc.connector.entryRemote[funcName].toServer(member.sid, member.id, ...args, null);
    }
};

pro._checkCanSelectHero = function (uid, heroid) {
    if (!(heroid in this.prepareInfo[uid].heros))
        return consts.SelectHeroCode.NOT_EXIST;
    if (!this.confirmMembers.has(uid))
        return consts.SelectHeroCode.ALREADY_CONFIRMED;
    for (let member of this.teamMembers) {
        if (member.heroid === heroid)
            return consts.SelectHeroCode.BE_SELECEED;
    }
    return consts.SelectHeroCode.OK;
};

// 选英雄
pro.selectHero = function (uid, heroid, cb) {
    let code = this._checkCanSelectHero(uid, heroid);
    cb({code: code});
    if (code === consts.SelectHeroCode.OK) {
        this.members[uid].heroid = heroid;
        this.logger.info("%s select heroid: %s", uid, heroid);
        this._notifyToTeamMembers(uid, 'onTeamRaidSelectHero', uid, heroid);
    }
};

pro._checkCanConfirmHero = function (uid) {
    if (!this.confirmMembers.has(uid))
        return false;
    let member = this.members[uid];
    if (!member || !member.heroid)
        return false;
    return true;
};

// 确认英雄
pro.confirmHero = function (uid, cb) {
    let bOk = this._checkCanConfirmHero(uid);
    if (bOk) {
        cb({code: consts.Code.OK});
        this.confirmMembers.delete(uid);
        this._notifyToTeamMembers(uid, 'onTeamRaidConfirmHero', uid);
        // 全部准备完毕
        if (this.confirmMembers.size === 0) {
            this._selectRoom(1);
        }
    }
    else {
        cb({code: consts.Code.FAIL});
    }
};

// 自动填充英雄
pro._autoFillHero = function () {
    let selectedHeroids = new Set();
    for (let member of this.teamMembers) {
        let heroid = member.heroid;
        if (heroid)
            selectedHeroids.add(heroid);
    }
    for (let member of this.teamMembers) {
        let heroid = member.heroid;
        if (!heroid) {
            let validHeros = new Set(Object.getOwnPropertyNames(this.prepareInfo[member.id].heros).map(Number));
            for (let heroid of selectedHeroids) {
                if (validHeros.has(heroid))
                    validHeros.delete(heroid);
            }
            let index = Math.floor(Math.random() * validHeros.size);
            heroid = Array.from(validHeros)[index] || 1000;
            member.heroid = heroid;
            selectedHeroids.add(heroid);
        }
    }
    // 生成英雄初始属性，TODO：没其他系统支持，先读表，等级默认1
    for (let member of this.teamMembers) {
        let heroid = member.heroid;
        let heroAttriData = heroAttriTpl[heroid + 1];
        member.cards = heroTpl[heroid].InitialDrawPile.slice();
        member.hp = heroAttriData.HeroMaxHP;
        member.maxHp = heroAttriData.HeroMaxHP;
    }
    this._notifyMembersInfo();
};

pro._notifyMembersInfo = function () {
    let membersInfo = [];
    for (let member of this.teamMembers) {
        membersInfo.push({
            uid: member.id,
            openid: member.openid,
            name: member.name,
            heroid: member.heroid,
            cards: member.cards,
            hp: member.hp,
            maxHp: member.maxHp,
        })
    }
    this._notifyToTeamMembers(null, 'onTeamRaidMemberUpdate', membersInfo);
};

// 选择关卡
pro._selectRoom = function (roomIdx) {
    clearTimeout(this.timer);
    if (this.state === consts.Raid.STATE_TEAM_SELECT_HERO) {
        this._autoFillHero();
    }
    this.state = consts.Raid.STATE_TEAM_SELECT_ROOM;
    // 生成选择列表
    let selectList = raidHelper.genRaidRoomTypeList(this.raidID, roomIdx);
    this.rooms[roomIdx - 1] = {
        selectList: selectList,
        memberSelected: {}
    }
    this._notifyToTeamMembers(null, 'onTeamRaidBeginSelectRoom', selectList);
    // 30秒倒计时
    this.timer = setTimeout(this._enterRoom.bind(this), 1000 * 30);
};

pro._checkCanSelectRoom = function (uid, idx) {
    if (this.state !== consts.Raid.STATE_TEAM_SELECT_ROOM)
        return false;
    if (!(uid in this.members))
        return false;
    let roomInfo = this.rooms[this.rooms.length - 1];
    if (idx <= 0 || idx > roomInfo.selectList.length)
        return false;

    return true;
};

// 玩家点选关卡
pro.selectRoom = function (uid, idx, cb) {
    let bOK = this._checkCanSelectRoom(uid, idx);
    if (bOK) {
        cb({code: consts.Code.OK});
        let roomInfo = this.rooms[this.rooms.length - 1];
        roomInfo.memberSelected[uid] = idx;
        this._notifyToTeamMembers(uid, 'onTeamRaidRoomSelected', uid, idx);
        // 队长的话直接进入
        if (uid === this.teamMembers[0].id) {
            roomInfo.selectedIdx = idx;
            this._enterRoom();
        }
    }
    else {
        cb({code: consts.Code.FAIL});
    }
};

// 进入关卡
pro._enterRoom = function () {
    clearTimeout(this.timer);
    let roomInfo = this.rooms[this.rooms.length - 1];
    let idx = roomInfo.selectedIdx;
    if (!idx) {
        // 随机一个
        idx = Math.floor(Math.random() * roomInfo.selectList.length) + 1;
        roomInfo.selectedIdx = idx;
    }
    let actualRoomInfo = roomInfo.selectList[idx - 1];
    let type = actualRoomInfo.type, id = actualRoomInfo.id;
    if (type === consts.Raid.TYPE_DUNGEON) {
        let teamA = {};
        for (let member of this.teamMembers) {
            teamA[member.id] = {
                openid: member.openid,
                sid: member.sid,
                name: member.name,
                level: member.level,
                heroid: member.heroid,
                inTeam: 1
            }
        }
        let extraData = {raidID: this.raidID, roomIdx: idx, teamRaidEnt: this};
        let dungeonEntity = entityFactory.createEntity("DungeonEntity");
        dungeonEntity.initFight(consts.Team.TYPE_RAID, id, teamA, {}, extraData);
    }
    else if (type === consts.Raid.TYPE_SHOP) {

    }
    else if (type === consts.Raid.TYPE_AWARD) {

    }
    else {
        this.entity.logger.error('enter room unknow type: ' + type);
    }
};

// 获取英雄数据
pro.getHeroInfo = function () {
    let result = {};
    for (let member of this.teamMembers) {
        result[member.id] = {
            heroInfo: {
                heroid: member.heroid,
                cards: member.cards,
                attri: {
                    hp: member.hp,
                    maxHp: member.maxHp,
                }
            }
        }
    }
    return result;
};

// 副本战斗结束
pro.onDungeonEnd = function (result, membersAttri) {
    if (result === consts.FightResult.WIN) {
        // 更新属性
        for (let member of this.teamMembers) {
            if (member.id in membersAttri) {
                let attris = membersAttri[member.id];
                for (let key in attris) {
                    member[key] = attris[key];
                }
            }
        }
        let roomIdx = this.rooms.length;
        // 进入选择卡牌奖励
        if (raidTpl[this.raidID].TotalCount > roomIdx) {
            this.state = consts.Raid.STATE_TEAM_GET_CARD;
            // todo: 针对不同的英雄生成各自的选择卡牌
            for (let member of this.teamMembers) {
                member.cardsList = [1, 2, 3];
                pomelo.app.rpc.connector.entryRemote.onTeamRaidBeginGetCard.toServer(
                    member.sid, member.id, member.cardsList, null);
            }
            // 30s倒计时, 进入下一个关卡的选择
            this.timer = setTimeout(this._selectRoom.bind(this, roomIdx + 1), 1000 * 30);
        }
        else {
            // 通关了整个副本
            this._notifyToTeamMembers(null, 'onTeamRaidPass');
            this.destroy();
        }
    }
    else if (result === consts.FightResult.LOSE) {
        // 副本失败
        this._notifyToTeamMembers(null, 'onTeamRaidFail');
        this.destroy();
    }
};

pro._checkCanGetCard = function (uid, cardID) {
    if (this.state !== consts.Raid.STATE_TEAM_GET_CARD)
        return false;
    let member = this.members[uid];
    if (!member || !member.cardsList)
        return false;
    if (member.cardsList.indexOf(cardID) === -1)
        return false;
    return true;
};

// 选择卡牌
pro.getCard = function (uid, cardID, cb) {
    let bOK = this._checkCanGetCard(uid, cardID);
    if (bOK) {
        cb({code: consts.Code.OK});
        let member = this.members[uid];
        delete member.cardsList;
        member.cards.push(cardID);
        this._notifyToTeamMembers(uid, 'onTeamRaidMemberGetCard', uid);
        this._checkFinishGetCard();
    }
    else {
        cb({code: consts.Code.FAIL});
    }
};

pro._checkCanIgnoreGetCard = function (uid) {
    if (this.state !== consts.Raid.STATE_TEAM_GET_CARD)
        return false;
    let member = this.members[uid];
    if (!member || !member.cardsList)
        return false;
    return true;
};

pro.ignoreGetCard = function (uid, cb) {
    let bOK = this._checkCanIgnoreGetCard(uid);
    if (bOK) {
        cb({code: consts.Code.OK});
        let member = this.members[uid];
        delete member.cardsList;
        // 别人应该不需要知道是不是ignore
        this._notifyToTeamMembers(uid, 'onTeamRaidMemberGetCard', uid);
        this._checkFinishGetCard();
    }
    else {
        cb({code: consts.Code.FAIL});
    }
};

pro._checkFinishGetCard = function () {
    for (let uid in this.members) {
        if (this.members[uid].cardsList)
            return;
    }
    // 已经全部选完了，进入下一关卡
    let roomIdx = this.rooms.length;
    this._selectRoom(roomIdx + 1);
};

// 退出组队离开副本
pro.leaveTeamRaid = function (uid) {
    if (uid in this.members) {
        delete this.members[uid];
        for (let i = 0; i < this.teamMembers.length; i++) {
            if (this.teamMembers[i].id === uid) {
                this.teamMembers.splice(i, 1);
                break;
            }
        }
        this._notifyMembersInfo();
    }
};

pro.destroy = function () {
    this.channel = null;
    let channelService = pomelo.app.get('channelService');
    channelService.destroyChannel(this.id);
    Entity.prototype.destroy.call(this);
};
