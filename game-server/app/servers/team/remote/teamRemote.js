/**
 * Date: 2018/9/20
 * Author: liuguolai
 * Description:
 */
module.exports = function(app) {
    return new Remote(app);
};

let Remote = function(app) {
    this.app = app;
};

let pro = Remote.prototype;

pro.buildTeam = function (teamType, specialId, entInfo, cb) {
    this.app.teamStub.buildTeam(teamType, specialId, entInfo, cb);
};

pro.leaveTeam = function (uid, cb) {
    this.app.teamStub.leaveTeam(uid, cb);
};

pro.joinUserTeam = function (teamUid, teamId, applyInfo, cb) {
    this.app.teamStub.joinUserTeam(teamUid, teamId, applyInfo, cb);
};

pro.kickMember = function (captainID, memberID, cb) {
    this.app.teamStub.kickMember(captainID, memberID, cb);
};

pro.setTeamReadyOff = function (uid, cb) {
    this.app.teamStub.setTeamReadyOff(uid, cb);
};

pro.setTeamReadyOn = function (uid, cb) {
    this.app.teamStub.setTeamReadyOn(uid, cb);
};

pro.beginTeamMatch = function (uid, cb) {
    this.app.teamStub.beginTeamMatch(uid, cb);
};

pro.updateMatchPunishBeginTime = function (uid, pbt, cb) {
    this.app.teamStub.updateMatchPunishBeginTime(uid, pbt, cb);
};
