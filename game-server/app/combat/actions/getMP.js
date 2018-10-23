/**
 * Date: 2018/8/9
 * Author: liuguolai
 * Description: 获取MP
 */
var getMP = {};

getMP.entry = function (caster, skill, data, targets) {
    var mp = data.MP;
    for (var target of targets) {
        target.activeRecoverMp(mp);
    }
};

module.exports = getMP;
