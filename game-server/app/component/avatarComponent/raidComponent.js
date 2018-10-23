/**
 * Date: 2018/10/8
 * Author: liuguolai
 * Description: 副本管理
 */
let util = require('util');
let pomelo = require('pomelo');
let dispatcher = _require('../../util/dispatcher');
let Component = _require('../component');
let consts = _require('../../public/consts');
let raidTpl = _require('../../data/Raid');
let heroTpl = _require('../../data/Hero');
let roomTpl = _require('../../data/Room');
let heroAttriTpl = _require('../../data/HeroAttributes');
let raidHelper = _require('../../helper/raidHelper');

let RaidComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(RaidComponent, Component);
module.exports = RaidComponent;

let pro = RaidComponent.prototype;

pro.init = function (opts) {
    this._initDbData(opts.raid || {});

    this.teamRaidInfo = {};  // 组队副本信息
    this.inTeamRaid = false;
    this.entity.team.safeBindEvent("EventLeaveTeam", this._onLeaveTeam.bind(this));
};

pro._initDbData = function (data) {
    this.raidsInfo = data.raidsInfo || {
        /*
        1: {
            heroid: 1000,
            cards: [],
            rooms: [{type: "dungeon", id: 1, state: 1, selectList: []}],
        }
        */
    };   // 记录单人副本进度等内容
};

pro.getPersistData = function () {
    return {
        raidsInfo: this.raidsInfo,
    }
};

pro.getClientInfo = function () {
    return {
        raids: this.raidsInfo,
        teamRaid: this.teamRaidInfo
    };
};

pro._checkCanSelectHero = function (raidID, heroid) {
    let raidData = raidTpl[raidID];
    if (!raidData || !this.entity.hero.hasHero(heroid))
        return consts.Code.FAIL;
    if (raidData.RequirePlayers !== 1)
        return consts.RaidCode.NOT_SINGLE_RAID;
    if (raidData.RequireLevel > this.entity.level)
        return consts.RaidCode.LEVEL_LIMIT;
    let raidInfo = this.raidsInfo[raidID];
    if (raidInfo)
        return consts.RaidCode.HAD_SELECTED;
    return consts.RaidCode.OK;
};

// 副本初始化
pro._initRaidInfo = function (raidID, heroid) {
    let heroAttriData = heroAttriTpl[heroid + 1];
    let roomInfo = {
        state: consts.Raid.STATE_SELECT,
        selectList: raidHelper.genRaidRoomTypeList(raidID, 1),
    }
    this.raidsInfo[raidID] = {
        raidID: raidID,
        heroid: heroid,
        cards: heroTpl[heroid].InitialDrawPile.slice(),
        hp: heroAttriData.HeroMaxHP,
        maxHp: heroAttriData.HeroMaxHP,
        rooms: [roomInfo]
    };
};

// 单人副本选英雄
pro.raidSelectHero = function (raidID, heroid, next) {
    raidID = parseInt(raidID), heroid = parseInt(heroid);
    let code = this._checkCanSelectHero(raidID, heroid);
    let resp = {
        code: code,
    }
    if (code === consts.RaidCode.OK) {
        this._initRaidInfo(raidID, heroid);
        resp["raidInfo"] = this.raidsInfo[raidID];
        this.entity.logger.info("raid select hero raidID[%s] heroid[%s]", raidID, heroid);
    }
    next(null, resp);
};

pro._checkCanSelectRoom = function (raidID, roomIdx, idx) {
    if (this.entity.isBusy()) {
        return consts.Code.FAIL;
    }
    let raidInfo = this.raidsInfo[raidID];
    if (!raidInfo || raidInfo.rooms.length !== roomIdx) {
        return consts.Code.FAIL;
    }
    let roomInfo = raidInfo.rooms[raidInfo.rooms.length - 1];
    if (roomInfo.state !== consts.Raid.STATE_SELECT || idx <= 0 || idx > roomInfo.selectList.length) {
        return consts.Code.FAIL;
    }
    return consts.RaidCode.OK;
};

