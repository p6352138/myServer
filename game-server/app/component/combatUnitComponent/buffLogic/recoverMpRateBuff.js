/**
 * Date: 2018/7/20
 * Author: liuguolai
 * Description: 恢复MP速率buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var RecoverMpRateBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(RecoverMpRateBuff, BuffLogic);
module.exports = RecoverMpRateBuff;

var pro = RecoverMpRateBuff.prototype;

pro._onEnter = function () {
    var logicData = this.data.Logic;
    this.rate = logicData.rate;
    this.entity.addMpRecoverRateBuff(this.rate);
};

pro._onExit = function () {
    this.entity.removeMpRecoverRateBuff(this.rate);
};
