/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var SelectorNode = function (name) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.SELECTOR;
};

util.inherits(SelectorNode, BTreeNode);
module.exports = SelectorNode;

SelectorNode.prototype.update = function (runningData, agent) {
    if (this._children.length === 0)
        return bt_consts.StatusType.SUCCESS;
    var startPos = -1;
    if (this._id in runningData.lastRunningChild)
        startPos = runningData.lastRunningChild[this._id];
    var res = bt_consts.StatusType.FAILURE;
    var i = Math.max(0, startPos);
    for (var len = this._children.length; i < len; i++) {
        res = this._children[i].update(runningData, agent);
        if (res !== bt_consts.StatusType.FAILURE)
            break;
    }
    if (res === bt_consts.StatusType.RUNNING) {
        runningData.lastRunningChild[this._id] = i;
    }
    else if (startPos !== -1) {
        delete runningData.lastRunningChild[this._id];
    }
    return res;
};