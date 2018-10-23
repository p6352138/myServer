/**
 * Date: 2018/7/23
 * Author: liuguolai
 * Description: 仇恨系统
 */
var Component = _require('../component');
var util = _require('util');
var fightHelper = _require('../../helper/fightHelper');
var utils = _require('../../util/utils');
var entityMgr = _require('../../services/entityManager');

var HatredComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(HatredComponent, Component);
module.exports = HatredComponent;

var pro = HatredComponent.prototype;

pro.init = function (opts) {
    this.hatredDict = {};
    // 玩家不需要仇恨系统
    this.disable = this.entity.isA("Player") ? true : false;

    this.entity.combat.on("EventGetDamaged", this._onGetDamaged.bind(this));
    this.entity.combat.on("EventGetHealed", this._onGetHealed.bind(this));
    this.entity.combat.on("EventBuffModHp", this._onBuffModHp.bind(this));
    this.entity.state.on("EventDie", this._onDie.bind(this));
    this.entity.state.on("EventRelive", this._onRelive.bind(this));
};

// 外部初始化仇恨列表
pro.initEnemiesHatred = function (enemyList) {
    for (var enemyID of enemyList) {
        this.hatredDict[enemyID] = 1;
    }
    this.entity.logger.info('initEnemiesHatred list:', enemyList);
};

pro._onDie = function (entity) {
    this.disable = true;
    // 死亡仇恨归零
    for (var uid in this.hatredDict) {
        this.hatredDict[uid] = 0;
    }
    // 所有敌方对我仇恨清零
    var enemies = this.entity.getAllEnemies(fightHelper.filterAlive);
    for (var enemy of enemies) {
        enemy.hatred.set(this.entity.id, 0);
    }
};

pro._onRelive = function (entity) {
    if (!entity.isA("Player")) {
        this.disable = false;
    }
    // 复活仇恨重置
    var enemies = this.entity.getAllEnemies(fightHelper.filterAlive);
    for (var enemy of enemies) {
        this.hatredDict[enemy.id] = 1;
        enemy.hatred.set(this.entity.id, 1);
    }
};

pro._addHatredToEnemies = function (targetID, hatred) {
    var enemies = this.entity.getAllEnemies(fightHelper.filterAlive);
    for (var enemy of enemies) {
        enemy.hatred.add(targetID, hatred);
    }
};

// buff改变血量
pro._onBuffModHp = function (entity, oldVal, newVal, casterID, skillID) {
    var deltaVal = newVal - oldVal;
    if (deltaVal > 0) {
        // 治疗buff，给对面加仇恨
        var hatred = fightHelper.calcHatred(skillID, deltaVal);
        this._addHatredToEnemies(casterID, hatred);
    }
    else {
        // 伤害buff
        var hatred = fightHelper.calcHatred(skillID, -deltaVal);
        this.add(casterID, hatred);
    }
};

// 治疗增加仇恨
pro._onGetHealed = function(entity, casterID, healVal, sid) {
    if (healVal <= 0)
        return;
    var hatred = fightHelper.calcHatred(sid, healVal);
    this._addHatredToEnemies(casterID, hatred);
};

// 受伤增加仇恨
pro._onGetDamaged = function (entity, attackID, damage, sid) {
    var hatred = fightHelper.calcHatred(sid, damage);
    this.add(attackID, hatred);
};

// 增加仇恨
pro.add = function (targetID, addValue) {
    if (this.disable)
        return;
    this.hatredDict[targetID] += addValue;
    this.entity.logger.debug('add hatred targetID[%s] value[%s]', targetID, addValue);
};

// 设置仇恨
pro.set = function (targetID, val) {
    if (this.disable)
        return;
    this.hatredDict[targetID] = val;
};

// 移除仇恨
pro.remove = function (targetID) {
    delete this.hatredDict[targetID];
};

// 取出仇恨值最大的第n个
pro.maxIdx = function (idx) {
    var self = this;
    idx = idx || 0;
    var validEnts = [];
    for (var uid in self.hatredDict) {
        var ent = entityMgr.getEntity(uid);
        if (ent.state.isDead())
            continue;
        validEnts.push(uid);
    }
    self.entity.logger.debug(
        "get hatred entity, all[%s] valid[%s] idx[%s]", Object.getOwnPropertyNames(self.hatredDict), validEnts.toString(), idx);
    if (validEnts.length === 0)
        return null;
    validEnts.sort(function (a, b) {
        return self.hatredDict[b] - self.hatredDict[a];
    });
    if (idx >= validEnts.length)
        return validEnts[validEnts.length - 1];
    else
        return validEnts[idx];
};
