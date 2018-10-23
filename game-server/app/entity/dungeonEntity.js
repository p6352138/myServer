/**
 * Date: 2018/6/20
 * Author: liuguolai
 * Description: 管理一场战斗里的各种状态
 */
var Entity = _require('./entity');
var util = _require('util');
var pomelo = _require('pomelo');
var consts = _require('../public/consts');
var messageService = _require('../services/messageService');
var heroTbl = _require('../data/Hero');
var dungeonTpl = _require('../data/Dungeon');
var monsterGroupTpl = _require('../data/Group');
var entityFactory = _require('./entityFactory');
var matrixTpl = _require('../data/Matrix');
var fightHelper = _require('../helper/fightHelper');
var constTpl = _require('../data/Constant');

var DungeonEntity = function (opts) {
    opts = opts || {};
    opts.components = ['gm', 'summons', 'dps'];
    Entity.call(this, opts);

    var channelService = pomelo.app.get('channelService');
    this.teamType = null;
    this.matchType = pomelo.app.getCurServer().fight;
    this.matchNum = pomelo.app.getCurServer().matchNum;
    this.channel = channelService.getChannel(this.id, true);
    this.dgId = 0;
    this.isPVP = true;
    this.teamA = null;
    this.teamB = null;

    this.prepareMems = {};  // 需要准备的成员
    this.prepareInfo = {};
    this.confirmMembers = null;  // 还没有准备的玩家

    this.groupA = {};
    this.groupB = {};
    this.formationA = [];  // 阵型
    this.formationB = [];
    this.matrixIDA = 5;  // 阵型编号
    this.matrixIDB = 5;

    this.inFight = false;
    this.loadMembers = null;  // 正在加载的玩家
    this.loadMemProgress = null;  // 玩家加载进度

    this.timer = null;

    this.status = consts.DungeonStatus.END;
    this.statusEndTime = 0;
};

util.inherits(DungeonEntity, Entity);
module.exports = DungeonEntity;

var pro = DungeonEntity.prototype;

pro.initFight = function (teamType, dgId, teamA, teamB, extraData) {
    let self = this;
    self.extraData = extraData;
    self.dgId = dgId;
    self.teamType = teamType;
    if (teamType === consts.Team.TYPE_LADDER || teamType === consts.Team.TYPE_PRACTICE) {
        this.isPVP = true;
    }
    else {
        this.isPVP = false;
    }
    self.teamA = teamA;
    self.teamB = teamB;

    self.prepareMems = {};
    self.confirmMembers = new Set();
    var teamInfo = {
        'teamA': [],
        'teamB': [],
    };
    var channelInfo = {};  // 用于为每个玩家创建channel
    for (var uid in teamA) {
        var sid = teamA[uid].sid;
        self.channel.add(uid, sid);
        channelInfo[uid] = sid;
        self.prepareMems[uid] = sid;
        self.confirmMembers.add(uid);
        teamInfo['teamA'].push({
            uid: uid,
            openid: teamA[uid].openid,
            name: teamA[uid].name
        })
    }
    for (var uid in teamB) {
        var sid = teamB[uid].sid;
        self.channel.add(uid, sid);
        channelInfo[uid] = sid;
        self.prepareMems[uid] = sid;
        self.confirmMembers.add(uid);
        teamInfo['teamB'].push({
            uid: uid,
            openid: teamB[uid].openid,
            name: teamB[uid].name,
        })
    }
    this.channelInfo = channelInfo;
    // 设置状态
    this.status = consts.DungeonStatus.IN_SELECT_HERO;
    this.statusEndTime = new Date().getTime() + 1000 * constTpl.ReadyTimer;
    let serverId = pomelo.app.get('serverId');

    if (this.teamType === consts.Team.TYPE_RAID) {
        // 副本模式直接加载进入战斗
        // 获取当前副本的出战英雄数据
        if (this.extraData.teamRaidEnt) {  // 团队副本
            this.prepareInfo = this.extraData.teamRaidEnt.getHeroInfo();
            this._startLoad();
            for (let uid in self.prepareMems) {
                pomelo.app.rpc.connector.entryRemote.onTeamRaidEnterDungeon.toServer(
                    self.prepareMems[uid], uid, serverId, self.id, null
                );
            }
        }
        else {
            for (let uid in self.prepareMems) {
                pomelo.app.rpc.connector.entryRemote.onRaidReady.toServer(
                    self.prepareMems[uid], uid, serverId, self.id, self.extraData.raidID, function (uid, code, prepareInfo) {
                        if (code === consts.Code.FAIL) {
                            self.logger.error("get fighter[%s] prepareInfo failed.", uid);
                        }
                        self.prepareInfo[uid] = prepareInfo;
                        delete self.prepareMems[uid];
                        // 进入加载
                        if (Object.getOwnPropertyNames(self.prepareMems).length === 0) {
                            this._startLoad();
                        }
                    }.bind(self, uid))
            }
        }
        return;
    }
    for (var uid in self.prepareMems) {
        pomelo.app.rpc.connector.entryRemote.onMatchReady.toServer(
            self.prepareMems[uid], uid, serverId, self.id, teamInfo, function (uid, code, prepareInfo) {
                if (code === consts.Code.FAIL) {
                    self.logger.error("get fighter[%s] prepareInfo failed.", uid);
                }
                self.prepareInfo[uid] = prepareInfo;
                delete self.prepareMems[uid];
                // 进入选英雄，30s后进入10s倒计时
                if (Object.getOwnPropertyNames(self.prepareMems).length === 0) {
                    this.timer = setTimeout(self._beforeLoadCountDown.bind(self), 1000 * constTpl.ReadyTimer);
                }
            }.bind(self, uid))
    }
};

