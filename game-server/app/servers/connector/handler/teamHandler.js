/**
 * Date: 2018/9/20
 * Author: liuguolai
 * Description: 队伍相关接口
 */
module.exports = function (app) {
    return new Handler(app);
};

let Handler = function (app) {
    this.app = app;
};

let handler = Handler.prototype;

handler.buildTeam = function (msg, session, next) {
    session.avatar.team.buildTeam(msg.teamType, msg.specialId || 0, next);
};

handler.leaveTeam = function (msg, session, next) {
    session.avatar.team.leaveTeam(next);
};

handler.invite = function (msg, session, next) {
    session.avatar.team.invite(msg.id, next);
};

handler.acceptInvite = function (msg, session, next) {
    session.avatar.team.acceptInvite(msg.id, msg.teamId, next);
};

handler.refuseTeamInvite = function (msg, session, next) {
    session.avatar.team.refuseInvite(msg.id, next);
};

handler.ignoreTeamInvite = function (msg, session, next) {
    session.avatar.team.ignoreTeamInvite(msg.id, next);
};

handler.applyForJoin = function (msg, session, next) {
    session.avatar.team.applyForJoin(msg.id, next);
};

handler.ignoreTeamApply = function (msg, session, next) {
    session.avatar.team.ignoreTeamApply(msg.id, next);
};

handler.kickTeamMember = function (msg, session, next) {
    session.avatar.team.kickMember(msg.id, next);
};

handler.setTeamReadyOff = function (msg, session, next) {
    session.avatar.team.setTeamReadyOff(next);
};

handler.setTeamReadyOn = function (msg, session, next) {
    session.avatar.team.setTeamReadyOn(next);
};

handler.beginTeamMatch = function (msg, session, next) {
    session.avatar.team.beginTeamMatch(next);
};