// 单人选择关卡并进入
pro.raidSelectAndEnterRoom = function (raidID, roomIdx, idx, next) {
    let code = this._checkCanSelectRoom(raidID, roomIdx, idx);
    let resp = {
        code: code,
    }
    if (code !== consts.RaidCode.OK) {
        next(null, resp);
        return;
    }
    if (code === consts.RaidCode.OK) {
        let raidInfo = this.raidsInfo[raidID];
        let roomInfo = raidInfo.rooms[raidInfo.rooms.length - 1];
        let selected = roomInfo.selectList[idx - 1];
        roomInfo.state = consts.Raid.STATE_START;
        roomInfo.type = selected.type;
        roomInfo.id = selected.id;
        delete roomInfo.selectList;
        resp["raidInfo"] = this.raidsInfo[raidID];
        this.entity.logger.info(
            "raid select room success. raidID[%s] roomIdx[%s] roomInfo[%s]", raidID, roomIdx, roomInfo);
    }
    next(null, resp);
    this.actualRaidEnterRoom(raidID, roomIdx);
};

pro._checkCanEnterRoom = function (raidID, roomIdx) {
    if (this.entity.isBusy()) {
        return consts.Code.FAIL;
    }
    let raidInfo = this.raidsInfo[raidID];
    if (!raidInfo || roomIdx <= 0 || raidInfo.rooms.length < roomIdx) {
        return consts.Code.FAIL;
    }
    let roomInfo = raidInfo.rooms[roomIdx - 1];
    if (roomInfo.state !== consts.Raid.STATE_START) {
        return consts.Code.FAIL;
    }
    return consts.RaidCode.OK;
};

// 单人进入关卡
pro.raidEnterRoom = function (raidID, roomIdx, next) {
    let code = this._checkCanEnterRoom(raidID, roomIdx);
    next(null, {code: code});
    if (code === consts.RaidCode.OK) {
        this.actualRaidEnterRoom(raidID, roomIdx);
    }
};

pro.actualRaidEnterRoom = function (raidID, roomIdx) {
    let raidInfo = this.raidsInfo[raidID];
    let roomInfo = raidInfo.rooms[roomIdx - 1];
    let type = roomInfo.type;
    if (type === consts.Raid.TYPE_DUNGEON) {
        let fightServerIds = pomelo.app.get("fightIdsMap")["PVE"][1];
        let server = dispatcher.dispatch(this.entity.id, fightServerIds);
        let ent = this.entity;
        pomelo.app.rpc.fight.fightRemote.newFight.toServer(server,
            consts.Team.TYPE_RAID, roomInfo.id, {
                [ent.id]: {
                    openid: ent.openid,
                    sid: pomelo.app.getServerId(),
                    name: ent.name,
                    inTeam: 0
                }
            }, {}, {raidID: raidID, roomIdx: roomIdx}, null);
    }
    else if (type === consts.Raid.TYPE_SHOP) {

    }
    else if (type === consts.Raid.TYPE_AWARD) {

    }
    else {
        this.entity.logger.error('enter room unknow type: ' + type);
    }
};

// 获取副本英雄数据
pro.getHeroInfoByRaidID = function (raidID) {
    let raidInfo = this.raidsInfo[raidID];
    return {
        heroid: raidInfo.heroid,
        cards: raidInfo.cards,
        attri: {
            hp: raidInfo.hp,
            maxHp: raidInfo.maxHp,
        }
    }
};

pro._notifyRaidInfoToClient = function (raidID) {
    let msg = {
        raidID: raidID
    }
    if (raidID in this.raidsInfo) {
        msg["info"] = this.raidsInfo[raidID]
    }
    this.entity.sendMessage('onRaidInfoUpdate', msg);
};

