/**
 * Date: 2018/7/3
 * Author: liuguolai
 * Description: 战斗实体基类定义
 */
var util = _require('util');
var Entity = _require('./entity');
var combatUnitProperty = _require('../component/combatUnitComponent/combatUnitProperty');
var consts = _require('../public/consts');
var fightHelper = _require('../helper/fightHelper');
var pomelo = _require('pomelo');
var constTpl = _require('../data/Constant');

var CombatBaseEntity = function (opts) {
    opts = opts || {};
    Entity.call(this, opts);

    this.owner = opts.owner;
    // 初始化战斗属性
    for (var property in combatUnitProperty) {
        this[property] = combatUnitProperty[property];
    }
    this._createChannel(opts.channelInfo);

    this.mpRecoverTime = opts.mpRecoverTime || constTpl.BaseMpRecover * 1000;  // 灵力恢复时间
    this.mpRecoverTimer = null;
    this.mpRecoverRate = 1;  // mp恢复速率
    this.endMpRecoverTime = 0;  // mp恢复倒计时结束时间
    this.stopMpRecoverTime = 0;  // 时间暂停时刻
    this.stopMpRecoverBuffCnt = 0;  // 停止恢复buff数量

    this.inFight = false;

    this.state.on("EventDie", this._onDie.bind(this));
    this.state.on("EventRelive", this._onRelive.bind(this));
};

util.inherits(CombatBaseEntity, Entity);
module.exports = CombatBaseEntity;

var pro = CombatBaseEntity.prototype;

pro._createChannel = function (channelInfo) {
    var channelService = pomelo.app.get('channelService');
    var name = this.owner.id + "_" + this.id;
    this.channelToOthers = channelService.getChannel(name, true);
    for (var uid in channelInfo) {
        if (uid == this.id)
            continue
        var sid = channelInfo[uid];
        this.channelToOthers.add(uid, sid);
    }
};

pro._onDie = function (entity) {
    console.log("xxxxxxxxxxxxxxxxxxxxx on die", this._kind, entity._kind);
    if (this !== entity)
        return;
    this.fightEnd();
};

pro._onRelive = function (entity) {
    console.log("xxxxxxxxxxxxxxxxxxxxx on relive", this._kind, entity._kind);
    if (this !== entity)
        return;
    this.fightBegin();
};

pro.fightBegin = function () {
    this.inFight = true;
    this.startMpRecoverTimer();
};

pro.fightEnd = function () {
    this.inFight = false;
    this.stopMpRecoverTimer();
};

pro.stopMpRecoverTimer = function () {
    if (this.mpRecoverTimer) {
        clearTimeout(this.mpRecoverTimer);
        this.mpRecoverTimer = null;
        this.stopMpRecoverTime = new Date().getTime();
        this.stopMpLeftTime = this.endMpRecoverTime - this.stopMpRecoverTime;
    }
};

pro._notifyMpRecoverRate = function () {
    this.updateFightData('onMpRecoverRateUpdate', {
        stopMpRecoverBuffCnt: this.stopMpRecoverBuffCnt,
        mpRecoverRate: this.mpRecoverRate
    });
};

// buff 改变mp恢复速率
pro.addMpRecoverRateBuff = function (rate) {
    if (rate === 0) {
        this.stopMpRecoverBuffCnt++;
        this.stopMpRecoverTimer();
        this._notifyMpRecoverRate();
        return;
    }
    this.mpRecoverRate = Math.round(this.mpRecoverRate * rate * 10000) / 10000;
    this._notifyMpRecoverRate();
    if (this.mpRecoverTimer) {
        this.stopMpRecoverTimer();
        var leftTime = this.endMpRecoverTime - this.stopMpRecoverTime;
        leftTime /= rate;
        this.endMpRecoverTime = this.stopMpRecoverTime + leftTime;
        this.mpRecoverTimer = setTimeout(this._recoverMp.bind(this), leftTime);
    }
};

pro.removeMpRecoverRateBuff = function (rate) {
    if (rate === 0) {
        this.stopMpRecoverBuffCnt--;
        if (this.stopMpRecoverBuffCnt <= 0 && this.inFight) {
            // 被强制暂停
            if (this.endMpRecoverTime) {
                var leftTime = this.stopMpLeftTime;
                leftTime /= this.mpRecoverRate;
                this.endMpRecoverTime = new Date().getTime() + leftTime;
                this.mpRecoverTimer = setTimeout(this._recoverMp.bind(this), leftTime);
            }
            else if (this.mp < this.maxMp) {
                this.startMpRecoverTimer();
            }
        }
        this._notifyMpRecoverRate();
        return;
    }
    this.mpRecoverRate = Math.round(this.mpRecoverRate / rate * 10000) / 10000;
    this._notifyMpRecoverRate();
    if (this.stopMpRecoverBuffCnt > 0)
        return;
    if (this.mpRecoverTimer) {
        this.stopMpRecoverTimer();
        var leftTime = this.endMpRecoverTime - this.stopMpRecoverTime;
        leftTime *= rate;
        this.endMpRecoverTime = this.stopMpRecoverTime + leftTime;
        this.mpRecoverTimer = setTimeout(this._recoverMp.bind(this), leftTime);
    }
};

// 开始灵力恢复倒计时
pro.startMpRecoverTimer = function () {
    if (this.mpRecoverTimer)
        return;
    // buff停止
    if (this.stopMpRecoverBuffCnt > 0)
        return;
    var time = this.mpRecoverTime / this.mpRecoverRate;
    this.endMpRecoverTime = new Date().getTime() + time;
    this.mpRecoverTimer = setTimeout(this._recoverMp.bind(this), time);
};

// 恢复灵力
pro._recoverMp = function () {
    this.mpRecoverTimer = null;
    this.endMpRecoverTime = 0;
    this.mp += 1;
    if (this.mp < this.maxMp) {
        this.startMpRecoverTimer();
    }
    this.updateFightData('onMpRecover', { mp: this.mp });
};

// 主动恢复灵力
pro.activeRecoverMp = function (mp, bForce) {
    if (!bForce && (mp <= 0 || this.mp >= this.maxMp))
        return;
    this.mp = Math.min(this.mp + mp, this.maxMp);
    if (this.mp === this.maxMp) {
        this.stopMpRecoverTimer();
        this.endMpRecoverTime = 0;
    }
    this.updateFightData('onGetMp', { mp: this.mp });
};

// 所有敌人
pro.getAllEnemies = function (filter) {
    var ents = this.owner.getGroupMembers(this.groupId, true);
    if (filter) {
        return ents.filter(filter);
    }
    return ents;
};

// 所有友方
pro.getAllFriends = function (filter) {
    var ents = this.owner.getGroupMembers(this.groupId);
    if (filter) {
        return ents.filter(filter);
    }
    return ents;
};

pro.updateFightData = function (reason, data) {
    throw new Error("no implement");
};

pro.broadcast = function (func, data) {
    this.owner.broadcast(func, data);
};

pro.broadcastToOthers = function (func, data) {
    this.channelToOthers.pushMessage(func, data);
};

pro.destroy = function () {
    this.fightEnd();

    this.channelToOthers = null;
    var channelService = pomelo.app.get('channelService');
    var name = this.owner.id + "_" + this.id;
    channelService.destroyChannel(name);
    Entity.prototype.destroy.call(this);
};
