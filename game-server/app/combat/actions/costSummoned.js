/**
 * Date: 2018/9/12
 * Author: liuguolai
 * Description: 冰灵劲（消耗召唤物）
 */
let costSummoned = {};

costSummoned.entry = function (caster, skill, data, targets) {
    let costSummoned = data.costSummoned,
        type = data.type;
    caster.owner.summons.removeSpawnSummon(caster.groupId, true, type, "random", costSummoned);
};

module.exports = costSummoned;
