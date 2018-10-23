/**
 * Date: 2018/9/13
 * Author: liuguolai
 * Description:  乌雪焚天
 */
let blackSnow = {};

blackSnow.entry = function (caster, skill, data, targets) {
    let buffID = data.buffID, times = data.times;
    for (let target of targets) {
        let buff = target.buffCtrl.getBuff(buffID);
        if (buff) {
            buff.refreshEndTime(times);
        }
    }
};

module.exports = blackSnow;
