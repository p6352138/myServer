/**
 * Date: 2018/9/11
 * Author: liuguolai
 * Description: 持续伤害
 */
var BuffLogic = _require('./buffLogic');
var util = require('util');

var DotBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(DotBuff, BuffLogic);
module.exports = DotBuff;

var pro = DotBuff.prototype;

pro._onDot = function () {
    // 一个cell多次调用，减少定时器使用
    let effectNum = this.cell.effectNum || 1;
    for (let i = 0; i < effectNum; i++) {
        this.entity.combat.onBuffModHp(this.buff, -this.dmg, this.cell.casterID, this.cell.skillID);
    }
    this.count--;
    if (this.count <= 0) {
        this.suicide(null, this.cell.id);
    }
};

pro._onEnter = function () {
    let logicData = this.data.Logic;
    let tick = logicData.time * 1000;
    this.count = logicData.count;
    this.dmg = logicData.dmg;

    this.timer = setInterval(this._onDot.bind(this), tick);
};

pro._onExit = function () {
    clearInterval(this.timer);
};

pro.onRefreshEndTime = function (times) {
    this.count = Math.floor(this.count * times);
};