// 玩家选择英雄
pro.selectHero = function (uid, heroid) {
    if (!(heroid in this.prepareInfo[uid].heros))
        return consts.SelectHeroCode.NOT_EXIST;
    if (!this.confirmMembers.has(uid))
        return consts.SelectHeroCode.ALREADY_CONFIRMED;

    var team = this.teamA;
    if (this.teamB.hasOwnProperty(uid)) {
        team = this.teamB;
    }
    for (var _uid in team) {
        if (team[_uid].heroid == heroid)
            return consts.SelectHeroCode.BE_SELECEED;
    }

    team[uid].heroid = heroid;
    this.logger.info("%s select heroid: ", uid, heroid);
    // 通知队友， todo: 看下耗不耗，考虑改用channel
    notifyToTeamOtherMem(uid, team, 'onSelectHeroNotify', {uid: uid, heroid: heroid});
    return consts.SelectHeroCode.OK;
};

var notifyToTeamOtherMem = function (uid, team, route, msg) {
    var uids = [];
    for (var _uid in team) {
        if (_uid === uid)
            continue
        uids.push({uid: _uid, sid: team[_uid].sid});
    }
    if (uids.length) {
        messageService.pushMessageByUids(uids, route, msg);
    }
};

// 玩家确认角色
pro.confirmHero = function(uid) {
    if (this.status !== consts.DungeonStatus.IN_SELECT_HERO)
        return consts.Code.FAIL;
    var team = this.teamA;
    if (this.teamB.hasOwnProperty(uid)) {
        team = this.teamB;
    }
    var heroid = team[uid].heroid;
    if (!heroid)
        return consts.Code.FAIL;
    this.confirmMembers.delete(uid);
    notifyToTeamOtherMem(uid, team, 'onConfirmHeroNotify', {uid: uid, heroid: heroid});
    // 全都准备完毕
    if (this.confirmMembers.size === 0) {
        this._beforeLoadCountDown();
    }
    return consts.Code.OK;
};

pro._getSelectedHeroids = function () {
    var beSelectdHeroid = new Set();
    var team = this.teamA;
    for (var uid in team) {
        var heroid = team[uid].heroid;
        if (heroid) {
            beSelectdHeroid.add(heroid);
        }
    }
    var team = this.teamB;
    for (var uid in team) {
        var heroid = team[uid].heroid;
        if (heroid) {
            beSelectdHeroid.add(heroid);
        }
    }
    return beSelectdHeroid;
}

