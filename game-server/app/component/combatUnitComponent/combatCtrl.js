/**
 * Date: 2018/7/9
 * Author: liuguolai
 * Description:
 */
var Component = _require('../component');
var util = _require('util');
var assert = _require('assert');
var consts = _require('../../public/consts');
var fightHelper = _require('../../helper/fightHelper');
var entityManager = _require('../../services/entityManager');

var CombatCtrl = function (entity) {
    Component.call(this, entity);
};

util.inherits(CombatCtrl, Component);
module.exports = CombatCtrl;

var pro = CombatCtrl.prototype;

pro.init = function (opts) {
    // 攻击者额外的伤害
    this.attackExtraDamage = {

    }
};

pro.setAttackExtraDamage = function (attackID, damage) {
    this.attackExtraDamage[attackID] = damage;
};

pro.onDamage = function (attacker, damage, sid, broadcast) {
    assert(damage > 0, "onDamage的damage应该大于0");
    if (this.entity.state.isDead())
        return false;
    // 基础伤害 + 火印伤害*层数 + 恶魔之链传递伤害
    damage = fightHelper.calcDamage(attacker, this.entity, damage);
    damage += (this.attackExtraDamage[attacker.id] || 0);
    var oriDamage = damage;
    // armor buff 结算
    damage = this.entity.buffCtrl.calcArmorBuff(damage);
    let bSubHp = false, orginHp = this.entity.hp;
    if (damage > 0) {
        if (this.entity.armor >= damage) {
            this.entity.armor -= damage;
        }
        else {
            damage -= this.entity.armor;
            this.entity.armor = 0;
            this.entity.prop.subHp(damage);
            bSubHp = true;
        }
    }
    this.emit("EventGetDamaged", this.entity, attacker.id, oriDamage, sid);
    if (broadcast === undefined)
        broadcast = true;
    if (broadcast) {
        // 广播伤害
        let msg = {
            targetID: this.entity.id,
            attackerID: attacker.id,
            sid: sid,
            oriDamage: oriDamage,  // 原始伤害
            hp: this.entity.hp,
            armor: this.entity.armor
        };
        this.entity.broadcast('onDamage', msg);
        this.entity.owner.dps.onDamage(msg);
    }
    if (bSubHp) {
        attacker.combat.onDoDamageToOther(orginHp, this.entity.hp);
    }
    return true;
};

// 计算n次伤害
pro.onDamageWithTimes = function (attacker, damage, sid, num) {
    var damageList = [];
    var entity = this.entity;
    var orginHp = entity.hp;
    var orginArmor = entity.armor;
    var fromHp, fromArmor;
    while (num --) {
        fromHp = entity.hp;
        fromArmor = entity.armor;
        if (this.onDamage(attacker, damage, sid, false)) {
            damageList.push([fromHp, entity.hp, fromArmor, entity.armor])
        }
        else {
            break;
        }
    }
    return {
        orginHp: orginHp,
        orginArmor: orginArmor,
        // [[fromHp, toHp, formArmor, toArmor]...]
        damageList: damageList,
        curHp: entity.hp,
        curArmor: entity.armor
    }
};

pro.onHeal = function (caster, val, sid) {
    if (this.entity.state.isDead())
        return false;
    var entity = this.entity;
    var orginHp = entity.hp;
    entity.prop.addHp(val);
    this.emit("EventGetHealed", this.entity, caster.id, entity.hp - orginHp, sid);

    let msg = {
        casterID: caster.id,
        targetID: entity.id,
        sid: sid,
        fromHp: orginHp,
        toHP: entity.hp,
    };
    this.entity.broadcast('onHeal', msg);
    this.entity.owner.dps.onHeal(msg);
    return true;
};

pro.onBuffModHp = function (buff, hpVal, casterID, skillID) {
    if (this.entity.state.isDead())
        return;
    var entity = this.entity;
    var orginHp = entity.hp;
    entity.prop.modHp(hpVal);
    this.emit("EventBuffModHp", this.entity, orginHp, entity.hp, casterID, skillID);

    let msg = {
        buffID: buff.id,
        casterID: casterID,
        targetID: entity.id,
        fromHp: orginHp,
        toHP: entity.hp,
        val: hpVal
    }
    this.entity.broadcast('onBuffModHp', msg);
    this.entity.owner.dps.onBuffModHp(msg, skillID);

    if (hpVal < 0) {
        let caster = entityManager.getEntity(casterID);
        caster.combat.onDoDamageToOther(orginHp, entity.hp);
    }
};

// 对别人造成伤害
pro.onDoDamageToOther = function (enemyFromHp, enemyToHp) {
    this.emit("EventDoDamageToOther", this.entity, enemyFromHp, enemyToHp);
};
