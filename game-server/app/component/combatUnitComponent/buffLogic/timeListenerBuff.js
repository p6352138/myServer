/**
 * Date: 2018/9/14
 * Author: liuguolai
 * Description: 时间监听
 */
let BuffLogic = _require('./buffLogic');
let util = require('util');

let TimeListenerBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(TimeListenerBuff, BuffLogic);
module.exports = TimeListenerBuff;

let pro = TimeListenerBuff.prototype;

pro._tick = function () {
    if (this.data.SkillID) {
        this.entity.skillCtrl.useSkill(this.data.SkillID, this.cell.level);
    }
};

pro._onEnter = function () {
    let logicData = this.data.Logic;
    let time = logicData.time;

    this.timer = setInterval(this._tick.bind(this), time * 1000);
};

pro._onExit = function () {
    clearInterval(this.timer);
};
