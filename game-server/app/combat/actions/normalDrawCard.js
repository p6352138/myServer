/**
 * Date: 2018/8/3
 * Author: liuguolai
 * Description:
 */
var normalDrawCard = {};

normalDrawCard.entry = function (caster, skill, data, targets) {
    var num = data.num;
    for (var target of targets) {
        target.cardCtrl.normalDrawCard(num);
    }
};

module.exports = normalDrawCard;
