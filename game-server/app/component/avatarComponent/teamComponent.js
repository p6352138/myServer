/**
 * Date: 2018/9/7
 * Author: liuguolai
 * Description: 队伍组件
 */
let util = require('util');
let pomelo = require('pomelo');
let Component = _require('../component');
let consts = _require('../../common/consts');
let utils = _require('../../util/utils');
let rankTpl = _require('../../data/Rank');
let raidTpl = _require('../../data/Raid');

let TeamComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(TeamComponent, Component);
module.exports = TeamComponent;

let pro = TeamComponent.prototype;

pro.init = function (opts) {
    this.teamType = "";
    this.teamMaxNum = 0;  // 队伍允许最大人数
    this.teamId = "";  // 队伍entity的UUID
    this.specialId = 0;  // 特殊ID，副本时代表副本ID
    this.members = [];
    this.invitedList = {};  // 邀请列表
    this.applyList = {};  // 求邀列表

    this.entity.safeBindEvent("EventDisconnect", this._onDisconenct.bind(this));
    this.entity.safeBindEvent("EventReconnect", this._onReconnect.bind(this));
};

pro.getClientInfo = function () {
    let invitedList = [], applyList = [];
    for (let i in this.invitedList) {
        invitedList.push(this.invitedList[i]);
    }
    for (let i in this.applyList) {
        applyList.push(this.applyList[i]);
    }
    return {
        teamId: this.teamId,
        teamType: this.teamType,
        specialId: this.specialId,
        members: this._getClientMembersInfo(),
        invitedList: invitedList,
        applyList: applyList,
    }
};

pro._onDisconenct = function () {
    if (this.hasJoined()) {
        // 给两分钟的缓冲，允许重连
        this.leaveTimer = setTimeout(this.leaveTeam.bind(this), 120 * 1000);
    }
    // this.leaveTeam();
};

pro._onReconnect = function () {
    if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
    }
};

// 远程调用接口
pro._callRemote = function (funcName, ...args) {
    pomelo.app.rpc.team.teamRemote[funcName](null, ...args);
};

pro.hasJoined = function () {
    return this.members.length > 0;
};

pro.hasMember = function (avtID) {
    for (let member of this.members) {
        if (member.id === avtID)
            return true;
    }
    return false;
};

pro.isCaptin = function () {
    if (this.hasJoined() && this.members[0].id === this.entity.id) {
        return true;
    }
    return false;
};

pro.isFull = function () {
    return this.members.length >= this.teamMaxNum;
};

pro.isReady = function () {
    for (let member of this.members) {
        if (member.id === this.entity.id) {
            if (member.ready)
                return true;
            return false;
        }
    }
    return false;
};

pro._genPropInfo = function () {
    return {
        id: this.entity.id,
        openid: this.entity.openid,
        level: this.level,
        name: this.entity.name,
        sid: pomelo.app.getServerId(),
        sls: this.entity.ladder.singleLadderScore,
        tls: this.entity.ladder.teamLadderScore,
        rank: this.entity.ladder.rank,
        pbt: this.entity.match.punishBeginTime
    }
};

/* *
 * 创建队伍
 * @param: specialId 副本时表示副本id
 */
pro.buildTeam = function (teamType, specialId, next) {
    if (teamType !== consts.Team.TYPE_LADDER && teamType !== consts.Team.TYPE_PRACTICE
        && teamType !== consts.Team.TYPE_RAID) {
        next(null, {code: consts.TeamCode.TYPE_ERR});
        return;
    }
    // 惩罚中
    if (this.entity.match.isInPunish()) {
        return next(null, {code: consts.TeamCode.IN_PUNISH});
    }
    if (this.hasJoined()) {
        next(null, {code: consts.TeamCode.IN_TEAM});
        return;
    }
    if (this.entity.match.inMatching) {
        return next(null, {code: consts.TeamCode.MATCHING});
    }
    // 组队副本
    if (teamType === consts.Team.TYPE_RAID) {
        if (!(specialId in raidTpl)) {
            return next(null, {code: consts.Code.FAIL});
        }
        if (this.entity.level < raidTpl[specialId].RequireLevel) {
            return next(null, {code: consts.TeamCode.LEVEL_LIMIT});
        }
    }
    this._callRemote('buildTeam', teamType, specialId, this._genPropInfo(), function (resp) {
        next(null, resp);
    });
};

pro._getClientMembersInfo = function () {
    let infos = [];
    for (let member of this.members) {
        infos.push({
            id: member.id,
            openid: member.openid,
            pos: member.pos,
            ready: member.ready,
            punishBeginTime: member.pbt,
            rank: member.rank
        })
    }
    return infos;
};

