/**
 * Date: 2018/7/9
 * Author: liuguolai
 * Description: buff逻辑代码，由BaseBuff创建
 */
var buffTpl = _require('../../../data/Buff');

var BuffLogic = function (buff, cell, logicid) {
    this.buff = buff;
    this.cell = cell;
    this.id = logicid;  // 暂定buffid

    Object.defineProperty(this, 'data', {
        get: function () {
            return buffTpl[this.id];
        }
    });

    Object.defineProperty(this, 'entity', {
        get: function () {
            return this.buff.owner.entity;
        }
    });
};

module.exports = BuffLogic;

var pro = BuffLogic.prototype;

pro.refresh = function () {

};

// 不要重写，重写相应的_onEnter
pro.onEnter = function () {
    this._onEnter();
};

pro.onExit = function () {
    this._onExit();

    this.buff = null;
    this.cell = null;
};

pro._onEnter = function () {

};

pro._onExit = function () {

};

pro.suicide = function () {
    if (this.buff && this.entity) {
        var args = [this.buff.id, this.cell.casterID];
        for (var arg of arguments)
            args.push(arg);
        var buffCtrl = this.entity.buffCtrl;
        buffCtrl.removeBuff.apply(buffCtrl, args);
    }
};

pro.onRefreshEndTime = function (times) {

};

pro.refresh = function () {

};
