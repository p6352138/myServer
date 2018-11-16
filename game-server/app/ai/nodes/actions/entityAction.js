/**
 * Date: 2018/7/21
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('../../bt_consts');
var consts = _require('../../../common/consts');
var fightHelper = _require('../../../helper/fightHelper');

var entityAction = {};
module.exports = entityAction;

var getFilterFromState = function (state) {
    if (state === consts.State.ALIVE)
        return fightHelper.filterAlive;
    else if (state === consts.State.DIE)
        return fightHelper.filterDead;
};

// 选择目标
entityAction.selectTarget = function (aiComp, team, attriName, sortType, entState) {
    var tg = aiComp.entity;
    var filter = getFilterFromState(entState);
    if (team === consts.Skill.TEAM_FRIEND) {
        var ents = tg.getAllFriends(filter);
    }
    else {
        var ents = tg.getAllEnemies(filter);
    }
    if (ents.length === 0)
        return bt_consts.StatusType.FAILURE;

    // 升序
    if (sortType === consts.SortType.UP)
        var noReverse = 1;
    else
        var noReverse = -1;
    if (attriName === consts.AttributeName.HP)
        ents.sort(function (a, b) {
            return (a.hp - b.hp) * noReverse;
        })
    else if (attriName === consts.AttributeName.HP_PCT)
        ents.sort(function (a, b) {
            return (a.hp / a.maxHp - b.hp / b.maxHp) * noReverse;
        })
    else if (attriName === consts.AttributeName.MP)
        ents.sort(function (a, b) {
            return (a.mp - b.mp) * noReverse;
        })
    else if (attriName === consts.AttributeName.THEW)
        ents.sort(function (a, b) {
            return (a.thew - b.thew) * noReverse;
        })
    else if (attriName === consts.AttributeName.IN_HAND_CARDS_NUM)
        ents.sort(function (a, b) {
            return (a.cardCtrl.inHands.length - b.cardCtrl.inHands.length) * noReverse;
        })

    aiComp.setRunningData("target", ents[0].id);

    return bt_consts.StatusType.SUCCESS;
};

// 选择第idx的仇恨最高的目标
entityAction.selectHatredTarget = function (aiComp, idx) {
    var tgID = aiComp.entity.hatred.maxIdx(idx);
    if (!tgID)
        return bt_consts.StatusType.FAILURE;
    aiComp.setRunningData("target", tgID);
    return bt_consts.StatusType.SUCCESS;
};

// 使用卡牌
entityAction.useCard = function (aiComp, cid) {
    var cardCtrl = aiComp.entity.cardCtrl;
    var idx = cardCtrl.getInHandCidIdx(cid);
    if (idx === -1)
        return bt_consts.StatusType.FAILURE;
    var tid = aiComp.getRunningData("target");
    // todo: 是否需要去掉检测
    if (cardCtrl.checkCanUseCard(idx, cid, tid) !== consts.FightCode.OK)
        return bt_consts.StatusType.FAILURE;
    
    cardCtrl.actualUseCard(idx, cid, tid);
    return bt_consts.StatusType.SUCCESS;
};

// 随机使用卡牌
entityAction.randomUseCardByID = function (aiComp, cids, weights) {
    if (cids.length === 0)
        return bt_consts.StatusType.FAILURE;
    var cardCtrl = aiComp.entity.cardCtrl;
    var tid = aiComp.getRunningData("target");
    var validCids = [];
    var validWeights = [];
    var totalWeight = 0;
    for (let i in cids) {
        let cid = cids[i];
        let idx = cardCtrl.getInHandCidIdx(cid);
        if (idx === -1)
            continue;
        if (cardCtrl.checkCanUseCard(idx, cid, tid) === consts.FightCode.OK) {
            validCids.push(cid);
            let weight = weights[i] === undefined ? 1 : weights[i];
            validWeights.push(weight);
            totalWeight += weight;
        }
    }
    if (validCids.length === 0)
        return bt_consts.StatusType.FAILURE;
    let rd = Math.floor(Math.random() * totalWeight) + 1;
    for (let i in validCids) {
        rd -= validWeights[i];
        if (rd <= 0) {
            let cid = validCids[i];
            let idx = cardCtrl.getInHandCidIdx(cid);
            cardCtrl.actualUseCard(idx, cid, tid);
            return bt_consts.StatusType.SUCCESS;
        }
    }
    return bt_consts.StatusType.FAILURE;
};
