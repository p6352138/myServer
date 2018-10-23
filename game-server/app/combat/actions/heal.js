/**
 * Date: 2018/7/18
 * Author: liuguolai
 * Description: 治疗
 */
var heal = {};

heal.entry = function (caster, skill, data, targets) {
    var healVal = data.heal;
    for (var target of targets) {
        target.combat.onHeal(caster, healVal, skill.sid);
    }
};

module.exports = heal;
