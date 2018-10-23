/**
 * Date: 2018/9/14
 * Author: liuguolai
 * Description: 朱雀之印特殊buff
 */
let BuffLogic = _require('./buffLogic');
let util = require('util');

let FireMarkBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(FireMarkBuff, BuffLogic);
module.exports = FireMarkBuff;

let pro = FireMarkBuff.prototype;

pro._onEnter = function () {
    let logicData = this.data.Logic;
    let fireDmg = logicData.fireDmg;
    let layer = this.buff.layer;

    this.entity.combat.setAttackExtraDamage(this.cell.casterID, fireDmg * layer);
};

pro._onExit = function () {
    this.entity.combat.setAttackExtraDamage(this.cell.casterID, 0);
};

pro.refresh = function () {
    this._onEnter();
};
