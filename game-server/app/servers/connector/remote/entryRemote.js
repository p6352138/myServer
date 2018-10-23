/**
 * Date: 2018/6/12
 * Author: liuguolai
 * Description:
 */
var entityManager = _require('../../../services/entityManager');
var logger = _require('pomelo-logger').getLogger('game', __filename);
var consts = _require('../../../public/consts');

module.exports = function(app) {
    return new Remote(app);
};

var Remote = function(app) {
    this.app = app;
    this.sessionService = app.get('sessionService');
};

var pro = Remote.prototype;

// 被顶号（废弃，暂时保留）
pro.onRelayReady = function (avtID, cb) {
    var avatar = entityManager.getEntity(avtID);
    if (!avatar) {
        logger.error('be relay with no avt[%s]', avtID);
        cb();
        return;
    }
    this.app.get('sessionService').kick(avtID, "relay");
    avatar.destroy(function () {
        cb();
        logger.info("%s be relay.", avtID);
    });
};

// 匹配完成，进入选英雄
pro.onMatchReady = function (avtID, sid, dgEntId, teamInfo, cb) {
    var avatar = entityManager.getEntity(avtID);
    avatar.setSessionSetting("fightServer", sid);
    avatar.setSessionSetting("dgEntId", dgEntId);
    avatar.importSessionSetting(function (code) {
        avatar.match.clearMatchState();
        avatar.dungeon.setDungeonInfo(sid, dgEntId);
        avatar.sendMessage("onBeginSelect", {
            teamInfo: teamInfo
        });
        cb(code, {
            heros: avatar.hero.getOwnHerosInfo()
        });
    });
};

// 进入副本战斗，返回英雄数据
pro.onRaidReady = function (avtID, sid, dgEntId, raidID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.setSessionSetting("fightServer", sid);
    avatar.setSessionSetting("dgEntId", dgEntId);
    avatar.importSessionSetting(function (code) {
        avatar.match.clearMatchState();
        avatar.dungeon.setDungeonInfo(sid, dgEntId);
        let heroInfo = avatar.raid.getHeroInfoByRaidID(raidID);
        cb(code, {
            heroInfo: heroInfo
        });
    });
};

// 组队副本开始，选择英雄
pro.onTeamRaidBegin = function (avtID, sid, teamRaidEntId, teamInfo, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.setSessionSetting("fightServer", sid);
    avatar.setSessionSetting("teamRaidEntId", teamRaidEntId);
    avatar.importSessionSetting(function (code) {
        avatar.match.clearMatchState();
        avatar.raid.setTeamRaidInfo(sid, teamRaidEntId, teamInfo);
        avatar.sendMessage("onTeamRaidBeginSelectHero", {
            teamInfo: teamInfo
        });
        cb(code, {
            heros: avatar.hero.getOwnHerosInfo()
        });
    });
};

// 副本结束
pro.onDungeonFinish = function (avtID, inTeam, info, cb) {
    var avatar = entityManager.getEntity(avtID);
    avatar.dungeon.fightEnd(inTeam, info);
    avatar.removeSessionSetting("fightServer", true);
    cb();
};

// 加载超时，副本结束
pro.onLoadTimeout = function (avtID, names, cb) {
    var avatar = entityManager.getEntity(avtID);
    avatar.dungeon.loadTimeout(names);
    avatar.removeSessionSetting("fightServer", true);
    cb();
};

// 取消匹配
pro.onUnmatch = function (avtID, info, cb) {
    var avatar = entityManager.getEntity(avtID);
    avatar.match.onUnmatch(info);
    cb();
};

// 匹配开始
pro.onMatchBegin = function (avtID, matchInfo, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.match.onMatchBegin(matchInfo);
    cb();
};

// 进入匹配确认
pro.onEnterMatchConfirm = function (avtID, memList, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.match.onEnterMatchConfirm(memList);
    cb();
};

// 匹配确认
pro.onMatchConfirm = function (avtID, uid, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.match.onMatchConfirm(uid);
    cb();
};

// 匹配未确认
pro.onMatchNoConfirm = function (avtID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.match.onMatchNoConfirm();
    cb();
};

// 未确认惩罚
pro.onMatchNoConfirmPunish = function (avtID, punishBeginTime, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.match.onMatchNoConfirmPunish(punishBeginTime);
    cb();
};

/* *************************  friend begin  ************************* */

// 收到新的好友请求
pro.onNewInviter = function (avtID, inviterInfo, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.friend.onNewInviter(inviterInfo);
    cb();
};

// 好友请求被拒绝
pro.onAddFriendBeRefused = function (avtID, refuserName, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.friend.onAddFriendBeRefused(refuserName);
    cb();
};

// 新好友
pro.onNewFriend = function (avtID, friendEid, newFriendInfo, fromName, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.friend.onNewFriend(friendEid, newFriendInfo, fromName);
    cb();
};

// 删除好友
pro.onDeleteFriend = function (avtID, friendEid, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.friend.onDeleteFriend(friendEid);
    cb();
};

/* *************************  team begin  ************************* */

pro.onRefreshTeam = function (avtID, teamId, teamType, specialId, members, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onRefreshTeam(teamId, teamType, specialId, members);
    cb();
};

pro.onLeaveTeam = function (avtID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onLeaveTeam();
    cb();
};

pro.onTeamInvited = function (avtID, teamInfo, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onTeamInvited(teamInfo, cb);
};

pro.onTeamApplyed = function (avtID, applyerInfo, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onTeamApplyed(applyerInfo, cb);
};

pro.onTeamBeRefused = function (avtID, info, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onTeamBeRefused(info, cb);
};

pro.onTeamBeKicked = function (avtID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onTeamBeKicked();
    cb();
};

pro.onTeamReadyStateChange = function (avtID, memberID, newState, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.team.onTeamReadyStateChange(memberID, newState);
    cb();
};

/* *************************  team raid begin  ************************* */

pro.onTeamRaidSelectHero = function (avtID, memberID, heroid, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidSelectHero(memberID, heroid);
    cb();
};

pro.onTeamRaidConfirmHero = function (avtID, memberID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidConfirmHero(memberID);
    cb();
};

pro.onTeamRaidMemberUpdate = function (avtID, membersInfo, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidMemberUpdate(membersInfo);
    cb();
};

pro.onTeamRaidBeginSelectRoom = function (avtID, selectList, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidBeginSelectRoom(selectList);
    cb();
};

pro.onTeamRaidRoomSelected = function (avtID, memberID, idx, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidRoomSelected(memberID, idx);
    cb();
};

pro.onTeamRaidEnterDungeon = function (avtID, sid, dgEntId, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.setSessionSetting("fightServer", sid);
    avatar.setSessionSetting("dgEntId", dgEntId);
    avatar.importSessionSetting(function (code) {
        avatar.match.clearMatchState();
        avatar.dungeon.setDungeonInfo(sid, dgEntId);
        avatar.raid.onTeamRaidEnterDungeon();
        cb();
    });
};

pro.onTeamRaidBeginGetCard = function (avtID, cardsList, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidBeginGetCard(cardsList);
    cb();
};

pro.onTeamRaidMemberGetCard = function (avtID, memberID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidMemberGetCard(memberID);
    cb();
};

pro.onTeamRaidPass = function (avtID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidPass();
    cb();
};

pro.onTeamRaidFail = function (avtID, cb) {
    let avatar = entityManager.getEntity(avtID);
    avatar.raid.onTeamRaidFail();
    cb();
};
