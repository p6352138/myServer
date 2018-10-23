/**
 * Date: 2018/9/10
 * Author: liuguolai
 * Description: 嘲讽buff
 */
var BuffLogic = _require('./buffLogic');
var util = require('util');

var TauntBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(TauntBuff, BuffLogic);
module.exports = TauntBuff;

var pro = TauntBuff.prototype;

pro._onEnter = function () {
    this.entity.skillCtrl.setTauntTargetID(this.cell.casterID);
};

pro._onExit = function () {
    this.entity.skillCtrl.setTauntTargetID("");
};
