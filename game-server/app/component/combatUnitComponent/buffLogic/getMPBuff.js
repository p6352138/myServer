/**
 * Date: 2018/9/12
 * Author: liuguolai
 * Description:  恢复灵力buff
 */
let BuffLogic = _require('./buffLogic');
let util = require('util');

let GetMPBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(GetMPBuff, BuffLogic);
module.exports = GetMPBuff;

let pro = GetMPBuff.prototype;

pro._onGetMP = function () {
    this.entity.activeRecoverMp(this.mp);
    this.count--;
    if (this.count <= 0) {
        this.suicide(null, this.cell.id);
    }
};

pro._onEnter = function () {
    let logicData = this.data.Logic;
    let tick = logicData.time * 1000;
    this.count = logicData.count;
    this.mp = logicData.getMP;

    this.timer = setInterval(this._onGetMP.bind(this), tick);
};

pro._onExit = function () {
    clearInterval(this.timer);
};
