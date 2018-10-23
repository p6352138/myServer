/**
 * Date: 2018/7/19
 * Author: liuguolai
 * Description: 伤害监听buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var OnDamageListenerBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
    this.effectTimes = 0;
};

util.inherits(OnDamageListenerBuff, BuffLogic);
module.exports = OnDamageListenerBuff;

var pro = OnDamageListenerBuff.prototype;

pro._onSubHp = function (entity, oldVal, newVal) {
    if (oldVal - newVal >= this.needDmg) {
        this.effectTimes++;
        if (this.effectTimes >= this.times) {
            this.effectTimes = 0;
            if (this.data.SkillID) {
                entity.skillCtrl.useSkill(this.data.SkillID, this.cell.level);
            }
            if (this.count > 0) {
                this.count--;
                if (this.count === 0) {
                    this.suicide(null, this.cell.id);
                }
            }
        }
    }
};

pro._onEnter = function () {
    var logicData = this.data.Logic;
    this.count = logicData.count || -1;  // 生效次数
    this.needDmg = logicData.onDmg || 1;
    this.times = logicData.onDmgCount || 1;

    this._func = this._onSubHp.bind(this);
    this.entity.prop.on("EventSubHp", this._func);
};

pro._onExit = function () {
    this.entity.prop.removeListener("EventSubHp", this._func);
};
