/**
 * Date: 2018/7/25
 * Author: liuguolai
 * Description:
 */
var Component = _require('../component');
var util = _require('util');
var consts = _require('../../common/consts');
var pomelo = _require('pomelo');

var DungeonCtrl = function (entity) {
    Component.call(this, entity);
};

util.inherits(DungeonCtrl, Component);
module.exports = DungeonCtrl;

var pro = DungeonCtrl.prototype;

pro.init = function (opts) {
    this.dgEntId = 0;
    this.fightServer = null;
    this.inDungeon = false;
};

// 设置副本信息
pro.setDungeonInfo = function (fightServer, dgEntId) {
    this.dgEntId = dgEntId;
    this.fightServer = fightServer;
    this.inDungeon = true;
    this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.PLAYING);
};

// 顶号或重连后获取当前副本信息
pro.relayCheckDungeonInfo = function () {
    var self = this;
    if (!self.inDungeon)
        return;
    pomelo.app.rpc.fight.fightRemote.getDungeonInfo.toServer(self.fightServer, self.dgEntId, self.entity.id, function (code, dgInfo) {
        if (code === consts.DungeonStatus.END) {
            self.inDungeon = false;
            self.entity.logger.error("dungeon end without notify? ");
            return;
        }
        self.entity.sendMessage('onDungeonReconnect', dgInfo);
    });
};

// 副本结束
pro.fightEnd = function (inTeam, info) {
    this.inDungeon = false;
    let result = info.result;
    this.entity.sendMessage('onFightEnd', {
        result: result
    });
    if (!this.entity.isBusy())
        this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.ONLINE);
    let teamType = info.teamType;
    // 天梯，更新天梯分
    if (teamType === consts.Team.TYPE_LADDER) {
        this.entity.ladder.onLadderFightEnd(result, inTeam, info.score);
    }
    else if (teamType === consts.Team.TYPE_RAID) {
        if (inTeam) {  // 组队副本
            this.entity.raid.onTeamRaidDungeonResult(result, info.membersAttri);
        }
        else {
            this.entity.raid.onRaidDungeonResult(info.raidID, info.roomIdx, result, {
                attri: info.attri,
            })
        }
    }
};

// 加载超时
pro.loadTimeout = function (names) {
    this.inDungeon = false;
    this.entity.sendMessage('onLoadTimeout', {
        names: names
    });
    this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.ONLINE);
};
