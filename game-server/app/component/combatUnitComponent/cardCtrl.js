/**
 * Date: 2018/7/3
 * Author: liuguolai
 * Description: 卡牌管理
 */
var Component = _require('../component');
var util = _require('util');
var consts = _require('../../common/consts');
var fightHelper = _require('../../helper/fightHelper');
var cardTpl = _require('../../data/Card');
var constTpl = _require('../../data/Constant');

var CardCtrl = function (entity) {
    Component.call(this, entity);
};

util.inherits(CardCtrl, Component);
module.exports = CardCtrl;

var pro = CardCtrl.prototype;

pro.init = function (opts) {
    this.cards = [];  // 抽牌堆
    this.inHands = [];  // 手牌
    this.discards = [];  // 弃牌堆
    this.exhausts = [];  // 消耗牌堆
    this.cardsLv = {};  // 卡牌等级

    this.drawTime = opts.drawTime || constTpl.BaseCardGain * 1000;  // 抽牌时间
    this.drawBlock = false;  // 抽牌阻塞，手牌满了

    this.drawTimer = null;
};

// 初始化卡牌
pro.initCards = function (cards, initialNum) {
    var [ ...newCards ] = cards;
    // 洗牌
    fightHelper.shuffle(newCards);
    this.cards = [];  // 抽牌堆
    this.inHands = [];  // 手牌
    for (var i = cards.length - 1; i >= 0; i--) {
        var cid = newCards[i];
        var cardAttri = cardTpl[cid].CardAttributes;
        // 固有的
        if (initialNum > 0 && cardAttri && cardAttri.indexOf(consts.CardAttri.INHERENT_CARD) !== -1) {
            this.inHands.push(cid);
            initialNum --;
        }
        else {
            this.cards.push(cid);
        }
    }
    this.cards.reverse();
    while (initialNum > 0)  {
        this.inHands.push(this.cards.pop());
        initialNum --;
    }
    this.discards = [];  // 弃牌堆
    this.exhausts = [];  // 消耗牌堆
};

pro.getCardsLvInfo = function () {
    var result = [];
    for (var cardID in this.cardsLv) {
        result.push({
            cid: cardID,
            lv: this.cardsLv[cardID]
        })
    }
    return result;
};

pro.stopDrawTimer = function () {
    clearTimeout(this.drawTimer);
    this.drawTimer = null;
};

// 开始抽牌逻辑
pro.startDrawTimer = function () {
    this.drawTimer = setTimeout(this._draw.bind(this), this.drawTime);
};

// 直接抽牌
pro.normalDrawCard = function (num) {
    if (num <= 0)
        return;
    for (var i = 0; i < num; i++) {
        this._draw(true);
    }
};

// 抽牌
pro._draw = function (isDirect) {
    this.entity.logger.debug("draw card inHands[%s], discards[%s]", this.inHands.toString(), this.discards.toString())
    if (this.inHands.length >= consts.Fight.CARDS_IN_HAND_MAX) {
        this.drawBlock = true;
        return;
    }
    var deltaData = {};  // 变化数据
    var card = this.cards.pop();
    this.inHands.push(card);
    // 牌库空了，重新洗牌
    if (this.cards.length === 0) {
        this._reshuffle();
        deltaData.discardsNum = this.discards.length;
    }
    deltaData.inHands = this.inHands;
    deltaData.cardsNum = this.cards.length;
    if (!isDirect)  // 直接抽牌不走计时逻辑
        this.startDrawTimer();
    this.entity.updateFightData('onDrawCard', deltaData);
    // 通知其他玩家
    var broadcastData = {
        inHandsNum: this.inHands.length
    };
    this.entity.broadcastToOthers('onDrawCardNotify', broadcastData);
    this.emit("EventDrawCard", this.entity, card, consts.PileType.CARDS);
};

// 重新洗牌
pro._reshuffle = function (bAll) {
    var [ ...cards ] = this.discards;
    // 全部重排
    if (bAll) {
        cards = cards.concat(this.exhausts, this.inHands);
        this.exhausts = [];
        this.inHands = [];
    }
    fightHelper.shuffle(cards);
    this.cards = cards;
    this.discards = [];
};

// 使用限制检测
pro._checkUseLimit = function (useLimit) {
    for (let key in useLimit) {
        switch (key) {
            case 'wSword':
                let num = this.entity.owner.summons.getSummonsNumByType(this.entity.groupId, true, 'wSword');
                if (num < useLimit[key])
                    return false;
                break;
        }
    }
    return true;
};

