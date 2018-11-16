/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description: 匹配组件
 */
var pomelo = _require('pomelo');
var Component = _require('../component');
var util = _require('util');
var consts = _require('../../public/consts');

var MatchComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(MatchComponent, Component);
module.exports = MatchComponent;

var pro = MatchComponent.prototype;

pro.init = function (opts) {
    this.inMatching = false;
    this.matchNum = 0;  // 要求匹配人数
    this.dgId = 0;
    this.beginMatchTime = 0;  // 开始匹配时间
    this.predictTime = 0;  // 预计时间
    this.confirmList = [];  // 匹配确认列表
    this.alreadyConfirm = null;  // 已经确认列表
    this.punishBeginTime = 0;  // 惩罚开始时间

    this.entity.on("EventDisconnect", this._onDisconenct.bind(this));
};

pro._onDisconenct = function (entity) {
    if (this.inMatching) {
        this.unmatch();
    }
};

pro.getClientInfo = function () {
    let hadMatchTime = this.beginMatchTime ? new Date().getTime() - this.beginMatchTime : 0;
    let alreadyConfirm = this.alreadyConfirm ? Array.from(this.alreadyConfirm) : [];
    return {
        inMatching: this.inMatching,
        predictTime: this.predictTime,
        hadMatchTime: hadMatchTime,
        dgId: this.dgId,
        confirmList: this.confirmList,
        alreadyConfirm: alreadyConfirm,
        punishBeginTime: this.punishBeginTime,
    }
};

pro.setMatchStatus = function (inMatching, matchType, num, dgId) {
    this.inMatching = inMatching;
    if (inMatching) {
        this.matchNum = num;
        this.dgId = dgId;
    }
};

pro.clearMatchState = function () {
    this.inMatching = false;
    this.beginMatchTime = 0;
    this.confirmList = [];
    this.alreadyConfirm = null;
};

pro._checkCanBeginMatch = function (teamType, matchNum) {
    if (this.inMatching)
        return false;
    if (this.entity.team.hasJoined())
        return false;
    if (teamType === consts.Team.TYPE_LADDER) {
        if (matchNum !== consts.Team.MAX_NUM)
            return false;
        if (this.entity.level < consts.Team.LADDER_NEED_LV)
            return false;
    }
    else if (teamType === consts.Team.TYPE_PRACTICE) {
        if (matchNum !== consts.Team.MAX_NUM)
            return false;
        if (this.entity.level < consts.Team.PRACTICE_NEED_LV)
            return false;
    }
    else {
        return false;
    }
    return true;
};

pro._getMatchInfo = function () {
    return {
        id: this.entity.id,
        openid: this.entity.openid,
        name: this.entity.name,
        level: this.entity.level,
        sid: pomelo.app.getServerId(),
        sls: this.entity.ladder.singleLadderScore,
        tls: this.entity.ladder.teamLadderScore,
        rank: this.entity.ladder.rank
    }
};

pro.isInPunish = function () {
    if (this.punishBeginTime &&
        (new Date().getTime() - this.punishBeginTime < consts.Match.PUNISH_TIME * 1000)) {
        return true;
    }
    return false;
};

// 单人匹配
pro.match = function (teamType, matchNum, dgId, next) {
    if (this.isInPunish()) {
        return next(null, {code: consts.MatchCode.IN_PUNISH});
    }
    if (!this._checkCanBeginMatch(teamType, matchNum))
        return next(null, {code: consts.Code.FAIL});
    this.entity.team.setTeamType(teamType);
    pomelo.app.rpc.match.matchRemote.match(
        null, teamType, matchNum, this._getMatchInfo(), dgId, function (resp) {
            next(null, resp);
        });
};

// 取消匹配
pro.unmatch = function() {
    if (!this.inMatching) {
        return consts.Code.FAIL;
    }
    pomelo.app.rpc.match.matchRemote.unmatch(
        null, this.entity.team.teamType, this.matchNum, this.entity.id, null);
    return consts.Code.OK;
};

// 匹配开始
pro.onMatchBegin = function (matchInfo) {
    this.predictTime = matchInfo.predictTime;
    this.matchNum = matchInfo.matchNum;
    this.beginMatchTime = new Date().getTime();
    this.inMatching = true;
    // 有可能已经匹配成功
    if (!matchInfo.success) {
        this.entity.sendMessage('onBeginMatch', {
            predictTime: this.predictTime,
        })
    }
};

// 匹配取消
pro.onUnmatch = function (info) {
    this.clearMatchState();
    this.entity.sendMessage('onUnmatch', info);
};

// 进入匹配确认
pro.onEnterMatchConfirm = function (memList) {
    this.confirmList = memList;
    this.alreadyConfirm = new Set();
    this.entity.sendMessage('onEnterMatchConfirm', memList);
};

// 匹配确认
pro.matchConfirm = function (next) {
    if (!this.inMatching || this.confirmList.length === 0
        || this.alreadyConfirm.has(this.entity.id)) {
        return next(null, {code: consts.Code.FAIL});
    }
    pomelo.app.rpc.match.matchRemote.matchConfirm(
        null, this.entity.team.teamType, this.matchNum, this.entity.id, function (resp) {
            return next(null, resp);
        });
};

pro.onMatchConfirm = function (uid) {
    if (this.alreadyConfirm)
        this.alreadyConfirm.add(uid);
    this.entity.sendMessage('onMatchConfirm', {
        id: uid
    })
};

// 匹配未确认
pro.onMatchNoConfirm = function () {
    this.clearMatchState();
    this.entity.sendMessage('onMatchNoConfirm', {})
};

// 匹配未确认惩罚
pro.onMatchNoConfirmPunish = function (punishBeginTime) {
    this.punishBeginTime = punishBeginTime;
    if (this.entity.team.hasJoined()) {
        // pomelo.app.rpc.team.teamRemote.updateMatchPunishBeginTime(
        //     null, this.entity.id, punishBeginTime, null);
        // 退出队伍
        this.entity.team.leaveTeam();
    }
    this.entity.sendMessage('onPunishBeginTimeUpdate', {
        punishBeginTime: this.punishBeginTime
    })
};

pro.destroy = function () {
    if (this.inMatching) {
        this.unmatch(null);
    }
    Component.prototype.destroy.call(this);
};
