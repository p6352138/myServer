/**
 * Date: 2018/6/26
 * Author: liuguolai
 * Description:
 */
var util = _require('util');
var Component = _require('../component');
var btExecutor = _require('../../ai/btExecutor');

var AIBehavior = function (entity) {
    Component.call(this, entity);

    this.aiExecutors = [];
    Object.defineProperty(this, 'aiExecutor', {
        get: function () {
            if (this.aiExecutors.length > 0)
                return this.aiExecutors[this.aiExecutors.length - 1];
            return null;
        }
    });

    this.defaultTickInterval = 500;  // 默认500ms
    this.tickInterval = 500;
    this.state = null;
    this.tickTimer = null;

    this.blackboards = [{}];  // 保留一个最初的黑板
    this.whiteboards = [{}];  // 白板，在reset时不会被清的数据

    this.pauseReason = {}
};

util.inherits(AIBehavior, Component);
module.exports = AIBehavior;

var pro = AIBehavior.prototype;

pro.pushAI = function (aiName) {
    var aiExec = new btExecutor(this, aiName);
    this.aiExecutors.push(aiExec);
    if (this.aiExecutors.length > 1) {
        this.blackboards.push({});
        this.whiteboards.push({});
    }
};

pro.popAI = function () {
    if (this.aiExecutors.length > 1) {
        this.blackboards.pop();
        this.whiteboards.pop();
    }
    var aiExec = this.aiExecutors.pop();
    aiExec.destroy();
};

pro.hasAI = function (aiName) {
    for (var aiExec of this.aiExecutors) {
        if (aiExec.name === aiName)
            return true;
    }
    return false;
};

pro.resetData = function (clearWhite=true) {
    if (this.aiExecutor) {
        this.aiExecutor.reset();
    }
    this.blackboards[this.blackboards.length - 1] = {}
    if (clearWhite) {
        this.whiteboards[this.whiteboards.length - 1] = {}
    }
};

// 一旦stop，AI节点的数据都清除了，不能再Resume，除非Reset
pro.stop = function () {
    var layerCnt = this.aiExecutors.length;
    while (layerCnt > 0) {
        this.aiExecutor.destroy();
        this.popAI();
        layerCnt--;
    }

    this.resetData();
};

pro.pause = function (reason) {
    if (this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
    }
    if (reason in this.pauseReason) {
        this.pauseReason[reason] += 1;
    }
    else {
        this.pauseReason[reason] = 1;
    }
};

pro.resume = function (reason) {
    this.pauseReason[reason] -= 1;
    if (this.pauseReason[reason] === 0)
        delete this.pauseReason[reason];
    if (Object.keys(this.pauseReason).length)
        return;
    if (!this.aiExecutor)
        return;

    if (!this.tickTimer) {
        this.tickTimer = setInterval(this._tick.bind(this), this.tickInterval);
        // this._tick();
    }
};

pro.reset = function (strategy, tickInterval, forceClearReason) {
    if (this.aiExecutor) {
        this.stop();
    }
    else {
        this.pauseReason = {}
    }
    if (forceClearReason) {
        this.pauseReason = {}
    }
    this.tickInterval = tickInterval ? tickInterval : this.defaultTickInterval;
    if (strategy)
        this.strategy = strategy;
    if (!this.strategy)
        return;

    this.pushAI(this.strategy);

    this.pause("Always");
    this.resume("Always");
};

pro.isRunning = function () {
    if (!this.aiExecutor)
        return false;
    return this.tickTimer ? true : false;
};

pro._tick = function () {
    if (this.entity.state.isDead())
        return false;
    if (!this.aiExecutor)
        return false;
    var ret = this.aiExecutor.tick();
    return ret;
};

pro.setRunningData = function (tag, data) {
    if (!data)
        delete this.blackboards[this.blackboards.length - 1][tag];
    else
        this.blackboards[this.blackboards.length - 1][tag] = data;
};

pro.getRunningData = function (tag, defaultVal) {
    var blackboard = this.blackboards[this.blackboards.length - 1]
    if (blackboard.hasOwnProperty(tag))
        return blackboard[tag];
    return defaultVal;
};

// 白名单数据
pro.setWhiteRunningData = function (tag, data) {
    if (!data)
        delete this.whiteboards[this.whiteboards.length - 1][tag];
    else
        this.whiteboards[this.whiteboards.length - 1][tag] = data;
};

pro.getWhiteRunningData = function (tag, defaultVal) {
    var whiteboard = this.blackboards[this.blackboards.length - 1]
    if (whiteboard.hasOwnProperty(tag))
        return whiteboard[tag];
    return defaultVal;
};

pro.destroy = function () {
    if (this.tickTimer) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
    }
    this.stop();
    Component.prototype.destroy.call(this);
};
