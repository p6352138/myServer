/**
 * Date: 2018/7/27
 * Author: liuguolai
 * Description: 按Percent修改buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var ModPropPctBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(ModPropPctBuff, BuffLogic);
module.exports = ModPropPctBuff;

var pro = ModPropPctBuff.prototype;

pro._onEnter = function () {
    var logicData = this.data.Logic;
    for (var propName in logicData) {
        if (!this.entity.hasOwnProperty(propName))
            throw new Error(this.entity.id + " mod porp percent without porp: " + propName);
        this.entity.prop.modPropPct(propName, logicData[propName]);
    }
};

pro._onExit = function () {
    var logicData = this.data.Logic;
    for (var propName in logicData) {
        if (this.entity.hasOwnProperty(propName))
            this.entity.prop.modPropPct(propName, -logicData[propName]);
    }
};
