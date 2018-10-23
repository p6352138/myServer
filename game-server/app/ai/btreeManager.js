/**
 * Date: 2018/6/28
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('./bt_consts');
var nodeManager = _require('./nodeManager');
var BTree = _require('./btree');

var currTreeID = 1;
var trees = {};  // treeId: btree
var name2id = {};

var btreeManager = module.exports;

btreeManager.insert = function (bt, replace) {
    if ( currTreeID <= 0 )
        return -1;
    var name = bt.getName();
    if (!name2id.hasOwnProperty(name)) {
        ++currTreeID;
        trees[currTreeID] = bt;
        name2id[name] = currTreeID;
        bt.setID(currTreeID);
        return currTreeID;
    }
    else if (replace) {
        var treeID = name2id[name];
        var oldTree = trees[treeID];
        if (oldTree == bt)
            return treeID;
        bt.setID(treeID);
        trees[treeID] = bt;
        oldTree.destroy();  // 老树销毁
        return treeID;
    }
    return -1;
};

btreeManager.remove = function (id) {
    if (id in trees) {
        var bt = trees[id];
        var name = bt.getName();
        delete name2id[name];
        delete trees[id];
        bt.destroy();
    }
};

btreeManager.getByName = function (name) {
    var id = name2id[name];
    if (!id)
        return null;
    return trees[id];
};

btreeManager.getByID = function (id) {
    return trees[id] || null;
};

var currNodeID = 0;
btreeManager.getNewNodeID = function () {
    return ++currNodeID;
};

// 构建树
var buildTree = function (nodeName, treeInfo) {
    var nodeInfo = treeInfo[nodeName];
    var node = nodeManager.createByNode(nodeName, nodeInfo);
    if (!node)
        return null;

    var children = nodeInfo["children"];
    var probs = nodeInfo["children_prob"];
    var type = nodeInfo["type"];
    if (children) {
        for (var i = 0, len = children.length; i < len; i++) {
            var child = buildTree(children[i], treeInfo);
            if (!child) {
                return null;
            }
            if (type === bt_consts.NodeType.PROBABILITY) {
                node.addChildWithProb(child, probs[i]);
            }
            else {
                node.addChild(child);
            }
        }
    }
    return node;
};

// 创建行为树
btreeManager.createTree = function (treeName, treeInfo) {
    var rootName = null;
    for (var name in treeInfo) {
        // todo: 节点检查
        if (treeInfo[name]["type"] === bt_consts.NodeType.ROOT) {
            if (!rootName)
                rootName = name;
            else {
                console.error("multi roots");
                rootName = null;
                break;
            }
        }
    }
    if (!rootName)
        return false;

    var rootNode = buildTree(rootName, treeInfo);
    if (!rootNode)
        return false;

    var tree = new BTree(treeName, rootNode);
    var btreeID = btreeManager.insert(tree);
    if (btreeID < 0) {  // 表示该btree name已经存在
        rootNode.destroy();
        return false;
    }
    return true;
};