// 出牌判断
pro.checkCanUseCard = function (idx, cid, tid) {
    this.entity.logger.debug("checkCanUseCard idx[%s] cid[%s] tid[%s]", idx, cid, tid);
    if (this.entity.state.isDead())
        return consts.FightCode.ALREADY_DEAD;
    var card = this.inHands[idx];
    if (!card  || card != cid)
        return consts.FightCode.PLAY_CARD_INFO_ERR;
    var cardConf = cardTpl[cid];
    var needMp = cardConf.CastMP;
    if (this.entity.mp < needMp)
        return consts.FightCode.MP_NOT_ENOUGH;
    var needThew = cardConf.CastThew;
    if (this.entity.thew < needThew)
        return consts.FightCode.THEW_NOT_ENOUGH;
    // 使用限制
    if (!this._checkUseLimit(cardConf.UseLimit)) {
        return consts.FightCode.USE_LIMIT;
    }
    // 技能
    var skillID = cardConf.SkillID;
    var code = this.entity.skillCtrl.canUseSkill(skillID, tid);
    if (code != consts.FightCode.OK)
        return code;
    return consts.FightCode.OK;
};

// 出牌结算
pro.actualUseCard = function (idx, cid, tid) {
    var card = this.inHands[idx];
    var cardConf = cardTpl[cid];
    var needMp = cardConf.CastMP;
    var needThew = cardConf.CastThew;
    this.entity.mp -= needMp;
    this.entity.thew -= needThew;
    this.inHands.splice(idx, 1);  // 删除
    var deltaData = {
        mp: this.entity.mp,
        thew: this.entity.thew,
        inHands: this.inHands
    };
    if (cardConf.CardAttributes.indexOf(consts.CardAttri.PERMANENT_CONSUME_CARD) !== -1) {
        // 永久消耗，不处理
    }
    else if (cardConf.CardAttributes.indexOf(consts.CardAttri.CONSUME_CARD) !== -1) {
        // 进消耗牌堆
        this.exhausts.push(card);
        deltaData.exhaustsNum = this.exhausts.length;
    }
    else {
        // 进弃牌堆
        this.discards.push(card);
        deltaData.discardsNum = this.discards.length;
    }
    this.entity.updateFightData('onUseCard', deltaData);
    if (needMp > 0) {
        this.entity.startMpRecoverTimer();
    }
    var broadcastData = {
        uid: this.entity.id,
        cid: cid,
        tid: tid,
        inHandsNum: this.inHands.length
    }
    this.entity.broadcastToOthers('onUseCardNotify', broadcastData);
    this.emit("EventUseCard", this.entity, cid);
    if (this.drawBlock) {
        this.drawBlock = false;
        this._draw();
    }
    this.entity.logger.debug("use card cid[%s] left:", cid, this.inHands);
    // 使用技能
    var skillID = cardConf.SkillID;
    this.entity.skillCtrl.useSkill(skillID, this.cardsLv[cid] || 1, tid);
};

pro.hasCardInHand = function (cid) {
    if (this.inHands.indexOf(cid) !== -1)
        return true;
    else
        return false;
};

pro.isFull = function () {
    return this.inHands.length >= consts.Fight.CARDS_IN_HAND_MAX;
};

pro._getPileByType = function (pileType) {
    if (consts.PileType.CARDS === pileType)
        return this.cards;
    if (consts.PileType.DISCARDS === pileType)
        return this.discards;
    if (consts.PileType.EXHAUSTS === pileType)
        return this.exhausts;
};

pro._getValidCardsFromPile = function (cardType, cardQuality, cardAttributes, piletype) {
    var validCards = [];
    var isValid = function (cid) {
        var cardData = cardTpl[cid];
        if (cardType && cardType !== cardData.CardType)
            return false;
        if (cardQuality && cardQuality !== cardData.CardQuality)
            return false;
        if (cardAttributes && cardData.CardAttributes.indexOf(this.cardAttributes) !== -1)
            return false;
        return true;
    }

    if (!piletype || piletype === consts.PileType.CARDS) {
        var pile = this.cards;
        for (var i in pile) {
            if (isValid(pile[i])) {
                validCards.push({
                    type: consts.PileType.CARDS,
                    idx: i,
                    card: pile[i],
                })
            }
        }
    }
    if (!piletype || piletype === consts.PileType.DISCARDS) {
        var pile = this.discards;
        for (var i in pile) {
            if (isValid(pile[i])) {
                validCards.push({
                    type: consts.PileType.DISCARDS,
                    idx: i,
                    card: pile[i],
                })
            }
        }
    }
    if (!piletype || piletype === consts.PileType.EXHAUSTS) {
        var pile = this.exhausts;
        for (var i in pile) {
            if (isValid(pile[i])) {
                validCards.push({
                    type: consts.PileType.EXHAUSTS,
                    idx: i,
                    card: pile[i],
                })
            }
        }
    }
    return validCards;
};

