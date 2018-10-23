/**
 * Date: 2018/7/9
 * Author: liuguolai
 * Description:
 */

var damage = {};

// 伤害：伤害 = （攻击牌攻击 + 力量）×（1+自身伤害增幅 + 敌方易伤 - 自身伤害降低 - 敌方减伤）
damage.entry = function (caster, skill, data, targets) {
    var baseDmg = data["dmg"];  // todo: 等级加成
    // todo: 计算增幅
    var damage = baseDmg;
    for (var target of targets) {
        if (target.combat.onDamage(caster, damage, skill.sid)) {
            skill.addHitNum();
        }
    }
};

module.exports = damage;
