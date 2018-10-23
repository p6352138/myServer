/**
 * Date: 2018/9/11
 * Author: liuguolai
 * Description: 造成伤害次数监听buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var DamageListenerBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
    this.effectTimes = 0;  // 生效次数
};

util.inherits(DamageListenerBuff, BuffLogic);
module.exports = DamageListenerBuff;

var pro = DamageListenerBuff.prototype;

pro._onDoDamageToOther = function (entity, fromHp, toHp) {
    if (fromHp - toHp >= this.needDmg) {
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
    let logicData = this.data.Logic;
    this.count = logicData.count || -1;  // 生效次数
    this.needDmg = logicData.dmg || 1;
    this.times = logicData.dmgCount || 1;

    this._func = this._onDoDamageToOther.bind(this);
    this.entity.combat.on("EventDoDamageToOther", this._func);
};

pro._onExit = function () {
    this.entity.combat.removeListener("EventDoDamageToOther", this._func);
};
