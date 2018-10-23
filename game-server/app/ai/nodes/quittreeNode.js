/**
 * Date: 2018/6/28
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var SubtreeNode = function (name, retType) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.QUITTREE;
    this._retType = retType || bt_consts.StatusType.BREAK;
};

util.inherits(SubtreeNode, BTreeNode);
module.exports = SubtreeNode;

SubtreeNode.prototype.update = function (runningData, agent) {
    if (runningData.curBtreePos > 0) {
        runningData.btreeIds.pop();
        runningData.curBtreePos --;
        runningData.subtreeRet = this._retType;  // 传给父树
    }
    return bt_consts.StatusType.BREAK;
};