pro.onRefreshTeam = function (teamId, teamType, specialId, members) {
    this.teamId = teamId;
    this.specialId = specialId;
    this.teamType = teamType;
    if (this.teamType === consts.Team.TYPE_RAID) {
        this.teamMaxNum = raidTpl[this.specialId].RequirePlayers;
    }
    else {
        this.teamMaxNum = consts.Team.MAX_NUM;
    }
    this.members = members;
    let infos = this._getClientMembersInfo();
    this.entity.sendMessage('onRefreshTeam', {
        teamId: this.teamId,
        teamType: this.teamType,
        specialId: this.specialId,
        members: infos,
    });
    if (this.members.length > 0) {
        this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.TEAM);
    } else {
        this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.ONLINE);
    }
};

pro.setTeamType = function (teamType) {
    this.teamType = teamType;
};

// 离开队伍
pro.leaveTeam = function (next) {
    if (!this.hasJoined()) {
        utils.invokeCallback(next, null, {code: consts.TeamCode.NOT_IN_TEAM});
        return;
    }
    this._callRemote('leaveTeam', this.entity.id, function (resp) {
        utils.invokeCallback(next, null, resp);
    })
};

// 离开队伍的回调，可能是被踢
pro.onLeaveTeam = function () {
    this.onRefreshTeam("", "", 0, []);
    this.emit('EventLeaveTeam', this.entity);
};

pro._getInviteInfo = function () {
    return {
        id: this.entity.id,
        openid: this.entity.openid,
        teamType: this.teamType,
        rank: this.entity.ladder.rank,
        teamId: this.teamId,
        specialId: this.specialId
    }
};

// 邀请入队
pro.invite = function (avtID, next) {
    if (!this.hasJoined()) {
        return next(null, {code: consts.TeamCode.NOT_IN_TEAM});
    }
    if (this.hasMember(avtID)) {
        next(null, {code: consts.TeamCode.IN_MY_TEAM});
        return;
    }
    if (this.isFull()) {
        return next(null, {code: consts.TeamCode.TEAM_FULL});
    }
    // 去掉申请列表
    if (avtID in this.applyList) {
        delete this.applyList[avtID];
    }
    this.entity.callAvatar(avtID, 'onTeamInvited', this._getInviteInfo(), function (resp) {
        next(null, resp);
    })
};

pro._checkCanJoinTeam = function (teamInfo) {
    if (this.entity.isBusy()) {
        return consts.TeamCode.PLAYING;
    }
    if (this.entity.match.isInPunish()) {
        return consts.TeamCode.IN_PUNISH;
    }
    let teamType = teamInfo.teamType;
    // 天梯
    if (teamType === consts.Team.TYPE_LADDER) {
        if (this.entity.level < consts.Team.LADDER_NEED_LV)
            return consts.TeamCode.LEVEL_LIMIT;
        if (Math.abs(rankTpl[this.entity.ladder.rank].Type - rankTpl[teamInfo.rank].Type) > 1)
            return consts.TeamCode.RAND_LIMIT;
        if (this.entity.hero.heroNum() < consts.Team.HERO_NEED_NUM)
            return consts.TeamCode.HERO_NUM_LIMIT;
    }
    else if (teamType === consts.Team.TYPE_PRACTICE) {
        if (this.entity.level < consts.Team.PRACTICE_NEED_LV)
            return consts.TeamCode.LEVEL_LIMIT;
    }
    else if (teamType === consts.Team.TYPE_RAID) {
        let raidID = teamInfo.specialId;
        if (this.entity.level < raidTpl[raidID].RequireLevel)
            return consts.TeamCode.LEVEL_LIMIT;
    }
    return consts.TeamCode.OK;
};

// 被邀请
pro.onTeamInvited = function (teamInfo, cb) {
    let code = this._checkCanJoinTeam(teamInfo);
    if (code === consts.TeamCode.OK) {
        this.invitedList[teamInfo.id] = teamInfo;
        this.entity.sendMessage('onTeamInvited', teamInfo);
    }
    cb({code: code});
};

// 同意邀请
pro.acceptInvite = function (avtID, teamId, next) {
    if (this.entity.isBusy()) {
        return next(null, {code: consts.TeamCode.PLAYING});
    }
    if (this.entity.match.isInPunish()) {
        return next(null, {code: consts.TeamCode.IN_PUNISH});
    }
    let teamInfo = this.invitedList[avtID];
    if (!teamInfo) {
        return next(null, {code: consts.Code.FAIL});
    }
    this._callRemote('joinUserTeam', avtID, teamId, this._genPropInfo(), function (resp) {
        next(null, resp);
    });
};

// 拒绝邀请
pro.refuseInvite = function (avtID, next) {
    let teamInfo = this.invitedList[avtID];
    if (!teamInfo) {
        return next(null, {code: consts.Code.FAIL});
    }
    delete this.invitedList[avtID];
    this.entity.callAvatar(avtID, 'onTeamBeRefused', {name: this.entity.name}, null);
    next(null, {code: consts.TeamCode.OK});
};

// 被拒
pro.onTeamBeRefused = function (info, cb) {
    this.entity.sendMessage('onTeamBeRefused', info);
    cb();
};

// 忽略邀请
pro.ignoreTeamInvite = function (avtID, next) {
    if (avtID in this.invitedList) {
        delete this.invitedList[avtID];
    }
    next(null, {code: consts.TeamCode.OK});
};

