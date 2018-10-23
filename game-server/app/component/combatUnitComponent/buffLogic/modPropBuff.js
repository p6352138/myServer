/**
 * Date: 2018/7/19
 * Author: liuguolai
 * Description: 易伤buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var ModPropBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(ModPropBuff, BuffLogic);
module.exports = ModPropBuff;

var pro = ModPropBuff.prototype;

pro._onEnter = function () {
    var logicData = this.data.Logic;
    for (var propName in logicData) {
        if (!this.entity.hasOwnProperty(propName))
            throw new Error(this.entity.id + " mod porp without porp: " + propName);
        this.entity.prop.modProp(propName, logicData[propName]);
    }
};

pro._onExit = function () {
    var logicData = this.data.Logic;
    for (var propName in logicData) {
        if (this.entity.hasOwnProperty(propName))
            this.entity.prop.modProp(propName, -logicData[propName]);
    }
};
