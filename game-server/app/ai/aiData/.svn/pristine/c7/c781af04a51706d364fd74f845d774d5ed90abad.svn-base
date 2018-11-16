// !!!auto generate!!!
var bt_consts = _require('../bt_consts');
var btreeManager = _require('../btreeManager');
var nodes = _require('../nodes/leafNodes');
var consts = _require('../../common/consts');

var TREE_NAME = "bt_subtree_test";

/**
 * 行为树测试
 */
var n00_showText = function(owner) {
    return nodes.showText("子树测试！！", 0);
};


/**
 * 行为树测试
 */
var n02_showText = function(owner) {
    return nodes.showText("子树测试！！！", 11);
};


// btree define
var bt_code = {
    n_root: {type: bt_consts.NodeType.ROOT, children: ['n0_Sequence']},
    // Sequence
    n0_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n00_showText', 'n01_quitSubtree', 'n02_showText']},
    n00_showText: {type: bt_consts.NodeType.LEAF, func: n00_showText},
    // 跳出子树，返回bt_consts.StatusType.FAILURE
    n01_quitSubtree: {type: bt_consts.NodeType.QUITTREE, quitType: bt_consts.StatusType.FAILURE},
    n02_showText: {type: bt_consts.NodeType.LEAF, func: n02_showText}
};


var res = btreeManager.createTree(TREE_NAME, bt_code);
if (!res) {
    throw new Error("load btree failed!!! tree name is " + TREE_NAME);
};

// 引入子树
for (var name in bt_code) {
    if (bt_code[name].type == bt_consts.NodeType.SUBTREE)
        _require('./' + bt_code[name].subtree);
};
