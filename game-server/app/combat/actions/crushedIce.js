/**
 * Date: 2018/9/12
 * Author: liuguolai
 * Description: 碎冰
 */
let fightHelper = _require('../../helper/fightHelper'),
    Formula = _require('../../util/formula');
let consts = _require('../../public/consts');

let crushedIce = {};

crushedIce.entry = function (caster, skill, data, targets) {
    let type = data.type, buffID = data.buffID, consume = data.consume;
    let duration = data.time || consts.Buff.BUFF_PERMANENT;
    let dungeonEnt = caster.owner,
        groupId = caster.groupId,
        summonsNum = dungeonEnt.summons.getSummonsNumByType(groupId, true, type);
    if (summonsNum <= 0)
        return;
    let enemies = caster.getAllEnemies(fightHelper.filterAlive);
    let enemiesNum = enemies.length;
    if (enemiesNum === 0)
        return;
    if (consume) {
        dungeonEnt.summons.clearSummonsByType(groupId, true, type, true);
    }
    let numList = Formula.randomDivideNPart(summonsNum, enemiesNum), buffNum;
    for (let i = 0; i < numList.length; i++) {
        buffNum = numList[i];
        if (buffNum <= 0)
            continue;
        enemies[i].buffCtrl.addBuff(buffID, skill.slv, duration, caster.id, skill.sid, null, {effectNum: buffNum});
    }
};

module.exports = crushedIce;
