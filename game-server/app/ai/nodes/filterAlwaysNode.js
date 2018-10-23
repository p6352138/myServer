/**
 * Date: 2018/7/2
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var FilterAlwaysNode = function (name, alwaysType) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.FILTER_ALWAYS;
    this._alwaysType = alwaysType;
};

util.inherits(FilterAlwaysNode, BTreeNode);
module.exports = FilterAlwaysNode;

FilterAlwaysNode.prototype.update = function (runningData, agent) {
    var res = bt_consts.StatusType.SUCCESS;
    if (this._children.length > 0)
        res = this._children[0].update(runningData, agent);
    // if (res === bt_consts.StatusType.SUCCESS || res === bt_consts.StatusType.FAILURE)
    //     res = this._alwaysType;  // running不处理
    res = this._alwaysType;
    return res;
};
