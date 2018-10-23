/**
 * Date: 2018/10/11
 * Author: liuguolai
 * Description:
 */
let entityFactory = _require('../../../entity/entityFactory');
let entityManager = _require('../../../services/entityManager');
var consts = _require('../../../common/consts');

module.exports = function(app) {
    return new TeamRaidRemote(app);
};

let TeamRaidRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

let pro = TeamRaidRemote.prototype;

pro.selectHero = function (teamRaidEntId, uid, heroid, cb) {
    let teamRaidEnt = entityManager.getEntity(teamRaidEntId);
    if (!teamRaidEnt) {
        return cb({code: consts.Code.FAIL});
    }
    teamRaidEnt.selectHero(uid, heroid, cb);
};

pro.confirmHero = function (teamRaidEntId, uid, cb) {
    let teamRaidEnt = entityManager.getEntity(teamRaidEntId);
    if (!teamRaidEnt) {
        return cb({code: consts.Code.FAIL});
    }
    teamRaidEnt.confirmHero(uid, cb);
};

pro.selectRoom = function (teamRaidEntId, uid, idx, cb) {
    let teamRaidEnt = entityManager.getEntity(teamRaidEntId);
    if (!teamRaidEnt) {
        return cb({code: consts.Code.FAIL});
    }
    teamRaidEnt.selectRoom(uid, idx, cb);
};

pro.getCard = function (teamRaidEntId, uid, cardID, cb) {
    let teamRaidEnt = entityManager.getEntity(teamRaidEntId);
    if (!teamRaidEnt) {
        return cb({code: consts.Code.FAIL});
    }
    teamRaidEnt.getCard(uid, cardID, cb);
};

pro.ignoreGetCard = function (teamRaidEntId, uid, cb) {
    let teamRaidEnt = entityManager.getEntity(teamRaidEntId);
    if (!teamRaidEnt) {
        return cb({code: consts.Code.FAIL});
    }
    teamRaidEnt.ignoreGetCard(uid, cb);
};

pro.leaveTeamRaid = function (teamRaidEntId, uid, cb) {
    let teamRaidEnt = entityManager.getEntity(teamRaidEntId);
    if (!teamRaidEnt) {
        return cb({code: consts.Code.FAIL});
    }
    teamRaidEnt.leaveTeamRaid(uid);
    cb({code: consts.Code.OK});
};
