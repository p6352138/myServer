var entityFactory = _require('../../../entity/entityFactory');
var entityManager = _require('../../../services/entityManager');
var consts = _require('../../../common/consts');

module.exports = function(app) {
	return new FightRemote(app);
};

var FightRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var pro = FightRemote.prototype;

pro.command = function (dgEntId, cmd, uid, params, cb) {
    var dungeonEntity = entityManager.getEntity(dgEntId);
    if (dungeonEntity) {
        dungeonEntity.gm[cmd](uid, ...params);
    }
    cb();
};

// 匹配成功，开启新的组队副本
pro.newTeamRaid = function (raidID, teamMembers, cb) {
    let teamRaidEntity = entityFactory.createEntity("TeamRaidEntity");
    teamRaidEntity.initTeamRaid(raidID, teamMembers);
    cb();
};

// 匹配成功，进入房间
pro.newFight = function (teamType, dgId, teamA, teamB, extraData, cb) {
    var dungeonEntity = entityFactory.createEntity("DungeonEntity");
    dungeonEntity.initFight(teamType, dgId, teamA, teamB, extraData);
    cb();
};

// 当前dungeon的信息
pro.getDungeonInfo = function (dgEntId, uid, cb) {
    var dungeonEntity = entityManager.getEntity(dgEntId);
    if (!dungeonEntity) {
        cb(consts.DungeonStatus.END);
        return;
    }
    var dungeonInfo = dungeonEntity.getCurrInfo(uid);
    cb(dungeonInfo.status, dungeonInfo);
};
