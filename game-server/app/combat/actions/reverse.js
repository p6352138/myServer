/**
 * Date: 2018/7/17
 * Author: liuguolai
 * Description: 回收召唤物造成伤害
 */

var reverse = {};

reverse.entry = function (caster, skill, data, targets) {
    var consume = data.consume;
    var perDmg = data.dmg;  // 每个伤害
    var type = data.type;

    var dungeonEnt = caster.owner;
    // 受击次数
    var ent2DamageCnt = dungeonEnt.summons.getSummonsDamageCntToEntity(caster.groupId, true, type, consume);
    if (!ent2DamageCnt)
        return;
    var sid = skill.sid;
    var damageInfo = {};  // 受伤信息
    for (var entID in ent2DamageCnt) {
        var cnt = ent2DamageCnt[entID];
        var ent = dungeonEnt.getMember(entID);
        if (ent.state.isDead())
            continue;
        damageInfo[entID] = ent.combat.onDamageWithTimes(caster, perDmg, sid, cnt);
    }
    if (damageInfo) {
        let msg = {
            caster: caster.id,
            sid: sid,
            damageInfo: damageInfo,
        };
        dungeonEnt.broadcast("onReverse", msg);
        dungeonEnt.dps.onReverse(msg);
    }
};

module.exports = reverse;