// 进入前倒计时
pro._beforeLoadCountDown = function () {
    if (this.status === consts.DungeonStatus.IN_BEFORE_LOAD_CD)
        return;
    this.logger.info(Object.getOwnPropertyNames(this.prepareInfo), "enter count down.");
    clearTimeout(this.timer);
    this.confirmMembers.clear();
    // 设置状态
    this.status = consts.DungeonStatus.IN_BEFORE_LOAD_CD;
    this.statusEndTime = new Date().getTime() + 1000 * constTpl.ReadyStartTimer;
    // 选英雄结果
    var info = {};
    var beSelectdHeroid = this._getSelectedHeroids();
    var teams = [this.teamA, this.teamB];
    for (var team of teams){
        for (var uid in team) {
            var heroid = team[uid].heroid;
            // 没有选择英雄
            if (!heroid) {
                // 随机一个
                var validHeros = new Set(Object.getOwnPropertyNames(this.prepareInfo[uid].heros).map(Number));
                for (var heroid of beSelectdHeroid) {
                    if (validHeros.has(heroid))
                        validHeros.delete(heroid);
                }
                var index = Math.floor(Math.random() * validHeros.size);
                team[uid].heroid = Array.from(validHeros)[index] || 1000;
                beSelectdHeroid.add(team[uid].heroid);
            }
            info[uid] = team[uid].heroid;
        }
    }
    this.channel.pushMessage('onEnterLoadCD', info);
    this.timer = setTimeout(this._startLoad.bind(this), 1000 * constTpl.ReadyStartTimer);
    delete beSelectdHeroid;
};

