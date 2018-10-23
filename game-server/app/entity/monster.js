/**
 * Date: 2018/6/26
 * Author: liuguolai
 * Description:
 */
var util = _require('util');
var CombatBaseEntity = _require('./combatBaseEntity');
var monsterTpl = _require('../data/Monster');

var Monster = function (opts) {
    opts = opts || {};
    opts.components = ['state', 'cardCtrl', 'skillCtrl', 'combat', 'prop', 'hatred', 'buffCtrl', 'AI'];  // avatar组件
    CombatBaseEntity.call(this, opts);

    this.uid = this.id;
    this.monsterid = opts.monsterid;
    this.groupId = opts.groupId;  // 所在组，判断是否队友
    this.pos = opts.pos;  // 站位

    this.isSummon = opts.isSummon || false;  // 是否是召唤物(分身)
    if (this.isSummon) {
        this._summonInit(opts);
    }

    this._initProp();
    var config = monsterTpl[this.monsterid];
    this.cardCtrl.initCards(config.InitialDrawPile, config.InitialCard);

    // 初始buff
    var initialBuff = config.InitialBuff;
    for (var buffID in initialBuff) {
        var buffData = initialBuff[buffID];
        this.buffCtrl.addBuff(buffID, buffData[0], buffData[1], this.id);
    }
};

util.inherits(Monster, CombatBaseEntity);
module.exports = Monster;

var pro = Monster.prototype;

var propConfigMap = {
    lv: "Level",
    hp: "MaxHP",  // 生命
    maxHp: "MaxHP",  // 最大生命
    mp: "InitialMP",  // 灵力
    maxMp: "MaxMP",  // 最大灵力
    thew: "MaxThew",  // 体力
    maxThew: "MaxThew",  // 最大体力
    armor: "BaseArmor",  // 护甲
    strength: "BaseStrength",  // 力量
    stamina: "BaseStamina",  // 耐力
    intellect: "BaseIntellect",  // 智慧
    agile: "BaseAgile", // 敏捷
};

// 根据配表初始化战斗属性
pro._initProp = function () {
    var monsterData = monsterTpl[this.monsterid];
    for (var prop in propConfigMap) {
        this[prop] = monsterData[propConfigMap[prop]];
    }
};

pro.getBrocastInfo = function () {
    return {
        uid: this.id,
        monsterid: this.monsterid,
        inHandsNum: this.cardCtrl.inHands.length,
        lv: this.lv,
        hp: this.hp,
        maxHp: this.maxHp,
        mp: this.mp,
        maxMp: this.maxMp,
        thew: this.thew,
        maxThew: this.maxThew,
        armor: this.armor,
        buffs: this.buffCtrl.getClientInfo(),
        pos: this.pos,
        scale: this.scale,
        groupId: this.groupId,
    }
};

// 作为召唤物时初始化
pro._summonInit = function (opts) {
    this.destroyTimer = setTimeout(this._onTimerDestroy.bind(this), opts.time * 1000);
    this.creator = opts.creator;
    this.creatorDieFunc = this._onCreatorDie.bind(this);
    this.creator.state.on("EventDie", this.creatorDieFunc);
};

pro._onCreatorDie = function () {
    // 造物主死了，我也就挂了
    this._onTimerDestroy();
};

pro.updateFightData = function (reason, data) {

};

pro.broadcastFightData = function (data) {
    this.owner.broadcast("onFightAttriUpdate", {
        [this.id]: data
    })
};

pro.fightBegin = function () {
    this.cardCtrl.startDrawTimer();
    CombatBaseEntity.prototype.fightBegin.call(this);
    // ai
    var monsterData = monsterTpl[this.monsterid];
    if (monsterData.AIStrategy) {
        this.AI.reset(monsterData.AIStrategy, (monsterData.AITick * 1000) || 200);
    }
};

pro.fightEnd = function () {
    this.cardCtrl.stopDrawTimer();
    CombatBaseEntity.prototype.fightEnd.call(this);
};

pro.destroy = function () {
    if (this.destroyTimer) {
        clearTimeout(this.destroyTimer);
        this.destroyTimer = null;
    }
    if (this.creatorDieFunc) {
        if (!this.creator.isDestroyed())
            this.creator.state.removeListener("EventDie", this.creatorDieFunc);
        this.creatorDieFunc = null;
    }
    this.fightEnd();
    CombatBaseEntity.prototype.destroy.call(this);
};

// 时间到自销毁
pro._onTimerDestroy = function () {
    this.owner.shadowMonsterDestroy(this.groupId, this.id);
    this.destroy();
};
