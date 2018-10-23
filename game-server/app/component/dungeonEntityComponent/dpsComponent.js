/**
 * Date: 2018/10/16
 * Author: liuguolai
 * Description: 策划dps需求
 */
let Component = _require('../component');
let util = require('util');
let consts = _require('../../common/consts');
let dungeonTpl = _require('../../data/Dungeon');

let DpsComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(DpsComponent, Component);
module.exports = DpsComponent;

let pro = DpsComponent.prototype;

pro.init = function (opts) {
    this.disable = false;

    this.idToHeroid = {};  // id到英雄id的映射
    this.idToMonsterid = {};
    this.doDamageInfo = {};  // 伤害数据
    this.doHealInfo = {};  // 治疗数据
};

pro._checkId = function (casterID) {
    if (!(casterID in this.idToHeroid) || !(casterID in this.idToMonsterid)) {
        let ent = this.entity.getMember(casterID);
        if (ent.heroid) {
            this.idToHeroid[casterID] = {
                heroid: ent.heroid,
                groupId: ent.groupId
            };
        }
        else {
            this.idToMonsterid[casterID] = {
                monsterid: ent.monsterid,
                groupId: ent.groupId
            };
        }
    }
};

pro._getDoDamager = function (casterID) {
    this._checkId(casterID);
    if (!(casterID in this.doDamageInfo)) {
        this.doDamageInfo[casterID] = {};
    }
    return this.doDamageInfo[casterID];
};

pro._getDoHealer = function (casterID) {
    this._checkId(casterID);
    if (!(casterID in this.doHealInfo)) {
        this.doHealInfo[casterID] = {};
    }
    return this.doHealInfo[casterID];
};

pro.onDamage = function (damageInfo) {
    if (this.disable)
        return;
    let casterID = damageInfo.attackerID,
        sid = damageInfo.sid,
        damage = damageInfo.oriDamage;
    let doDamager = this._getDoDamager(casterID);
    doDamager[sid] = (doDamager[sid] || 0) + damage;
};

pro.onSwordWheel = function (damageInfo) {
    if (this.disable)
        return;
    let casterID = damageInfo.caster,
        sid = damageInfo.sid,
        damage = 0;
    for (let targetID in damageInfo.damageInfo) {
        let info = damageInfo.damageInfo[targetID];
        let subArmor = info.orginArmor - info.curArmor;
        let subHp = info.orginHp - info.curHp;
        damage += subArmor + subHp;
    }
    let doDamager = this._getDoDamager(casterID);
    doDamager[sid] = (doDamager[sid] || 0) + damage;
};

pro.onReverse = function (damageInfo) {
    if (this.disable)
        return;
    let casterID = damageInfo.caster,
        sid = damageInfo.sid,
        damage = 0;
    for (let targetID in damageInfo.damageInfo) {
        let info = damageInfo.damageInfo[targetID];
        let subArmor = info.orginArmor - info.curArmor;
        let subHp = info.orginHp - info.curHp;
        damage += subArmor + subHp;
    }
    let doDamager = this._getDoDamager(casterID);
    doDamager[sid] = (doDamager[sid] || 0) + damage;
};

pro.onHeal = function (healInfo) {
    if (this.disable)
        return;
    let casterID = healInfo.casterID,
        sid = healInfo.sid,
        heal = healInfo.toHP - healInfo.fromHp;
    let dohealer = this._getDoHealer(casterID);
    dohealer[sid] = (dohealer[sid] || 0) + heal;
};

pro.onBuffModHp = function (info, sid) {
    if (this.disable)
        return;
    let casterID = info.casterID;
    if (info.val < 0) {
        let doDamager = this._getDoDamager(casterID);
        doDamager[sid] = (doDamager[sid] || 0) - info.val;
    }
    else {
        let dohealer = this._getDoHealer(casterID);
        dohealer[sid] = (dohealer[sid] || 0) + info.val;
    }
};

pro._getData = function () {
    let timeLimit = dungeonTpl[this.entity.dgId].TimeLimit;
    let usedTime = timeLimit - Math.floor((this.entity.statusEndTime - new Date().getTime()) / 1000);
    return {
        code: consts.Code.OK,
        usedTime: usedTime,
        idToHeroid: this.idToHeroid,
        idToMonsterid: this.idToMonsterid,
        doDamageInfo: this.doDamageInfo,
        doHealInfo: this.doHealInfo,
    };
};

pro.getDps = function (next) {
    if (this.disable) {
        return next(null, {code: consts.Code.FAIL});
    }
    let data = this._getData();
    next(null, data);
};

pro.onFightEnd = function () {
    if (this.disable) {
        return;
    }
    let data = this._getData();
    this.entity.broadcast('fightEndDpsInfo', data);
};