pro._getApplyInfo = function () {
    return {
        id: this.entity.id,
        openid: this.entity.openid,
        rank: this.entity.ladder.rank
    }
};

// 申请入队
pro.applyForJoin = function (avtID, next) {
    if (this.entity.isBusy()) {
        return next(null, {code: consts.Code.FAIL});
    }
    if (this.entity.match.isInPunish()) {
        return next(null, {code: consts.TeamCode.IN_PUNISH});
    }
    this.entity.callAvatar(avtID, 'onTeamApplyed', this._getApplyInfo(), function (resp) {
        next(null, resp);
    });
};

pro._checkCanAcceptApply = function(applyerInfo) {
    if (!this.hasJoined())
        return consts.TeamCode.NOT_IN_TEAM;
    // 天梯
    if (this.teamType === consts.Team.TYPE_LADDER) {
        if (Math.abs(rankTpl[this.entity.ladder.rank].Type - rankTpl[applyerInfo.rank].Type) > 1)
            return consts.TeamCode.RAND_LIMIT;
    }
    return consts.TeamCode.OK;
};

// 被申请
pro.onTeamApplyed = function (applyerInfo, cb) {
    let code = this._checkCanAcceptApply(applyerInfo);
    if (code === consts.TeamCode.OK) {
        applyerInfo["teamType"] = this.teamType;
        applyerInfo["teamId"] = this.teamId
        applyerInfo["specialId"] = this.specialId;
        this.applyList[applyerInfo.id] = applyerInfo;
        this.entity.sendMessage('onTeamApplyed', applyerInfo);
    }
    cb({code: code});
};

// 忽略求邀
pro.ignoreTeamApply = function (avtID, next) {
    if (avtID in this.applyList) {
        delete this.applyList[avtID];
    }
    next(null, {code: consts.TeamCode.OK});
};

// 请离队伍
pro.kickMember = function (avtID, next) {
    if (avtID === this.entity.id) {
        return next(null, {code: consts.Code.FAIL});
    }
    if (!this.hasMember(avtID)) {
        return next(null, {code: consts.TeamCode.MEMBER_NOT_EXIST});
    }
    if (!this.isCaptin()) {
        return next(null, {code: consts.TeamCode.NOT_CAPTAIN});
    }
    this._callRemote('kickMember', this.entity.id, avtID, function (resp) {
        next(null, resp)
    });
};

// 被提出队伍
pro.onTeamBeKicked = function () {
    this.entity.sendMessage('onTeamBeKicked', {});
};

// 取消准备
pro.setTeamReadyOff = function (next) {
    if (!this.hasJoined()) {
        return next(null, {code: consts.TeamCode.NOT_IN_TEAM});
    }
    if (this.isCaptin()) {
        return next(null, {code: consts.TeamCode.CAPTAIN_LIMIT});
    }
    if (!this.isReady()) {
        return next(null, {code: consts.TeamCode.READY_OFF_ALREADY});
    }
    this._callRemote('setTeamReadyOff', this.entity.id, function (resp) {
        next(null, resp)
    });
};

// 准备
pro.setTeamReadyOn = function (next) {
    if (!this.hasJoined()) {
        return next(null, {code: consts.TeamCode.NOT_IN_TEAM});
    }
    if (this.isCaptin()) {
        return next(null, {code: consts.TeamCode.CAPTAIN_LIMIT});
    }
    if (this.isReady()) {
        return next(null, {code: consts.TeamCode.READY_ON_ALREADY});
    }
    this._callRemote('setTeamReadyOn', this.entity.id, function (resp) {
        next(null, resp)
    });
};

// 队员准备转态改变通知
pro.onTeamReadyStateChange = function (memberID, newState) {
    for (let member of this.members) {
        if (member.id === memberID) {
            member.ready = newState;
            this.entity.sendMessage('onTeamReadyStateChange', {
                id: memberID,
                ready: newState,
            })
            return;
        }
    }
};

pro._checkCanBeginTeamMatch = function () {
    if (this.entity.match.inMatching)
        return consts.Code.FAIL;
    if (!this.isCaptin()) {
        return consts.TeamCode.NOT_CAPTAIN;
    }
    let timeNow = new Date().getTime(), punishTime = consts.Match.PUNISH_TIME * 1000;
    for (let member of this.members) {
        if (member.pbt) {
            if (timeNow - member.pbt < punishTime)
                return consts.TeamCode.IN_PUNISH;
        }
    }
    return consts.TeamCode.OK;
};

// 开始匹配
pro.beginTeamMatch = function (next) {
    let code = this._checkCanBeginTeamMatch();
    if (code !== consts.TeamCode.OK)
        return next(null, {code: code});
    this._callRemote('beginTeamMatch', this.entity.id, function (resp) {
        next(null, resp);
    });
};

pro.destroy = function () {
    this.leaveTeam();
    Component.prototype.destroy.call(this);
};
