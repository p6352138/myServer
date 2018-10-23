/**
 * Date: 2018/7/19
 * Author: liuguolai
 * Description: 抽卡监听buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');
var cardTpl = _require('../../../data/Card');

var DrawCardListenerBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(DrawCardListenerBuff, BuffLogic);
module.exports = DrawCardListenerBuff;

var pro = DrawCardListenerBuff.prototype;

pro._onDrawCard = function (entity, cid, pileType) {
    if (this.piletype && this.piletype !== pileType)
        return;
    var cardData = cardTpl[cid];
    if (this.cardType && this.cardType !== cardData.CardType)
        return;
    if (this.cardQuality && this.cardQuality !== cardData.CardQuality)
        return;
    if (this.cardAttributes && cardData.CardAttributes.indexOf(this.cardAttributes) === -1)
        return;
    this.num--;
    if (this.num === 0) {
        if (this.data.SkillID) {
            this.entity.skillCtrl.useSkill(this.data.SkillID, this.cell.level);
        }
        this.num = this.data.Logic.num;
        if (this.count > 0) {
            this.count--;
            if (this.count === 0) {
                this.suicide(null, this.cell.id);
            }
        }
    }
};

pro._onEnter = function () {
    var logicData = this.data.Logic;
    this.count = logicData.count || -1;  // 生效次数
    this.num = logicData.num;
    this.cardType = logicData.cardType;
    this.cardQuality = logicData.cardQuality;
    this.cardAttributes = logicData.cardAttributes;
    this.piletype = logicData.piletype;

    this._func = this._onDrawCard.bind(this);
    this.entity.cardCtrl.on("EventDrawCard", this._func);
};

pro._onExit = function () {
    this.entity.cardCtrl.removeListener("EventDrawCard", this._func);
};
