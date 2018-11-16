/**
 * Date: 2018/11/14
 * Author: liuguolai
 * Description: 战斗卡牌对象
 */
let cardTpl = _require('../data/Card');

let CardEntity = function (cardID, opts) {
    this.cid = cardID;
    this.config = cardTpl[cardID];
    this.lv = 1;
    this.mp = this.config.CastMP;

    this._initAttris(opts);
};

module.exports = CardEntity;
let pro = CardEntity.prototype;

pro._initAttris = function (attris) {
    if (!attris)
        return;
    for (let key in attris) {
        this[key] = attris[key];
    }
};

pro.getClientInfo = function () {
    return {
        cid: this.cid,
        lv: this.lv,
        mp: this.mp,
    }
};
