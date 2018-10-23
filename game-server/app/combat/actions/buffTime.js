/**
 * Date: 2018/9/18
 * Author: liuguolai
 * Description: buff时间
 */
let buffTime = {};

buffTime.entry = function (caster, skill, data, targets) {
    let buffID = data.buffID, addTime = data.addTime;
    for (let target of targets) {
        let buff = target.buffCtrl.getBuff(buffID);
        if (buff) {
            buff.addEndTime(addTime);
        }
    }
};

module.exports = buffTime;
