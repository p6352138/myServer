/**
 * Date: 2018/7/17
 * Author: liuguolai
 * Description: 创建手牌
 */

let create = {};

create.entry = function (caster, skill, data, targets) {
    let cardID = data.cardID;
    let num = data.num;
    let rate = data.rate;  // 概率
    if (rate && Math.random() > rate)
        return;
    for (var target of targets) {
        target.cardCtrl.createCardsInHand(cardID, num);
    }
};

module.exports = create;
