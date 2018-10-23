/**
 * Date: 2018/7/9
 * Author: liuguolai
 * Description:
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var AddArm = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);

    this.leftArmor = 0;  // 该buff剩余护甲
};

util.inherits(AddArm, BuffLogic);
module.exports = AddArm;

var pro = AddArm.prototype;

pro._addArm = function (armor) {
    this.leftArmor = armor;
    this.entity.prop.modProp('armor', armor);
    this.entity.buffCtrl.addArmorBuffLogic(this);
};

pro._onEnter = function () {
    var logicData = this.data.Logic;
    this._addArm(logicData.arm);
};

pro._onExit = function () {
    if (this.leftArmor)
        this.entity.prop.modProp('armor', -this.leftArmor);
    this.entity.buffCtrl.removeArmorBuffLogic(this);
};

// 结算伤害
pro.calcDamage = function (damage) {
    if (this.leftArmor > damage) {
        this.leftArmor -= damage;
        this.entity.prop.modProp('armor', -damage, true);
        return -1;
    }
    else {
        var leftDamage = damage - this.leftArmor;
        this.entity.prop.modProp('armor', -this.leftArmor, true);
        this.leftArmor = 0;
        this.suicide(null, this.cell.id);
        return leftDamage;
    }
};
