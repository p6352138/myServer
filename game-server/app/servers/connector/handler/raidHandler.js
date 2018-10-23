/**
 * Date: 2018/10/8
 * Author: liuguolai
 * Description: 副本相关rpc接口
 */
module.exports = function(app) {
    return new Handler(app);
};

let Handler = function(app) {
    this.app = app;
};

let handler = Handler.prototype;

handler.raidSelectHero = function (msg, session, next) {
    session.avatar.raid.raidSelectHero(msg.raidID, msg.heroid, next);
};

handler.raidSelectAndEnterRoom = function (msg, session, next) {
    session.avatar.raid.raidSelectAndEnterRoom(msg.raidID, parseInt(msg.roomIdx), parseInt(msg.idx), next);
};

handler.raidEnterRoom = function (msg, session, next) {
    session.avatar.raid.raidEnterRoom(msg.raidID, parseInt(msg.roomIdx), next);
};

handler.raidGetCard = function (msg, session, next) {
    session.avatar.raid.raidGetCard(msg.raidID, parseInt(msg.cardID), next);
};

/* ********************************************************* */

handler.teamRaidSelectHero = function (msg, session, next) {
    session.avatar.raid.teamRaidSelectHero(msg.heroid, next);
};

handler.teamRaidConfirmHero = function (msg, session, next) {
    session.avatar.raid.teamRaidConfirmHero(next);
};

handler.teamRaidSelectRoom = function (msg, session, next) {
    session.avatar.raid.teamRaidSelectRoom(msg.roomIdx, next);
};

handler.teamRaidGetCard = function (msg, session, next) {
    session.avatar.raid.teamRaidGetCard(msg.cardID, next);
};

handler.teamRaidIgnoreGetCard = function (msg, session, next) {
    session.avatar.raid.teamRaidIgnoreGetCard(next);
};
