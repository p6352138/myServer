/**
 * Date: 2018/7/2
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var FilterExeintervalNode = function (name, interval, firstDelay) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.FILTER_EXE_SECONDS;
    this._second = interval;
    this._firstDelay = firstDelay;
};

util.inherits(FilterExeintervalNode, BTreeNode);
module.exports = FilterExeintervalNode;

FilterExeintervalNode.prototype.update = function (runningData, agent) {
    var lastPos = -1;
    if (this._id in runningData.lastRunningChild)
        lastPos = runningData.lastRunningChild[this._id];
    var res = bt_consts.StatusType.FAILURE;
    if (this._children.length > 0) {
        var timeNow = new Date().getTime();
        if (this._id in runningData.nodeInfo) {
            var timeEnd = runningData.nodeInfo[this._id];
        } else {
            var timeEnd = timeNow + this._firstDelay * 1000;
            runningData.nodeInfo[this._id] = timeEnd;
        }
        if (timeNow >= timeEnd || lastPos !== -1) {
            // 达到下一次运行时间，或上次child是running态才运行一次
            res = this._children[0].update(runningData, agent);
            runningData.nodeInfo[this._id] = timeNow + this._second * 1000;
        }
    }
    if (res === bt_consts.StatusType.RUNNING) {
        runningData.lastRunningChild[this._id] = 1;
    }
    else if (lastPos !== -1) {
        delete runningData.lastRunningChild[this._id];
    }
    return res;
};
