/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('../bt_consts');
var btreeManager = _require('../btreeManager');

var BTreeNode = function (name) {
    this._id = btreeManager.getNewNodeID();
    this._nodeName = name;
    this._children = [];
    this._parent = null;
    this._nodeType = undefined;
};

module.exports = BTreeNode;

BTreeNode.prototype.update = function (runningData, agent) {
    return bt_consts.StatusType.ERROR_;
}

BTreeNode.prototype.setParent = function (parent) {
    this._parent = parent;
};

BTreeNode.prototype.addChild = function (child) {
    this._children.push(child);
    child.setParent(this);
    return true;
};

BTreeNode.prototype.addChildWithProb = function (child, prob) {
    return false;
};

BTreeNode.prototype.getChildren = function () {
    return this._children;
};

BTreeNode.prototype.clearChildren = function () {
    for (var i = 0, len = this._children.length; i < len; i++) {
        this._children[i].destroy();
    }
    this._children = [];
};

BTreeNode.prototype.getID = function () {
    return this._id;
};

BTreeNode.prototype.destroy = function () {
    this.clearChildren();
};
