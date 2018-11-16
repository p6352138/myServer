/**
 * Date: 2018/7/20
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('../../bt_consts');
var consts = _require('../../../common/consts');
var cardTpl = _require('../../../data/Card');

var entityCondition = {};
module.exports = entityCondition;

// 是否拥有卡牌
entityCondition.isCardInHand = function (aiComp, cid) {
    if (aiComp.entity.cardCtrl.hasCardInHand(cid))
        return bt_consts.StatusType.SUCCESS;
    else
        return bt_consts.StatusType.FAILURE;
};

// 使用卡牌灵力是否足够
entityCondition.isMpEnoughToUseCard = function (aiComp, cid) {
    var needMp = cardTpl[cid].CastMP;
    if (aiComp.entity.mp < needMp)
        return bt_consts.StatusType.FAILURE;
    else
        return bt_consts.StatusType.SUCCESS;
};

// 使用卡牌体力是否足够
entityCondition.isThewEnoughToUseCard = function (aiComp, cid) {
    var needThew = cardTpl[cid].CastThew;
    if (aiComp.entity.thew < needThew)
        return bt_consts.StatusType.FAILURE;
    else
        return bt_consts.StatusType.SUCCESS;
};

// 是否可使用卡牌
entityCondition.canUseCard = function (aiComp, cid) {
    var cardCtrl = aiComp.entity.cardCtrl;
    var idx = cardCtrl.getInHandCidIdx(cid);
    if (idx === -1)
        return bt_consts.StatusType.FAILURE;
    var tid = aiComp.getRunningData("target");
    if (cardCtrl.checkCanUseCard(idx, cid, tid) === consts.FightCode.OK)
        return bt_consts.StatusType.SUCCESS;
    return bt_consts.StatusType.FAILURE;
};

// 属性判断
entityCondition.checkAttributes = function (aiComp, unit, attriName, op, value) {
    var tg;
    if (unit === "self") {
        tg = aiComp.entity;
    }
    else if (unit === "target") {
        var tid = aiComp.getRunningData("target");
        if (tid)
            tg = aiComp.entity.owner.getMember(tid);
    }
    if (!tg)
        return bt_consts.StatusType.FAILURE;

    var leftVal = 0;
    if (attriName === consts.AttributeName.HP)
        leftVal = tg.hp;
    else if (attriName === consts.AttributeName.HP_PCT)
        leftVal = tg.hp / tg.maxHp;
    else if (attriName === consts.AttributeName.MP)
        leftVal = tg.mp;
    else if (attriName === consts.AttributeName.THEW)
        leftVal = tg.thew;
    else if (attriName === consts.AttributeName.IN_HAND_CARDS_NUM)
        leftVal = tg.cardCtrl.inHands.length
    else
        return bt_consts.StatusType.FAILURE;

    var express = leftVal + op + value;
    if (eval(express) === true)
        return bt_consts.StatusType.SUCCESS;
    return bt_consts.StatusType.FAILURE;
};