// 选角结束，加载进入战斗
pro._startLoad = function () {
    this.logger.info(Object.getOwnPropertyNames(this.prepareInfo), 'start load.');
    clearTimeout(this.timer);
    // 通知各个avatar, 提供加载信息
    var teamA = this.teamA;
    var teamB = this.teamB;
    var teamInfo = {
        teamA: [],
        teamB: []
    };
    this.loadMembers = new Set();
    this.loadMemProgress = {};
    // groupA
    this.formationA = Object.getOwnPropertyNames(teamA);
    this.formationA.sort(function (a, b) {
        return heroTbl[teamA[a].heroid]["PosPriority"] - heroTbl[teamA[b].heroid]["PosPriority"];
    })
    for (let uid in teamA) {
        let ent = teamA[uid];
        let heroid, lv, cards, attri;
        if (this.teamType === consts.Team.TYPE_RAID) {
            let info = this.prepareInfo[uid].heroInfo;
            heroid = info.heroid;
            lv = 1;
            cards = info.cards;
            attri = info.attri;
        }
        else {
            heroid = ent.heroid;
            lv = this.prepareInfo[uid].heros[heroid].lv;
            cards = heroTbl[heroid]["InitialDrawPile"];
        }
        let player = entityFactory.createEntity("Player", uid, {
            owner: this,
            uid: uid,
            sid: ent.sid,
            name: ent.name,
            heroid: heroid,
            cards: cards,
            groupId: "groupA",
            lv: lv,
            pos: this.formationA.indexOf(uid) + 1,
            channelInfo: this.channelInfo
        })
        // 覆盖原始属性
        player.updateAttri(attri);
        this.groupA[uid] = player;
        this.loadMembers.add(uid);
        teamInfo.teamA.push(player.getBrocastInfo());
    }

    // groupB
    if (this.isPVP) {
        this.formationB = Object.getOwnPropertyNames(teamB);
        this.formationB.sort(function (a, b) {
            return heroTbl[teamB[a].heroid]["PosPriority"] - heroTbl[teamB[b].heroid]["PosPriority"];
        })
        for (var uid in teamB) {
            var heroid = teamB[uid].heroid;
            var player = entityFactory.createEntity("Player", uid, {
                owner: this,
                uid: uid,
                sid: teamB[uid].sid,
                name: teamB[uid].name,
                heroid: heroid,
                cards: heroTbl[heroid]["InitialDrawPile"],
                groupId: "groupB",
                lv: this.prepareInfo[uid].heros[heroid].lv,
                pos: this.formationB.indexOf(uid) + 1,
                channelInfo: this.channelInfo
            })
            this.groupB[uid] = player;
            this.loadMembers.add(uid);
            teamInfo.teamB.push(player.getBrocastInfo());
        }
    }
    else {
        // monster
        var monsterGroupID = dungeonTpl[this.dgId].MonsterGroupID;
        var monsterGroup = monsterGroupTpl[monsterGroupID].MonsterGroup;
        this.matrixIDB = monsterGroupTpl[monsterGroupID].Matrix;
        for (var pos in monsterGroup) {
            var monsterid = monsterGroup[pos];
            var monster = entityFactory.createEntity("Monster", null, {
                owner: this,
                monsterid: monsterid,
                groupId: "groupB",
                pos: parseInt(pos),
                channelInfo: this.channelInfo
            })
            this.groupB[monster.id] = monster;
            this.formationB[parseInt(pos) - 1] = monster.id;
            teamInfo.teamB.push(monster.getBrocastInfo());
        }
    }

    // 初始化双方的仇恨列表
    this._initHatredList();

    if (this.isPVP) {
        // PVP时纯随机
        var dgIds = Object.keys(dungeonTpl);
        this.dgId = Number(dgIds[Math.floor(Math.random() * dgIds.length)]);
    }

    // 通知
    for (var uid in teamA) {
        messageService.pushMessageToPlayer(
            {uid: uid, sid: teamA[uid].sid}, 'onStartLoad', {
                myInfo: this.groupA[uid].getClentInfo(),
                teamInfo: teamInfo,
                dgId: this.dgId,
                matchType: this.matchType,
                matchNum: this.matchNum,
                spawnSummons: this.summons.spawnSummons,
            })
    }
    if (this.isPVP) {
        for (var uid in teamB) {
            messageService.pushMessageToPlayer(
                {uid: uid, sid: teamB[uid].sid}, 'onStartLoad', {
                    myInfo: this.groupB[uid].getClentInfo(),
                    teamInfo: teamInfo,
                    dgId: this.dgId,
                    matchType: this.matchType,
                    matchNum: this.matchNum,
                    spawnSummons: this.summons.spawnSummons,
                })
        }
    }
    // 设置状态
    this.status = consts.DungeonStatus.IN_LOAD;
    // 定义最长加载时间
    this.inFight = false;
    this.timer = setTimeout(this._loadFailEnd.bind(this), 1000 * 60);
};

// 进战统一初始化双方仇恨列表
pro._initHatredList = function () {
    var enemiesB = Object.getOwnPropertyNames(this.groupB);
    for (var uid in this.groupA) {
        this.groupA[uid].hatred.initEnemiesHatred(enemiesB);
    }
    var enemiesA = Object.getOwnPropertyNames(this.groupA);
    for (var uid in this.groupB) {
        this.groupB[uid].hatred.initEnemiesHatred(enemiesA);
    }
};

// uid 加载进度
pro.loadProgress = function (uid, progress) {
    this.loadMemProgress[uid] = progress;
    this.broadcast('onLoadProgress', {
        uid: uid,
        progress: progress
    });
};

// uid 加载完成
pro.loadFinished = function (uid) {
    if (this.status !== consts.DungeonStatus.IN_LOAD)
        return;
    this.loadMembers.delete(uid);
    this.loadMemProgress[uid] = 100;
    this.broadcast('onLoadProgress', {
        uid: uid,
        progress: 100
    });
    if (this.loadMembers.size === 0) {
        this._fightBegin();
    }
};

// 有人没加载完，结束战斗
pro._loadFailEnd = function () {
    var names = [];
    for (var uid of this.loadMembers) {
        let ent = this.getMember(uid);
        names.push(ent.name);
    }
    this.broadcastToAvatar('onLoadTimeout', names);
    this.destroy();
};

