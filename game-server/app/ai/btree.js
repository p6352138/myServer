/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */
var bt_const = _require('./bt_consts');

var BTree = function (name, root) {
    this.treeID = -1;
    this.treeName = name;
    this.treeRoot = root;
};

module.exports = BTree;

BTree.prototype.entry = function (runningData, agent) {
    if (this.treeRoot) {
        return this.treeRoot.update(runningData, agent);
    }
    return bt_const.StatusType.ERROR_;
};

BTree.prototype.getName = function () {
    return this.treeName;
};

BTree.prototype.setID = function (id) {
    this.treeID = id;
};

BTree.prototype.getID = function () {
    return this.treeID;
};

BTree.prototype.destroy = function () {
    if (this.treeRoot) {
        this.treeRoot.destroy();
        this.treeRoot = null;
    }
    this.treeID = -1;
    this.treeName = null;
};
