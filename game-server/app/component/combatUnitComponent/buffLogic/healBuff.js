/**
 * Date: 2018/7/18
 * Author: liuguolai
 * Description: 治疗buff逻辑
 */

var BuffLogic = _require('./buffLogic');
var util = _require('util');

var HealBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(HealBuff, BuffLogic);
module.exports = HealBuff;

var pro = HealBuff.prototype;

pro._onHeal = function () {
    this.entity.combat.onBuffModHp(this.buff, this.heal, this.cell.casterID, this.cell.skillID);
    this.count --;
    if (this.count <= 0) {
        this.suicide(null, this.cell.id);
    }
};

pro._onEnter = function () {
    var logicData = this.data.Logic;
    this.heal = logicData.heal;
    this.count = logicData.count;
    var tick = logicData.time * 1000;

    this.timer = setInterval(this._onHeal.bind(this), tick);
};

pro._onExit = function () {
    clearInterval(this.timer);
};
