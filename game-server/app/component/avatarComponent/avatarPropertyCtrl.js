/**
 * Date: 2018/10/20
 * Author: liuguolai
 * Description:
 */
let Component = _require('../component');
let util = require('util');
let avatarProperty = _require('./avatarProperty');
let consts = _require('../../common/consts');
let constTpl = require('../../data/Constant');

let AvatarPropertyCtrl = function (entity) {
    Component.call(this, entity);
};

util.inherits(AvatarPropertyCtrl, Component);
module.exports = AvatarPropertyCtrl;

let pro = AvatarPropertyCtrl.prototype;

pro.init = function (opts) {
    this._initPersistProperties(opts);
    this._dirtyProp = {};
};

pro._initPersistProperties = function (opts) {
    let persistProperties = avatarProperty.persistProperties;
    let entity = this.entity;
    for (let key in persistProperties) {
        if (key in opts && opts[key] !== undefined) {
            entity[key] = opts[key];
        }
        else {
            entity[key] = persistProperties[key];
        }
    }
};

pro.getPersistProp = function () {
    let persistProperties = avatarProperty.persistProperties;
    let props = {};
    for (let key in persistProperties) {
        props[key] = this.entity[key];
    }
    return props;
};

pro.enoughSilver = function (cost) {
    if (cost <= 0)
        return false;
    return this.entity.silver >= cost;
};

pro.giveSilver = function (val, reason = 'default', bNotify=true) {
    if (val <= 0)
        throw new Error('give silver: ' + val);
    this._setAvatarProp('silver', this.entity.silver + val, bNotify);
    this.entity.logger.info('get silver: %s, now: %s, reason: %s', val, this.entity.silver, reason);
};

pro.spendSilver = function (cost, reason, bNotify=true) {
    if (!this.enoughSilver(cost))
        throw new Error('spend silver not enough need: ' + cost + ' own: ' + this.entity.silver);
    this._setAvatarProp('silver', this.entity.silver - cost, bNotify);
    this.entity.logger.info('spend silver: %s, now: %s, reason: %s', cost, this.entity.silver, reason);
};

pro.enoughGold = function (cost) {
    if (cost <= 0)
        return false;
    return this.entity.gold + this.entity.freeGold >= cost;
};

pro.giveGold = function (val, reason = 'default', bNotify=true) {
    if (val <= 0)
        throw new Error('give gold: ' + val);
    this._setAvatarProp('gold', this.entity.gold + val, bNotify);
    this.entity.logger.info('get gold: %s, now: %s, reason: %s', val, this.entity.gold, reason);
};

pro.giveFreeGold = function (val, reason = 'default', bNotify=true) {
    if (val <= 0)
        throw new Error('give free gold: ' + val);
    this._setAvatarProp('freeGold', this.entity.freeGold + val, bNotify);
    this.entity.logger.info('get free gold: %s, now: %s, reason: %s', val, this.entity.freeGold, reason);
};

pro.spendGold = function (cost, reason, bNotify=true) {
    if (!this.enoughGold(cost))
        throw new Error('spend gold not enough need: ' + cost + ' own: ' + this.entity.gold + this.entity.freeGold);
    let freeCost = 0;
    if (this.entity.freeGold > 0) {
        if (cost > this.entity.freeGold) {
            freeCost = this.entity.freeGold;
            cost -= freeCost
        }
        else {
            freeCost = cost;
            cost = 0;
        }
        this._setAvatarProp('freeGold', this.entity.freeGold - freeCost, bNotify);
    }
    if (cost > 0) {
        this._setAvatarProp('gold', this.entity.gold - cost, bNotify);
    }
    this.entity.logger.info(
        'spend freeGold: %s, gold: %s, now: freeGold[%s] gold[%s], reason: %s',
        freeCost, cost, this.entity.freeGold, this.entity.gold, reason);
};

pro.enoughPower = function (cost) {
    if (cost <= 0)
        return false;
    return this.entity.power >= cost;
};

pro.givePower = function (val, reason = 'default', bNotify=true) {
    if (val <= 0)
        throw new Error('give power: ' + val);
    this._setAvatarProp('power', this.entity.power + val, bNotify);
    this.entity.logger.info('get power: %s, now: %s, reason: %s', val, this.entity.power, reason);
};

pro.spendPower = function (cost, reason, bNotify=true) {
    if (!this.enoughPower(cost))
        throw new Error('spend power not enough need: ' + cost + ' own: ' + this.entity.power);
    this._setAvatarProp('power', this.entity.power - cost, bNotify);
    this.entity.logger.info('spend power: %s, now: %s, reason: %s', cost, this.entity.power, reason);
};

pro._setAvatarProp = function (key, value, bNotify) {
    this.entity[key] = value;
    this._dirtyProp[key] = value;
    if (bNotify) {
        this.entity.sendMessage('onAvatarPropUpdate', this._dirtyProp);
        this._dirtyProp = {};
    }
};

// 兑换银两
pro.exchangeSilver = function (gold, next) {
    if (!this.enoughGold(gold))
        return next(null, {code: consts.Code.FAIL});
    let reason = consts.SpendReason.EXCHANGE_SILVER;
    this.spendGold(gold, reason, false);
    this.giveSilver(gold * constTpl.SilverExchange, reason, true);
    next(null, {code: consts.Code.OK});
};

// 兑换体力
pro.exchangePower = function (gold, next) {
    if (!this.enoughGold(gold))
        return next(null, {code: consts.Code.FAIL});
    let reason = consts.SpendReason.EXCHANGE_POWER;
    this.spendGold(gold, reason, false);
    this.givePower(gold * constTpl.PowerExchange, reason, true);
    next(null, {code: consts.Code.OK});
};
