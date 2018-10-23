/**
 * Date: 2018/7/16
 * Author: liuguolai
 * Description: 指定抽牌
 */
var drawCard = {};

drawCard.entry = function (caster, skill, data, targets) {
    var num = data.num;
    var cardType = data.cardType;
    var cardQuality = data.cardQuality;
    var cardAttributes = data.cardAttributes;
    var piletype = data.piletype;
    for (var target of targets) {
        target.cardCtrl.specificDrawCard(num, cardType, cardQuality, cardAttributes, piletype);
    }
};

module.exports = drawCard;
