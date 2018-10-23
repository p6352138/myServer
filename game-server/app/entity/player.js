var fightHelper = _require('../helper/fightHelper');
var heroTpl = _require('../data/Hero');
var consts = _require('../public/consts');
var messageService = _require('../services/messageService');
var util = _require('util');
var CombatBaseEntity = _require('./combatBaseEntity');
var heroAttriTpl = _require('../data/HeroAttributes');

// 战斗对象，管理战斗逻辑
var Player = function (opts) {
    opts = opts || {};
    opts.components = ['state', 'cardCtrl', 'skillCtrl', 'combat', 'prop', 'hatred', 'buffCtrl', 'AI'];
    CombatBaseEntity.call(this, opts);

    this.uid = opts.uid;
    this.sid = opts.sid;
    this.heroid = opts.heroid;
    this.groupId = opts.groupId;  // 所在组，判断是否队友
    this.lv = opts.lv;
    this.name = opts.name;
    this.pos = opts.pos;  // 站位

    this._initProp();
    var config = heroTpl[this.heroid];
    var cards = opts.cards;
    this.cardCtrl.initCards(cards, config.InitialCard);
};

util.inherits(Player, CombatBaseEntity);
module.exports = Player;

var pro = Player.prototype;

var propConfigMap = {
    hp: "HeroMaxHP",  // 生命
    maxHp: "HeroMaxHP",  // 最大生命
    maxMp: "HeroMaxMP",  // 最大灵力
    thew: "HeroMaxThew",  // 体力
    maxThew: "HeroMaxThew",  // 最大体力
    armor: "HeroBaseArmor",  // 护甲
    strength: "HeroBaseStrength",  // 力量
    stamina: "HeroBaseStamina",  // 耐力
    intellect: "HeroBaseIntellect",  // 智慧
    agile: "HeroBaseAgile", // 敏捷
};

pro._initProp = function () {
    var heroData = heroTpl[this.heroid];
    this.mp = heroData.InitialMP;
    var heroAttriData = heroAttriTpl[this.heroid + this.lv];
    for (var prop in propConfigMap) {
        this[prop] = heroAttriData[propConfigMap[prop]];
    }
    // todo: 计算其他影响因素
};

pro.updateAttri = function (attri) {
    if (!attri)
        return;
    for (let key in attri) {
        this[key] = attri[key];
    }
};

// 获取信息，用于客户端信息加载
pro.getClentInfo = function () {
    return {
        mp: this.mp,
        thew: this.thew,
        cardsNum: this.cardCtrl.cards.length,
        discardsNum: this.cardCtrl.discards.length,
        exhaustsNum: this.cardCtrl.exhausts.length,
        mpRecoverTime: this.mpRecoverTime,
        mpRecoverRate: this.mpRecoverRate,
        stopMpRecoverBuffCnt: this.stopMpRecoverBuffCnt,
        inHands: this.cardCtrl.inHands,
        cardsLv: this.cardCtrl.getCardsLvInfo()
    }
};

pro.getBrocastInfo = function () {
    return {
        uid: this.id,
        heroid: this.heroid,
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
        name: this.name
    }
};

pro.fightBegin = function () {
    this.cardCtrl.startDrawTimer();
    CombatBaseEntity.prototype.fightBegin.call(this);
};

pro.fightEnd = function () {
    this.cardCtrl.stopDrawTimer();
    CombatBaseEntity.prototype.fightEnd.call(this);
};

// 数据推送
pro._notifyToClient = function (funcName, data) {
    messageService.pushMessageToPlayer({
        uid: this.uid,
        sid: this.sid
    }, funcName, data)
};

// 更新战斗数据
pro.updateFightData = function (funcName, data) {
    this._notifyToClient(funcName, data);
};

// 广播战斗数据
pro.broadcastFightData = function (data) {
    this.owner.broadcast("onFightAttriUpdate", {
        [this.uid]: data
    })
};

pro.destroy = function () {
    this.fightEnd();
    CombatBaseEntity.prototype.destroy.call(this);
};
