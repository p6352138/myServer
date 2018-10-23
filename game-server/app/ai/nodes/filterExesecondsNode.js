/**
 * Date: 2018/7/2
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var FilterExesecondsNode = function (name, ms) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.FILTER_EXE_SECONDS;
    this._ms = ms;
};

util.inherits(FilterExesecondsNode, BTreeNode);
module.exports = FilterExesecondsNode;

FilterExesecondsNode.prototype.update = function (runningData, agent) {
    var lastPos = -1;
    if (this._id in runningData.lastRunningChild)
        lastPos = runningData.lastRunningChild[this._id];
    var res = bt_consts.StatusType.SUCCESS;
    var childRes = bt_consts.StatusType.SUCCESS;
    if (this._children.length > 0) {
        var timeNow = new Date().getTime();
        if (this._id in runningData.nodeInfo) {
            var timeEnd = runningData.nodeInfo[this._id];
        } else {
            var timeEnd = timeNow + this._ms;
            runningData.nodeInfo[this._id] = timeEnd;
        }
        if (timeNow <= timeEnd || lastPos !== -1) {
            // 只有在当前时间内，或上次child是running态才运行下一次
            childRes = this._children[0].update(runningData, agent);
        }
        if (timeNow > timeEnd && childRes != bt_consts.StatusType.RUNNING) {
            res = bt_consts.StatusType.SUCCESS;
            delete runningData.nodeInfo[this._id];
        } else {
            res = bt_consts.StatusType.RUNNING;
        }
    }
    if (childRes === bt_consts.StatusType.RUNNING) {
        runningData.lastRunningChild[this._id] = 1;
    }
    else if (lastPos !== -1) {
        delete runningData.lastRunningChild[this._id];
    }
    return res;
};