// 副本战斗结算
pro.onRaidDungeonResult = function (raidID, roomIdx, result, updateInfo) {
    let raidInfo = this.raidsInfo[raidID];
    if (!raidInfo)
        return;
    // 失败后重置
    if (result === consts.FightResult.LOSE) {
        delete this.raidsInfo[raidID];
    }
    else if (result === consts.FightResult.WIN) {
        let roomInfo = raidInfo.rooms[roomIdx - 1];
        // 更新战斗属性
        let newAttri = updateInfo.attri;
        for (let key in newAttri) {
            raidInfo[key] = newAttri[key];
        }
        // 通关了最新的关卡
        if (roomInfo.state === consts.Raid.STATE_START && raidInfo.rooms.length === roomIdx) {
            // 生成待选卡牌
            if (raidTpl[raidID].TotalCount > roomIdx) {
                roomInfo.state = consts.Raid.STATE_GET_CARD;
                // TODO： 写死测试，规则出来后迭代
                roomInfo.cardsList = [1, 2, 3];
            }
            else {
                // 已经是最后一关
                roomInfo.state = consts.Raid.STATE_FINISH;
            }
        }
    }
    this._notifyRaidInfoToClient(raidID);
};

pro._checkCanGetCard = function (raidID, cardID) {
    if (this.entity.isBusy()) {
        return consts.Code.FAIL;
    }
    let raidInfo = this.raidsInfo[raidID];
    if (!raidInfo) {
        return consts.Code.FAIL;
    }
    let roomInfo = raidInfo.rooms[raidInfo.rooms.length - 1];
    if (roomInfo.state !== consts.Raid.STATE_GET_CARD) {
        return consts.Code.FAIL;
    }
    if (cardID !== 0 && roomInfo.cardsList.indexOf(cardID) === -1) {
        return consts.Code.FAIL;
    }
    return consts.RaidCode.OK;
};

// 获取卡牌
pro.raidGetCard = function (raidID, cardID, next) {
    let code = this._checkCanGetCard(raidID, cardID);
    let resp = {
        code: code
    }
    if (code === consts.RaidCode.OK) {
        let raidInfo = this.raidsInfo[raidID];
        let roomInfo = raidInfo.rooms[raidInfo.rooms.length - 1];
        roomInfo.state = consts.Raid.STATE_FINISH;
        // 为0代表放弃
        if (cardID !== 0) {
            raidInfo.cards.push(cardID);
        }
        delete roomInfo.cardsList;
        this.entity.logger.info("raid get card raidID[%s] cardID[%s]", raidID, cardID);
        // 生成下一个关卡
        let nextRoomIdx = raidInfo.rooms.length + 1;
        let newRoomInfo = {
            state: consts.Raid.STATE_SELECT,
            selectList: raidHelper.genRaidRoomTypeList(raidID, nextRoomIdx),
        }
        raidInfo.rooms.push(newRoomInfo);
        resp["raidInfo"] = raidInfo;
    }
    next(null, resp);
};

/* *********************************************************** */

pro._onLeaveTeam = function (entity) {
    if (this.inTeamRaid) {
        this.doLeaveTeamRaid();
    }
};

pro.doLeaveTeamRaid = function () {
    let self = this;
    self._callTeamRaidEnt('leaveTeamRaid', function () {
        self._resetTeamRaidInfo();
    });
};

pro._resetTeamRaidInfo = function () {
    this.inTeamRaid = false;
    this.teamRaidInfo = {};
    this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.ONLINE);
};

// 设置团队副本信息
pro.setTeamRaidInfo = function (teamRaidServer, teamRaidEntId, teamInfo) {
    this.teamRaidInfo = {
        teamRaidServer: teamRaidServer,
        teamRaidEntId: teamRaidEntId,
        teamInfo: teamInfo,
        rooms: [],
        state: consts.Raid.STATE_TEAM_SELECT_HERO
    }
    this.inTeamRaid = true;
    this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.PLAYING);
    // 没有组队？那就是异步问题
    if (!this.entity.team.hasJoined()) {
        this.doLeaveTeamRaid();
    }
};

