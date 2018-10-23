/**
 * Date: 2018/7/9
 * Author: liuguolai
 * Description: buff 基类
 */
var buffTpl = _require('../../../data/Buff');
var consts = _require('../../../public/consts');
var buffRegister = _require('./buffRegister');

var BuffCell = function (opts) {
    this.owner = opts.owner;
    this.id = 0;  // cell id
    this.level = opts.level;
    this.startTime = opts.startTime;
    this.endTime = opts.endTime;
    this.casterID = opts.casterID;
    this.skillID = opts.skillID;
    this.effectNum = undefined;  // 生效数量，特殊处理同个逻辑多次生效的情况
    this.extraData = opts.extraData;
    if (this.extraData && this.extraData.hasOwnProperty('effectNum')) {
        this.effectNum = this.extraData.effectNum;
    }

    Object.defineProperty(this, 'entity', {
        get: function () {
            return this.owner.owner.entity;
        }
    });

    Object.defineProperty(this, 'buff', {
        get: function () {
            return this.owner;
        }
    });

    Object.defineProperty(this, 'buffID', {
        get: function () {
            return this.buff.id;
        }
    });

    // init buff logic
    this._initLogics();
    this.activeFlag = false;
    this._timer = null;
};

BuffCell.prototype._initLogics = function () {
    this.logics = [];
    // 可能后续一个buff由多个逻辑组成，弄个高扩展的框架，先唯一读表
    var buffType = buffTpl[this.buffID].Type;
    var Class = buffRegister.getBuffLogic(buffType);
    var logic = new Class(this.buff, this, this.buffID);
    this.logics.push(logic);
};

BuffCell.prototype.getClientInfo = function () {
    return {
        endTime: this.endTime,
        casterID: this.casterID,
        effectNum: this.effectNum,
    };
};

BuffCell.prototype.onEnter = function () {
    if (this.activeFlag)
        return;
    this.activeFlag = true;
    for (var logic of this.logics) {
        logic.onEnter();
    }
    if (this.endTime != consts.Buff.BUFF_PERMANENT) {
        this._timer = setTimeout(this.onTimeout.bind(this), this.endTime - this.startTime);
    }
};

BuffCell.prototype.onExit = function () {
    if (!this.activeFlag)
        return;
    this.activeFlag = false;
    if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
    }
    for (var logic of this.logics) {
        logic.onExit();
    }
    this.logics = null;
};

BuffCell.prototype.onTimeout = function () {
    this._timer = null;
    this.onExit();
    delete this.buff.cells[this.id];
    if (Object.keys(this.buff.cells).length === 0) {
        this.entity.buffCtrl.removeBuff(this.buff.id, this.casterID);
    }
};

/**
 * 刷新结束时间
 * @param times 剩余时间倍率
 */
BuffCell.prototype.refreshEndTime = function (times) {
    for (var logic of this.logics) {
        logic.onRefreshEndTime(times);
    }
    if (this.endTime === consts.Buff.BUFF_PERMANENT)
        return;
    let timeNow = new Date().getTime();
    let leftTime = this.endTime - timeNow;
    let newLeftTime = Math.floor(leftTime * times);
    this.endTime = timeNow + newLeftTime;
    if (this._timer) {
        clearTimeout(this._timer);
        this._timer = setTimeout(this.onTimeout.bind(this), this.endTime - newLeftTime);
    }
};

BuffCell.prototype.addEndTime = function (time) {
    if (this.endTime === consts.Buff.BUFF_PERMANENT)
        return;
    this.endTime += time * 1000;
    if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
        let timeNow = new Date().getTime();
        let leftTime = this.endTime - timeNow;
        if (leftTime <= 0) {
            this.onTimeout();
        }
        else {
            this._timer = setTimeout(this.onTimeout.bind(this), leftTime);
        }
    }
};

BuffCell.prototype.updateEndTime = function (endTime) {
    this.endTime = endTime;
    if (this._timer) {
        clearTimeout(this._timer);
        this._timer = setTimeout(this.onTimeout.bind(this), this.endTime - new Date().getTime());
    }
};

BuffCell.prototype.refresh = function () {
    for (var logic of this.logics) {
        logic.refresh();
    }
};

//////////////////////////////////////////

var BaseBuff = function (opts) {
    this.owner = opts.owner;
    this.id = opts.id;  // buffID
    this.realID = opts.realID;
    this.startTime = opts.startTime;
    this.endTime = 0;
    this.cells = {};  // 多层buff
    this.layer = 1;

    this.activeFlag = false;  // 是否已经激活
    this.curCellID = 1;

    Object.defineProperty(this, 'data', {
        get: function () {
            return buffTpl[this.id];
        }
    });
};

module.exports = BaseBuff;

var pro = BaseBuff.prototype;

pro.getClientInfo = function () {
    var info = {
        id: this.id,
        realID: this.realID,
        layer: this.layer
    }
    var cells = [];
    for (var cellID in this.cells) {
        var cell = this.cells[cellID];
        cells.push(cell.getClientInfo());
    }
    info["cells"] = cells;
    return info;
};

pro._genID = function () {
    return this.curCellID ++;
};

pro.addBuffCell = function (data) {
    var cellID = this._genID();
    data["owner"] = this;
    var cell = new BuffCell(data);
    cell.id = cellID;
    this.cells[cellID] = cell;
    if (this.endTime != consts.Buff.BUFF_PERMANENT) {
        this.endTime = cell.endTime === consts.Buff.BUFF_PERMANENT ?
            consts.Buff.BUFF_PERMANENT : Math.max(this.endTime, cell.endTime);
    }
    if (this.activeFlag)
        cell.onEnter();
};

pro.addLayer = function (startTime, endTime) {
    let refresh = false;
    if (this.layer < this.data.StackLimit) {
        this.layer++;
        refresh = true;
    }
    for (let cellID in this.cells) {
        let cell = this.cells[cellID];
        cell.startTime = startTime;
        cell.updateEndTime(endTime);
        if (refresh) {
            cell.refresh();
        }
    }
    if (this.endTime !== consts.Buff.BUFF_PERMANENT) {
        this.endTime = endTime === consts.Buff.BUFF_PERMANENT ?
            consts.Buff.BUFF_PERMANENT : Math.max(this.endTime, endTime);
    }
};

pro.onEnter = function () {
    if (this.activeFlag)
        return;
    this.activeFlag = true;
    for (var cellID in this.cells) {
        this.cells[cellID].onEnter();
    }
};

pro.onExit = function () {
    if (!this.activeFlag)
        return;
    this.activeFlag = false;
    for (var cellID in this.cells) {
        this.cells[cellID].onExit();
    }
};

// 按倍率刷新时间
pro.refreshEndTime = function (times) {
    for (let cellID in this.cells) {
        this.cells[cellID].refreshEndTime(times);
    }
};

// 按时间长短刷新时间
pro.addEndTime = function (time) {
    for (let cellID in this.cells) {
        this.cells[cellID].addEndTime(time);
    }
};

pro.removeCell = function (cellID) {
    if (!this.activeFlag)
        return;
    this.cells[cellID].onExit();
    delete this.cells[cellID];
};

pro.canAttach = function (ent, duration, data) {
    return true;
};

pro.canDetach = function (casterID) {
    return true;
};

pro.clear = function () {
    this.cells = null;
}
