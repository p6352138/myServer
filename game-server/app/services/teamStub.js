/**
 * Date: 2018/9/7
 * Author: liuguolai
 * Description:  队伍管理
 */
let logger = require('pomelo-logger').getLogger('game', 'teamStub');
let Team = _require('../entity/team');
let consts = _require('../public/consts');
let utils = _require('../util/utils');
var pomelo = require('pomelo');

let TeamStub = function (opts) {
    opts = opts || {};
    this.teams = {};
    this.ids = {};  // 玩家id对应信息
};

module.exports = TeamStub;
let pro = TeamStub.prototype;

pro.createEmptyTeam = function (teamType, specialId) {
    let team = new Team(this, teamType, specialId);
    this.teams[team.id] = team;
    return team;
};

pro.buildTeam = function (teamType, specialId, entInfo, cb) {
    if (entInfo.id in this.ids)
        return cb({code: consts.TeamCode.IN_TEAM});
    let team = this.createEmptyTeam(teamType, specialId);
    this.ids[entInfo.id] = {
        teamID: team.id,
        sid: entInfo.sid,
    }
    cb({code: consts.TeamCode.OK});
    team.addMember(entInfo);
};

pro.getTeam = function (uid) {
    let teamID = this.ids[uid].teamID;
    return this.teams[teamID];
};

pro.leaveTeam = function (uid, cb) {
    if (!(uid in this.ids))
        return utils.invokeCallback(cb, {code: consts.TeamCode.NOT_IN_TEAM});
    let team = this.getTeam(uid);
    if (team.size() <= 1) {
        // 解散队伍
        this.dismissTeam(uid);
    }
    else {
        team.delMember(uid);
    }
    utils.invokeCallback(cb, {code: consts.TeamCode.OK});
};

// 解散队伍
pro.dismissTeam = function (uid) {
    let team = this.getTeam(uid);
    if (!team.isCaptainID(uid))
        return false;
    team.destroy();
    return true;
};

// 加入teamUid所在的队伍
pro.joinUserTeam = function (teamUid, teamId, applyInfo, cb) {
    if (!(teamUid in this.ids))
        return cb({code: consts.TeamCode.TEAM_NOT_EXIST});
    let team = this.getTeam(teamUid), applyID = applyInfo.id;
    // 队伍唯一性判断
    if (team.id !== teamId) {
        return cb({code: consts.TeamCode.TEAM_NOT_EXIST});
    }
    if (!team.canJoin(applyID)) {
        return cb({code: consts.TeamCode.TEAM_FULL});
    }
    // 原本在队伍中，先离开队伍
    if (applyID in this.ids) {
        this.leaveTeam(applyID);
    }
    this.ids[applyID] = {
        teamID: team.id,
        sid: applyInfo.sid,
    }
    team.addMember(applyInfo);
    cb({code: consts.TeamCode.OK});
};

// 请离队伍
pro.kickMember = function (captainID, memberID, cb) {
    if (!(captainID in this.ids))
        return cb({code: consts.TeamCode.TEAM_NOT_EXIST});
    let team = this.getTeam(captainID);
    if (!team.isCaptainID(captainID))
        return cb({code: consts.TeamCode.NOT_CAPTAIN});
    if (!team.hasMember(memberID))
        return cb({code: consts.TeamCode.MEMBER_NOT_EXIST});
    let sid = this.ids[memberID].sid;
    this.leaveTeam(memberID);
    // 通知被踢
    pomelo.app.rpc.connector.entryRemote.onTeamBeKicked.toServer(sid, memberID, null);
    cb({code: consts.TeamCode.OK});
};

pro._checkCanChangeState = function (team, uid, toState) {
    if (team.isCaptainID(uid))
        return consts.TeamCode.CAPTAIN_LIMIT;
    if (!toState && !team.isMemberReady(uid))
        return consts.TeamCode.READY_OFF_ALREADY;
    if (toState && team.isMemberReady(uid))
        return consts.TeamCode.READY_ON_ALREADY;
    return consts.TeamCode.OK;
};

// 取消准备
pro.setTeamReadyOff = function (uid, cb) {
    if (!(uid in this.ids))
        return cb({code: consts.TeamCode.TEAM_NOT_EXIST});
    let team = this.getTeam(uid);
    let code = this._checkCanChangeState(team, uid, 0);
    if (code === consts.TeamCode.OK) {
        team.changeReadyState(uid);
    }
    cb({code: code});
};

// 准备
pro.setTeamReadyOn = function (uid, cb) {
    if (!(uid in this.ids))
        return cb({code: consts.TeamCode.TEAM_NOT_EXIST});
    let team = this.getTeam(uid);
    let code = this._checkCanChangeState(team, uid, 1);
    if (code === consts.TeamCode.OK) {
        team.changeReadyState(uid);
    }
    cb({code: code});
};

// 开始匹配
pro.beginTeamMatch = function (uid, cb) {
    if (!(uid in this.ids))
        return cb({code: consts.TeamCode.TEAM_NOT_EXIST});
    let team = this.getTeam(uid);
    if (!team.isCaptainID(uid))
        return cb({code: consts.TeamCode.NOT_CAPTAIN});
    if (!team.canMatch())
        return cb({code: consts.TeamCode.NOT_READY});
    team.beginTeamMatch();
    cb({code: consts.TeamCode.OK});
};

// 更新匹配惩罚时间
pro.updateMatchPunishBeginTime = function (uid, pbt, cb) {
    if (!(uid in this.ids))
        return cb();
    let team = this.getTeam(uid);
    team.updateMatchPunishBeginTime(uid, pbt);
    cb();
};
