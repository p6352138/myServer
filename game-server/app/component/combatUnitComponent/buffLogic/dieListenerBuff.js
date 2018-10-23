/**
 * Date: 2018/7/19
 * Author: liuguolai
 * Description: 死亡监听buff
 */
var BuffLogic = _require('./buffLogic');
var util = _require('util');

var DieListenerBuff = function (buff, cell, logicid) {
    BuffLogic.call(this, buff, cell, logicid);
};

util.inherits(DieListenerBuff, BuffLogic);
module.exports = DieListenerBuff;

var pro = DieListenerBuff.prototype;

pro._check = function (entity) {
    if (this.data.SkillID) {
        this.entity.skillCtrl.useSkill(this.data.SkillID, this.cell.level, entity.id);
    }
    if (this.count > 0) {
        this.count --;
        if (this.count === 0) {
            this.suicide(null, this.cell.id);
        }
    }
};

pro._onDie = function (entity) {
    setImmediate(this._check.bind(this, entity));
};

pro._onEnter = function () {
    var logicData = this.data.Logic;
    this.count = logicData.count || -1;  // 生效次数
    var target = logicData.target;
    var isEnemy = target === "friend" ? false : true;
    if (isEnemy) {
        var ents = this.entity.getAllEnemies();
    }
    else {
        var ents = this.entity.getAllFriends();
    }
    this.ents = [];
    this._func = this._onDie.bind(this);
    for (var ent of ents) {
        if (ent.id === this.entity.id)
            continue
        ent.state.on("EventDie", this._func);
        this.ents.push(ent);
    }
};

pro._onExit = function () {
    for (var ent of this.ents) {
        ent.state.removeListener("EventDie", this._func);
    }
    this.ents = null;
};