// 战斗正式开始
pro._fightBegin = function () {
    if (this.inFight)
        return;
    clearTimeout(this.timer);
    this.logger.info(Object.getOwnPropertyNames(this.prepareInfo), 'fight begin.');
    // 设置状态
    this.status = consts.DungeonStatus.IN_FIGHT;
    var timeLimit = dungeonTpl[this.dgId].TimeLimit * 1000;
    this.statusEndTime = new Date().getTime() + timeLimit;
    this.inFight = true;
    // 注册死亡事件
    for (var uid in this.groupA) {
        var ent = this.groupA[uid];
        ent.state.on("EventDie", this._onEntityDie.bind(this));
    }
    for (var uid in this.groupB) {
        var ent = this.groupB[uid];
        ent.state.on("EventDie", this._onEntityDie.bind(this));
    }
    // 进入战斗
    this.channel.pushMessage('onFightBegin', {});
    this._callAllMembersFunc('fightBegin');
    // 战斗时间3分钟
    this.timer = setTimeout(this._fightEnd.bind(this), timeLimit);
};

// 对象死亡，判断能否结束
pro._onEntityDie = function (entity) {
    // 延时处理
    setTimeout(this._checkEnd.bind(this, entity), 0);
};

pro._checkEnd = function (entity) {
    var groupId = entity.groupId;
    var group = this._getGroupById(groupId);
    for (var uid in group) {
        if (group[uid].state.isAlive())
            return;
    }
    clearTimeout(this.timer);
    // 该组全部死亡
    let groupAResult, groupBResult;
    if (groupId === "groupA") {
        groupAResult = consts.FightResult.LOSE;
        groupBResult = consts.FightResult.WIN;
    }
    else {
        groupAResult = consts.FightResult.WIN;
        groupBResult = consts.FightResult.LOSE;
    }
    this._notifyFightResult(groupAResult, groupBResult);
    // 销毁 todo: 这里只默认只有一场
    this.destroy();
};

pro._notifyFightResult = function (groupAResult, groupBResult) {
    let groupAInfo = {
        teamType: this.teamType,
        result: groupAResult
    };
    let groupBInfo = {
        teamType: this.teamType,
        result: groupBResult
    }
    // 天梯
    if (this.teamType === consts.Team.TYPE_LADDER) {
        let totalScore = 0, totalMem = 0;
        for (let uid in this.teamA) {
            totalScore += this.teamA[uid].score;
            totalMem += 1;
        }
        let teamAScoreAvg = Math.floor(totalScore / totalMem);
        totalScore = 0, totalMem = 0;
        for (let uid in this.teamB) {
            totalScore += this.teamB[uid].score;
            totalMem += 1;
        }
        let teamBScoreAvg = Math.floor(totalScore / totalMem);
        let scoreResult = fightHelper.calcLadderScore(teamAScoreAvg, teamBScoreAvg, groupAResult);
        groupAInfo["score"] = scoreResult[0];
        groupBInfo["score"] = scoreResult[1];
    }
    else if (this.teamType === consts.Team.TYPE_RAID) {  // 副本
        if (this.extraData.teamRaidEnt) {  // 组队
            let membersAttri = {};
            for (let uid in this.teamA) {
                let unit = this.groupA[uid];
                membersAttri[uid] = {
                    hp: unit.hp,
                    maxHp: unit.maxHp
                }
            }
            groupAInfo["membersAttri"] = membersAttri;
        }
        else {
            groupAInfo["raidID"] = this.extraData["raidID"];
            groupAInfo["roomIdx"] = this.extraData["roomIdx"];
        }
    }
    for (let uid in this.teamA) {
        let ent = this.teamA[uid];
        // 单人
        if (this.teamType === consts.Team.TYPE_RAID && !this.extraData.teamRaidEnt) {
            let unit = this.groupA[uid];
            groupAInfo["attri"] = {
                hp: unit.hp,
                maxHp: unit.maxHp
            }
        }
        pomelo.app.rpc.connector.entryRemote.onDungeonFinish.toServer(
            ent.sid, uid, ent.inTeam, groupAInfo, null);
    }
    for (let uid in this.teamB) {
        let ent = this.teamA[uid];
        pomelo.app.rpc.connector.entryRemote.onDungeonFinish.toServer(
            ent.sid, uid, ent.inTeam, groupBInfo, null);
    }
    // 组队副本
    if (this.teamType === consts.Team.TYPE_RAID && this.extraData.teamRaidEnt) {
        this.extraData.teamRaidEnt.onDungeonEnd(groupAResult, groupAInfo.membersAttri);
    }

    // debug
    this.dps.onFightEnd();
};

