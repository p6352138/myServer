/**
 * Date: 2018/7/11
 * Author: liuguolai
 * Description:
 */
var Component = _require('../component');
var util = _require('util');
var consts = _require('../../public/consts');
var assert = _require('assert');

var PropertyCtrl = function (entity) {
    Component.call(this, entity);
};

util.inherits(PropertyCtrl, Component);
module.exports = PropertyCtrl;

var pro = PropertyCtrl.prototype;

pro.init = function (opts) {

};

// 扣hp
pro.subHp = function (val) {
    assert(val >= 0, 'subHp value error.');
    var orginHp = this.entity.hp;
    var toHp = Math.max(orginHp - val, 0);
    this.entity.hp = toHp;
    if (this.entity.hp === 0) {
        this.entity.state.enterDie();
    }
    this.emit("EventSubHp", this.entity, orginHp, toHp);
};

// 加Hp
pro.addHp = function (val) {
    assert(val >= 0, 'addHp value error.');
    var orginHp = this.entity.hp;
    var toHp = Math.min(orginHp + val, this.entity.maxHp);
    this.entity.hp = toHp;
    this.emit("EventAddHp", this.entity, orginHp, toHp);
};

pro.modHp = function (val) {
    if (val > 0)
        this.addHp(val);
    else
        this.subHp(-val);
};

// 广播属性
var BROADCAST_PROP = new Set(['hp', 'armor', 'scale']);

// 修改属性
pro.modProp = function (prop, deltaVal, noBroadcast) {
    if (prop === 'hp') {
        this.modHp(deltaVal);
    }
    else {
        var orginVal = this.entity[prop];
        if (orginVal === undefined)
            throw new Error(this.entity.id + " modProp error, unknow prop: " + prop);
        var newVal = orginVal + deltaVal;
        if (newVal < 0)
            throw new Error(this.entity.id + " modProp error, prop: " + prop + " val: " + deltaVal);

        this.entity[prop] = newVal;
    }
    // 需要广播
    if (!noBroadcast && BROADCAST_PROP.has(prop)) {
        var data = {targetID: this.entity.id};
        data[prop] = this.entity[prop];
        this.entity.broadcast('onPropUpdate', data);
    }
};

// 修改属性比例
pro.modPropPct = function (prop, percent, noBroadcast) {
    var orginVal = this.entity[prop];
    if (orginVal === undefined)
        throw new Error(this.entity.id + " modPropPct error, unknow prop: " + prop);
    if (percent < 0 )
        var newVal = orginVal / -percent;
    else
        var newVal = orginVal * percent;
    if (newVal < 0)
        throw new Error(this.entity.id + " modPropPct error, prop: " + prop + " percent: " + percent);

    this.entity[prop] = newVal;
    // 需要广播
    if (!noBroadcast && BROADCAST_PROP.has(prop)) {
        var data = {targetID: this.entity.id};
        data[prop] = newVal;
        this.entity.broadcast('onPropUpdate', data);
    }
};
