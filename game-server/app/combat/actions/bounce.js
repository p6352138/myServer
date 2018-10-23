/**
 * Date: 2018/9/12
 * Author: liuguolai
 * Description: 弹射
 */
let skillAction = _require('../skillAction');
let fightHelper = _require('../../helper/fightHelper');

let bounce = {};

let doDamage = function (caster, skill, target, damage) {
    let fromHp = target.hp, fromArmor = target.armor;
    target.combat.onDamage(caster, damage, skill.sid, false);
    return {
        targetID: target.id,
        fromHp: fromHp,
        fromArmor: fromArmor,
        toHp: target.hp,
        toArmor: target.armor
    }
};

bounce.entry = function (caster, skill, data, targets) {
    let damage = data.dmg;
    let buffID = data.buffID;
    let res = [];
    let addBuffAction = skillAction.getAction('addBuff');
    for (let target of targets) {
        res.push(doDamage(caster, skill, target, damage));
    }
    if (buffID) {
        addBuffAction.entry(caster, skill, data, targets);
    }
    let bounceTimes = data.bounce;
    if (bounceTimes) {
        for (let i = 0; i < bounceTimes; i++) {
            let enemies = caster.getAllEnemies(fightHelper.filterAlive);
            let len = enemies.length;
            if (len === 0)
                break;
            let target = enemies[Math.floor(Math.random() * len)];
            res.push(doDamage(caster, skill, target, damage));
            if (buffID) {
                addBuffAction.entry(caster, skill, data, [target]);
            }
        }
    }
    caster.broadcast('onBounce', {
        sid: skill.sid,
        casterID: caster.id,
        damageLine: res
    });
};

module.exports = bounce;
