/**
 * Date: 2018/7/19
 * Author: liuguolai
 * Description: 弃卡牌
 */
var dropCard = {};

dropCard.entry = function (caster, skill, data, targets) {
    var num = data.num;
    var cardType = data.cardType;
    var cardQuality = data.cardQuality;
    var cardAttributes = data.cardAttributes;
    var piletype = data.piletype;
    for (var target of targets) {
        target.cardCtrl.dropCard(num, cardType, cardQuality, cardAttributes, piletype);
    }
};

module.exports = dropCard;
