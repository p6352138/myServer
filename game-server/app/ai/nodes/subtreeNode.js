/**
 * Date: 2018/6/28
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');
var btreeManager = _require('../btreeManager');

var SubtreeNode = function (name, subtreeName) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.SUBTREE;
    this._subtreeName = subtreeName;
    this._subtreeID = -1;
};

util.inherits(SubtreeNode, BTreeNode);
module.exports = SubtreeNode;

SubtreeNode.prototype.update = function (runningData, agent) {
    if (this._subtreeID < 0) {
        var bt = btreeManager.getByName(this._subtreeName);
        if (bt) {
            this._subtreeID = bt.getID();
        }
    }
    if (this._subtreeID < 0) {
        console.error('can not find btree: ' + this._subtreeName);
        return bt_consts.StatusType.ERROR_UNKNOWN_SUBTREE;
    }
    var res = bt_consts.StatusType.BREAK;
    var lastPos = -1;
    if (this._id in runningData.lastRunningChild)
        lastPos = runningData.lastRunningChild[this._id];
    if (lastPos === -1) {
        runningData.btreeIds.push(this._subtreeID);
        runningData.curBtreePos ++;
        res = bt_consts.StatusType.RUNNING;
    }
    else {
        res = runningData.subtreeRet;
        runningData.subtreeRet = bt_consts.StatusType.BREAK;
    }

    if (res === bt_consts.StatusType.RUNNING) {
        runningData.lastRunningChild[this._id] = 0;
    }
    else if (lastPos !== -1) {
        delete runningData.lastRunningChild[this._id];
    }
    return res;
};