// 战斗结束
pro._fightEnd = function () {
    if (this.isPVP) {
        var groupAAliveNum = 0, groupBAliveNum = 0;
        for (var uid in this.groupA) {
            var ent = this.groupA[uid];
            if (ent.isA("Player") && ent.state.isAlive())
                groupAAliveNum ++;
        }
        for (var uid in this.groupB) {
            var ent = this.groupB[uid];
            if (ent.isA("Player") && ent.state.isAlive())
                groupBAliveNum ++;
        }
        let groupAResult = consts.FightResult.DRAW, groupBResult = consts.FightResult.DRAW;
        if (groupAAliveNum > groupBAliveNum) {
            groupAResult = consts.FightResult.WIN;
            groupBResult = consts.FightResult.LOSE;
        }
        else if (groupAAliveNum < groupBAliveNum) {
            groupAResult = consts.FightResult.LOSE;
            groupBResult = consts.FightResult.WIN;
        }
        this._notifyFightResult(groupAResult, groupBResult);
    }
    else {
        // PVE没战胜即失败
        this._notifyFightResult(consts.FightResult.LOSE, consts.FightResult.WIN);
    }
    // 销毁
    this.destroy();
};

// 调用函数
pro._callAllMembersFunc = function (func) {
    var group = this.groupA
    for (var uid in group) {
        group[uid][func]();
    }
    group = this.groupB
    for (var uid in group) {
        group[uid][func]();
    }
};

pro.getMember = function (uid) {
    return this.groupA[uid] || this.groupB[uid];
};

pro._getOppositeGroupId = function (groupId) {
    if (groupId === "groupA")
        return "groupB";
    else if (groupId === "groupB")
        return "groupA";
    else
        throw new Error(this.id + " unknow groupId:" + groupId);
};

pro._getGroupById = function (groupId, opposite) {
    if (opposite)
        groupId = this._getOppositeGroupId(groupId);
    var group = null;
    if (groupId === "groupA") {
        group = this.groupA;
    }
    else if (groupId === "groupB")
    {
        group = this.groupB;
    }
    else
        throw new Error(this.id + " unknow groupId:" + groupId);
    return group;
};

// 获取group成员
pro.getGroupMembers = function (groupId, opposite) {
    var group = this._getGroupById(groupId, opposite);
    var result = [];
    for (var uid in group) {
        result.push(group[uid]);
    }
    return result;
};

// 获取空位
pro.getEmptyPositions = function (groupId) {
    var emptyPoses = [];
    if ("groupA" === groupId) {
        var poses = Object.getOwnPropertyNames(matrixTpl[this.matrixIDA].MatrixPos).map(Number);
        for (var pos of poses) {
            if (!this.formationA[pos - 1]) {
                emptyPoses.push(pos);
            }
        }
    }
    else {
        var poses = Object.getOwnPropertyNames(matrixTpl[this.matrixIDB].MatrixPos).map(Number);
        for (var pos of poses) {
            if (!this.formationB[pos - 1]) {
                emptyPoses.push(pos);
            }
        }
    }
    return emptyPoses;
};

