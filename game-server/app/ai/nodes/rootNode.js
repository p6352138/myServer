/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var RootNode = function (name) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.ROOT;
};

util.inherits(RootNode, BTreeNode);
module.exports = RootNode;

RootNode.prototype.update = function (runningData, agent) {
    if (this._children.length === 0)
        return bt_consts.StatusType.SUCCESS;
    return this._children[0].update(runningData, agent);
};
