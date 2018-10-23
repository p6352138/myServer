/**
 * Date: 2018/7/18
 * Author: liuguolai
 * Description: 复活
 */

var reliveTarget = {};

reliveTarget.entry = function (caster, skill, data, targets) {
    var heal = data.heal;
    var ownPercent = data.ownPercent;
    if (ownPercent) {
        heal = Math.max(1, Math.floor(caster.hp / 2));
        caster.hp = Math.max(1, caster.hp - heal);
    }
    var percent = data.percent;
    for (var target of targets) {
        if (target.state.enterRelive(heal, percent)) {
            caster.broadcast('onRelive', {
                sid: skill.sid,
                casterID: caster.id,
                casterHp: caster.hp,
                targetID: target.id,
                hp: target.hp,
            });
        }
    }
};

module.exports = reliveTarget;