// 创建怪物
pro.createMonster = function (groupId, pos, monsterID) {
    if (groupId === "groupA") {
        var group = this.groupA;
        var formation = this.formationA;
        var oppositeGroup = this.groupB;
    }
    else {
        var group = this.groupB;
        var formation = this.formationB;
        var oppositeGroup = this.groupA;
    }
    var enemyIDs = Object.getOwnPropertyNames(oppositeGroup);
    var monster = entityFactory.createEntity("Monster", null, {
        owner: this,
        monsterid: monsterID,
        groupId: groupId,
        pos: pos,
        channelInfo: this.channelInfo,
    });
    // 维护战斗双方的仇恨列表
    monster.hatred.initEnemiesHatred(enemyIDs);
    for (var uid in oppositeGroup) {
        oppositeGroup[uid].hatred.set(monster.id, 1);
    }
    monster.fightBegin();  // 进入战斗状态
    group[monster.id] = monster;
    formation[pos - 1] = monster.id;
    // 死亡监听
    monster.state.on("EventDie", this._onEntityDie.bind(this));
    this.broadcast('onAddMonster', {
        monsterInfo: monster.getBrocastInfo(),
    });
};

// 创建分身
pro.createShadowMonsters = function (caster, monsterID, poses, time, bRandom) {
    var groupId = caster.groupId;
    if (groupId === "groupA") {
        var group = this.groupA;
        var formation = this.formationA;
        var oppositeGroup = this.groupB;
    }
    else {
        var group = this.groupB;
        var formation = this.formationB;
        var oppositeGroup = this.groupA;
    }
    // 位置随机（连同本体）
    if (bRandom) {
        var oldPos = caster.pos;
        poses.push(oldPos);
        fightHelper.shuffle(poses);
        var newPos = poses.pop();
        if (oldPos != newPos) {
            caster.pos = newPos;
            formation[oldPos - 1] = undefined;
            formation[newPos - 1] = caster.id;
        }
    }
    var enemyIDs = Object.getOwnPropertyNames(oppositeGroup);
    var newEntsInfo = [];
    for (var pos of poses) {
        var monster = entityFactory.createEntity("Monster", null, {
            owner: this,
            monsterid: monsterID,
            groupId: groupId,
            pos: pos,
            channelInfo: this.channelInfo,
            isSummon: true,
            time: time,
            creator: caster,
        });
        monster.hp = caster.hp;
        // 维护战斗双方的仇恨列表
        monster.hatred.initEnemiesHatred(enemyIDs);
        for (var uid in oppositeGroup) {
            oppositeGroup[uid].hatred.set(monster.id, 1);
        }
        monster.fightBegin();  // 进入战斗状态
        group[monster.id] = monster;
        formation[pos - 1] = monster.id;
        newEntsInfo.push(monster.getBrocastInfo());
    }
    this.broadcast('onAddMonsterSummon', {
        casterID: caster.id,
        casterPos: caster.pos,
        newEnts: newEntsInfo,
    })
};

// 召唤物（分身）移除
pro.shadowMonsterDestroy = function (groupId, entID) {
    if (groupId === "groupA") {
        var group = this.groupA;
        var formation = this.formationA;
        var oppositeGroup = this.groupB;
    }
    else {
        var group = this.groupB;
        var formation = this.formationB;
        var oppositeGroup = this.groupA;
    }
    delete group[entID];
    var idx = formation.indexOf(entID);
    formation[idx] = undefined;
    this.broadcast('onRemoveMonsterSummon', {
        entID: entID
    })
    // 仇恨维护
    for (var uid in oppositeGroup) {
        oppositeGroup[uid].hatred.remove(entID);
    }
};

// 数据广播
pro.broadcast = function (func, data) {
    this.channel.pushMessage(func, data);
};

// 对象广播(默认带上avtID)
pro.broadcastToAvatar = function (func, ...data) {
    for (let uid in this.groupA) {
        let ent = this.groupA[uid];
        if (ent.isA("Player")) {
            pomelo.app.rpc.connector.entryRemote[func].toServer(
                ent.sid, ent.id, ...data, null);
        }
    }
    for (let  uid in this.groupB) {
        let ent = this.groupB[uid];
        if (ent.isA("Player")) {
            pomelo.app.rpc.connector.entryRemote[func].toServer(
                ent.sid, ent.id, ...data, null);
        }
    }
};

