/**
 * Date: 2018/6/28
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var LeafNode = function (name, func) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.LEAF;
    this._func = func;
};

util.inherits(LeafNode, BTreeNode);
module.exports = LeafNode;

LeafNode.prototype.update = function (runningData, agent) {
    if (!this._func)
        return bt_consts.StatusType.ERROR_;
    return this._func(agent);
};

LeafNode.prototype.destroy = function () {
    BTreeNode.prototype.destroy.call(this);
    this._func = null;
};