// 组队副本远程
pro._callTeamRaidEnt = function (funcName, ...args) {
    pomelo.app.rpc.fight.teamRaidRemote[funcName].toServer(
        this.teamRaidInfo.teamRaidServer, this.teamRaidInfo.teamRaidEntId, this.entity.id, ...args);
};

// 更新队员选择信息
pro.getTeamRaidMember = function (memberID) {
    for (let member of this.teamRaidInfo.teamInfo) {
        if (member.uid === memberID) {
            return member;
        }
    }
};

// 团队副本选择英雄
pro.teamRaidSelectHero = function (heroid, next) {
    if (this.teamRaidInfo.state !== consts.Raid.STATE_TEAM_SELECT_HERO) {
        return next(null, {code: consts.Code.FAIL});
    }
    if (!this.entity.hero.hasHero(heroid)) {
        return next(null, {code: consts.Code.FAIL});
    }
    let self = this;
    self._callTeamRaidEnt('selectHero', heroid, function (resp) {
        if (resp.code === consts.SelectHeroCode.OK) {
            let member = self.getTeamRaidMember(self.entity.id);
            member && (member.heroid = heroid);
        }
        next(null, resp);
    });
};

// 副本队员选择了英雄
pro.onTeamRaidSelectHero = function (memberID, heroid) {
    let member = this.getTeamRaidMember(memberID);
    member && (member.heroid = heroid);
    this.entity.sendMessage('onTeamRaidSelectHeroNotify', {uid: memberID, heroid: heroid});
};

// 确认选择英雄
pro.teamRaidConfirmHero = function (next) {
    if (this.teamRaidInfo.state !== consts.Raid.STATE_TEAM_SELECT_HERO) {
        return next(null, {code: consts.Code.FAIL});
    }
    let member = this.getTeamRaidMember(this.entity.id);
    if (!member || !member.heroid)
        return next(null, {code: consts.Code.FAIL});
    let self = this;
    self._callTeamRaidEnt('confirmHero', function (resp) {
        if (resp.code === consts.Code.OK) {
            let member = self.getTeamRaidMember(self.entity.id);
            member && (member.confirm = 1);
        }
        next(null, resp);
    });
};

// 队员确认了英雄
pro.onTeamRaidConfirmHero = function (memberID) {
    let member = this.getTeamRaidMember(memberID);
    if (!member)
        return;
    member.confirm = 1;
    this.entity.sendMessage('onTeamRaidConfirmHeroNotify', {uid: memberID, heroid: member.heroid});
};

// 队员信息更新
pro.onTeamRaidMemberUpdate = function (membersInfo) {
    this.teamRaidInfo.teamInfo = membersInfo;
    this.entity.sendMessage('onTeamRaidMembersUpdate', {teamInfo: membersInfo});
};

// 进入选择阶段
pro.onTeamRaidBeginSelectRoom = function (selectList) {
    this.teamRaidInfo.state = consts.Raid.STATE_TEAM_SELECT_ROOM;
    this.teamRaidInfo.rooms.push({
        selectList: selectList,
        beginTime: new Date().getTime(),
        memberSelected: {}
    })
    this.entity.sendMessage('onTeamRaidShowRoomList', {selectList: selectList});
};

// 点选关卡
pro.teamRaidSelectRoom = function (idx, next) {
    if (this.teamRaidInfo.state !== consts.Raid.STATE_TEAM_SELECT_ROOM)
        return next(null, {code: consts.Code.FAIL});
    let roomInfo = this.teamRaidInfo.rooms[this.teamRaidInfo.rooms.length - 1];
    if (idx <= 0 || idx > roomInfo.selectList.length)
        return next(null, {code: consts.Code.FAIL});
    let self = this;
    self._callTeamRaidEnt('selectRoom', idx, function (resp) {
        if (resp.code === consts.Code.OK) {
            roomInfo.memberSelected[self.entity.id] = idx;
        }
        next(null, resp);
    });
};

