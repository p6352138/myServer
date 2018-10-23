/**
 * Date: 2018/7/10
 * Author: liuguolai
 * Description:
 */
let consts = _require('../../public/consts');

let addBuff = {};

addBuff.entry = function (caster, skill, data, targets) {
    let duration = data.time || consts.Buff.BUFF_PERMANENT;
    let count = data.count || 1;
    for (let i = 0; i < count; i++) {
        for (let target of targets) {
            target.buffCtrl.addBuff(data.buffID, skill.slv, duration, caster.id, skill.sid);
        }
    }
};

module.exports = addBuff;