/**
 * 出牌
 * @param uid: 玩家id
 * @param idx: 手牌位置
 * @param cid: card id
 * @param tid: target id
 */
pro.playCard = function (uid, idx, cid, tid) {
    var player = this.getMember(uid);
    var target = this.getMember(tid);
    var errCode = player.cardCtrl.checkCanUseCard(idx, cid, tid);
    if (errCode != consts.FightCode.OK) {
        return errCode;
    }
    // todo: 使用判断，队伍、目标等判断
    player.cardCtrl.actualUseCard(idx, cid, tid);
    return errCode;
};

// 重连顶号获取当前副本信息
pro.getCurrInfo = function (fromUid) {
    var info = {
        dgId: this.dgId,
        status: this.status,
        matchType: this.matchType,
        matchNum: this.matchNum,
    }
    if (this.status === consts.DungeonStatus.IN_SELECT_HERO) {
        var teamA = [], teamB = [];
        for (var uid in this.teamA) {
            teamA.push({
                uid: uid,
                heroid: this.teamA[uid].heroid || 0,
                name: this.teamA[uid].name
            });
        }
        for (var uid in this.teamB) {
            teamB.push({
                uid: uid,
                heroid: this.teamB[uid].heroid || 0,
                name: this.teamB[uid].name
            });
        }
        info["teamInfo"] = {
            teamA: teamA,
            teamB: teamB
        }
        info["unconfirm"] = Array.from(this.confirmMembers);  // 未确认
        info["leftTime"] = this.statusEndTime - new Date().getTime();
    }
    else if (this.status === consts.DungeonStatus.IN_BEFORE_LOAD_CD) {
        var teamA = [], teamB = [];
        for (var uid in this.teamA) {
            teamA.push({
                uid: uid,
                heroid: this.teamA[uid].heroid || 0,
                name: this.teamA[uid].name
            });
        }
        for (var uid in this.teamB) {
            teamB.push({
                uid: uid,
                heroid: this.teamB[uid].heroid || 0,
                name: this.teamB[uid].name
            });
        }
        info["teamInfo"] = {
            teamA: teamA,
            teamB: teamB
        }
        info["leftTime"] = this.statusEndTime - new Date().getTime();
    }
    else if (this.status === consts.DungeonStatus.IN_LOAD || this.status === consts.DungeonStatus.IN_FIGHT) {
        var teamA = [], teamB = [];
        for (var uid in this.groupA) {
            teamA.push(this.groupA[uid].getBrocastInfo());
        }
        for (var uid in this.groupB) {
            teamB.push(this.groupB[uid].getBrocastInfo());
        }
        info["teamInfo"] = {
            teamA: teamA,
            teamB: teamB
        }
        info["myInfo"] = this.getMember(fromUid).getClentInfo();
        info["spawnSummons"] = this.spawnSummons;
        if (this.status === consts.DungeonStatus.IN_LOAD) {
            info["loadMemProgress"] = this.loadMemProgress;
        }
        else if (this.status === consts.DungeonStatus.IN_FIGHT) {
            info["leftTime"] = this.statusEndTime - new Date().getTime();
        }
    }
    return info;
};

pro.destroy = function () {
    if (this.isDestroyed()) {
        console.error("duplicate destroy.");
        return;
    }
    if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
    }
    this.prepareMems = null;
    this.prepareInfo = null;
    for (var uid in this.groupA) {
        var ent = this.groupA[uid];
        ent.destroy();
    }
    for (var uid in this.groupB) {
        var ent = this.groupB[uid];
        ent.destroy();
    }
    this.groupA = null;
    this.groupB = null;
    this.formationA = null;
    this.formationB = null;
    this.spawnSummons = null;
    this.extraData = null;

    this.channel = null;
    var channelService = pomelo.app.get('channelService');
    channelService.destroyChannel(this.id);
    Entity.prototype.destroy.call(this);
};