// 指定抽卡
pro.specificDrawCard = function (num, cardType, cardQuality, cardAttributes, piletype) {
    if (this.isFull())
        return;
    var validCards = this._getValidCardsFromPile(cardType, cardQuality, cardAttributes, piletype);
    // 没有符合的卡牌
    if (validCards.length === 0) {
        this.entity.logger.info("specific draw card no valid. ");
        return;
    }

    var maxNum = consts.Fight.CARDS_IN_HAND_MAX - this.inHands.length;
    num = Math.min(maxNum, num);
    if (validCards.length <= num) {
        var cards = validCards;
    }
    else {
        fightHelper.shuffle(validCards);
        var cards = validCards.slice(0, num);
        cards.sort(function (a, b) {
            return a.idx - b.idx;
        })
    }
    var clientData = [];
    var broadcast = {};
    // 加入手牌
    for (var i = cards.length - 1; i >= 0; i--) {
        var info = cards[i];
        var pile = this._getPileByType(info.type);
        pile.splice(info.idx, 1);
        this.inHands.push(info.card);
        clientData.push({
            pileType: info.type,
            card: info.card,
        })
        broadcast[info.type] = (broadcast[info.type] || 0) + 1;
        this.emit("EventDrawCard", this.entity, info.card, info.type);
    }
    // to client
    this.entity.updateFightData('onSpecificDrawCard', {
        got: clientData,
        inHands: this.inHands,
    });
    // broadcast
    this.entity.broadcastToOthers('onSpecificDrawCardNotify', {
        targetID: this.entity.id,
        inHandsNum: this.inHands.length,
        from: broadcast,
    });
};

// 生成手牌
pro.createCardsInHand = function (cardID, num) {
    if (this.isFull())
        return;
    var maxNum = consts.Fight.CARDS_IN_HAND_MAX - this.inHands.length;
    num = Math.min(maxNum, num);
    for (var i = 0; i < num; i++) {
        this.inHands.push(cardID);
    }
    // to client
    this.entity.updateFightData('onCreateCard', {
        num: num,
        inHands: this.inHands,
    });
    // broadcast
    this.entity.broadcastToOthers('onCreateCardNotify', {
        uid: this.entity.id,
        num: num,
        inHandsNum: this.inHands.length,
    });
};

// 弃牌
pro.dropCard = function (num, cardType, cardQuality, cardAttributes, piletype) {
    var validCards = [];

    var pile = this.inHands;
    for (var i in pile) {
        var card = pile[i];
        var cardData = cardTpl[card];
        if (cardType && cardType !== cardData.CardType)
            continue;
        if (cardQuality && cardQuality !== cardData.CardQuality)
            continue;
        if (cardAttributes && cardData.CardAttributes.indexOf(this.cardAttributes) === -1)
            continue;

        validCards.push({
            idx: i,
            card: card,
        })
    }

    // 没有符合的卡牌
    if (validCards.length === 0) {
        this.entity.logger.info("drop card no valid. ");
        return;
    }
    if (validCards.length <= num) {
        var cards = validCards;
    }
    else {
        fightHelper.shuffle(validCards);
        var cards = validCards.slice(0, num);
        cards.sort(function (a, b) {
            return a.idx - b.idx;
        })
    }

    var broadcast = {};
    // 弃牌
    for (var i = cards.length - 1; i >= 0; i--) {
        var info = cards[i];
        this.inHands.splice(info.idx, 1);
        var type = piletype;
        if (!type) {
            type = Math.floor(Math.random() * consts.PileType.MAX) + 1;
        }
        var toPile = this._getPileByType(type);
        if (type === consts.PileType.CARDS) {
            var idx = Math.floor(Math.random() * toPile.length);
            toPile.splice(idx, 0, info.card);
        }
        else
            toPile.push(info.card);
        info["toPile"] = type;
        broadcast[type] = (broadcast[type] || 0) + 1;
    }
    // to client
    this.entity.updateFightData('onDropCard', {
        dropInfo: cards,
        inHands: this.inHands,
    });
    // broadcast
    this.entity.broadcastToOthers('onDropCardNotify', {
        targetID: this.entity.id,
        toPile: broadcast,
        inHandsNum: this.inHands.length
    });
};

pro.destroy = function () {
    this.stopDrawTimer();
    Component.prototype.destroy.call(this);
};