// 队员点选了关卡
pro.onTeamRaidRoomSelected = function (memberID, idx) {
    let roomInfo = this.teamRaidInfo.rooms[this.teamRaidInfo.rooms.length - 1];
    roomInfo.memberSelected[memberID] = idx;
    this.entity.sendMessage('onTeamRaidRoomSelected', {uid: memberID, idx: idx});
};

pro.onTeamRaidEnterDungeon = function () {
    this.teamRaidInfo.state = consts.Raid.STATE_TEAM_IN_ROOM;
};

// 组队副本战斗结果
pro.onTeamRaidDungeonResult = function (result, membersAttri) {
    if (!this.inTeamRaid)
        return;
    if (result === consts.FightResult.WIN) {
        for (let member of this.teamRaidInfo.teamInfo) {
            if (member.uid in membersAttri) {
                let newAttris = membersAttri[member.uid];
                for (let key in newAttris) {
                    member[key] = newAttris[key];
                }
            }
        }
        // 通知客户端
        this.onTeamRaidMemberUpdate(this.teamRaidInfo.teamInfo);
    }
    else if (result === consts.FightResult.LOSE) {
        this.teamRaidInfo = {};
    }
};

// 进入组队副本选择卡牌
pro.onTeamRaidBeginGetCard = function (cardsList) {
    if (this.teamRaidInfo.state !== consts.Raid.STATE_TEAM_IN_ROOM)
        return;
    this.teamRaidInfo.state = consts.Raid.STATE_TEAM_GET_CARD;
    this.teamRaidInfo.cardsList = cardsList;
    this.teamRaidInfo.cardsSelectedMems = [];  // 已经完成卡牌选择的队员
    this.entity.sendMessage('onTeamRaidBeginGetCard', {
        cardsList: cardsList
    })
};

// 获取卡牌
pro.teamRaidGetCard = function (cardID, next) {
    if (this.teamRaidInfo.state !== consts.Raid.STATE_TEAM_GET_CARD)
        return next(null, {code: consts.Code.FAIL});
    if (this.teamRaidInfo.cardsSelectedMems.indexOf(this.entity.id) !== -1)
        return next(null, {code: consts.Code.FAIL});
    if (this.teamRaidInfo.cardsList.indexOf(cardID) === -1)
        return next(null, {code: consts.Code.FAIL});
    let self = this;
    self._callTeamRaidEnt('getCard', cardID, function (resp) {
        if (resp.code === consts.Code.OK) {
            let member = self.getTeamRaidMember(self.entity.id);
            if (member) {
                member.cards.push(cardID);
                self.teamRaidInfo.cardsSelectedMems.push(self.entity.id)
            }
        }
        next(null, resp);
    });
};

// 队员已经获取卡牌
pro.onTeamRaidMemberGetCard = function (memberID) {
    this.teamRaidInfo.cardsSelectedMems.push(memberID);
    this.entity.sendMessage('onTeamRaidMemberGetCard', {uid: memberID});
};

// 跳过获取卡牌
pro.teamRaidIgnoreGetCard = function (next) {
    if (this.teamRaidInfo.state !== consts.Raid.STATE_TEAM_GET_CARD)
        return next(null, {code: consts.Code.FAIL});
    if (this.teamRaidInfo.cardsSelectedMems.indexOf(this.entity.id) !== -1)
        return next(null, {code: consts.Code.FAIL});
    let self = this;
    self._callTeamRaidEnt('ignoreGetCard ', function (resp) {
        if (resp.code === consts.Code.OK) {
            let member = self.getTeamRaidMember(self.entity.id);
            if (member) {
                self.teamRaidInfo.cardsSelectedMems.push(self.entity.id)
            }
        }
        next(null, resp);
    });
};

// 通关了组队副本
pro.onTeamRaidPass = function () {
    this._resetTeamRaidInfo();
    this.entity.sendMessage('onTeamRaidPass', {});
};

// 组队副本失败
pro.onTeamRaidFail = function () {
    this._resetTeamRaidInfo();
    this.entity.sendMessage('onTeamRaidFail', {});
};
