/**
 * Date: 2018/7/2
 * Author: liuguolai
 * Description:
 */
var BTreeNode = _require('./btreeNode');
var util = _require('util');
var bt_consts = _require('../bt_consts');

var FilterExetimesNode = function (name, cnt, onlySuccess) {
    BTreeNode.call(this, name);

    this._nodeType = bt_consts.NodeType.FILTER_EXE_TIMES;
    this._cnt = cnt;
    this._onlySuccess = onlySuccess;  // 只算成功次数
};

util.inherits(FilterExetimesNode, BTreeNode);
module.exports = FilterExetimesNode;

FilterExetimesNode.prototype.update = function (runningData, agent) {
    var cnt = 0;
    if (this._id in runningData.nodeInfo)
        cnt = runningData.nodeInfo[this._id];
    var res = bt_consts.StatusType.FAILURE;
    if (this._children.length > 0 && (this._cnt < 0 || cnt < this._cnt)) {
        res = this._children[0].update(runningData, agent);
        if (this._onlySuccess) {
            if (res === bt_consts.StatusType.SUCCESS)
                runningData.nodeInfo[this._id] = cnt + 1;
        } else {
            runningData.nodeInfo[this._id] = cnt + 1;
        }

    }
    return res;
};