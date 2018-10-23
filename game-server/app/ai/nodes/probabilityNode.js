/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var ProbabilityNode = function (name) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.PROBABILITY;
    this._probs = [];
    this._sum = 0;
};

util.inherits(ProbabilityNode, BTreeNode);
module.exports = ProbabilityNode;

ProbabilityNode.prototype.update = function (runningData, agent) {
    if (this._children.length === 0)
        return bt_consts.StatusType.SUCCESS;
    var lastPos = -1;
    if (this._id in runningData.lastRunningChild)
        lastPos = runningData.lastRunningChild[this._id];
    var pos = lastPos;
    if (lastPos === -1) {
        var len = this._children.length;
        var rd = Math.floor(Math.random() * this._sum) + 1;
        for (pos = 0; pos < len; pos++) {
            rd -= this._probs[pos];
            if (rd <= 0)
                break;
        }
    }
    var res = this._children[pos].update(runningData, agent);
    if (res === bt_consts.StatusType.RUNNING) {
        runningData.lastRunningChild[this._id] = pos;
    }
    else if (lastPos !== -1) {
        delete runningData.lastRunningChild[this._id];
    }
    return res;
};

ProbabilityNode.prototype.addChildWithProb = function(child, prob) {
    this._children.push(child);
    prob = Math.abs(prob);
    this._probs.push(prob);
    this._sum += prob;
    child.setParent(this);
    return true;
};

ProbabilityNode.prototype.destroy = function () {
    BTreeNode.prototype.destroy.call(this);
    this._probs = [];
};
