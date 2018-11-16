// !!!auto generate!!!
var bt_consts = _require('../bt_consts');
var btreeManager = _require('../btreeManager');
var nodes = _require('../nodes/leafNodes');
var consts = _require('../../common/consts');

var TREE_NAME = "jiaojing";

/**
 * 属性判断
 */
var n0000_checkAttributes = function(owner) {
    return nodes.checkAttributes(owner, "self", "hpPct", "<=", 0.75);
};


/**
 * 属性判断
 */
var n000100_checkAttributes = function(owner) {
    return nodes.checkAttributes(owner, "self", "mp", "<", 4);
};


/**
 * 跳出树，不执行之后的节点。返回BREAK
 */
var n000101_quit = function(owner) {
    return bt_consts.StatusType.BREAK;
};


/**
 * 选择仇恨值第1大目标
 */
var n000110_selectHatredTarget = function(owner) {
    return nodes.selectHatredTarget(owner, 0);
};


/**
 * 是否可使用卡牌 10004
 */
var n000111_canUseCard = function(owner) {
    return nodes.canUseCard(owner, 10004);
};


/**
 * 使用卡牌 id：10004
 */
var n000112_useCard = function(owner) {
    return nodes.useCard(owner, 10004);
};


/**
 * 属性判断
 */
var n0100_checkAttributes = function(owner) {
    return nodes.checkAttributes(owner, "self", "hpPct", "<=", 0.5);
};


/**
 * 属性判断
 */
var n010100_checkAttributes = function(owner) {
    return nodes.checkAttributes(owner, "self", "mp", "<", 0);
};


/**
 * 跳出树，不执行之后的节点。返回BREAK
 */
var n010101_quit = function(owner) {
    return bt_consts.StatusType.BREAK;
};


/**
 * 选择仇恨值第1大目标
 */
var n010110_selectHatredTarget = function(owner) {
    return nodes.selectHatredTarget(owner, 0);
};


/**
 * 是否可使用卡牌 10005
 */
var n010111_canUseCard = function(owner) {
    return nodes.canUseCard(owner, 10005);
};


/**
 * 使用卡牌 id：10005
 */
var n010112_useCard = function(owner) {
    return nodes.useCard(owner, 10005);
};


/**
 * 属性判断
 */
var n0200_checkAttributes = function(owner) {
    return nodes.checkAttributes(owner, "self", "hpPct", "<=", 0.25);
};


/**
 * 属性判断
 */
var n020100_checkAttributes = function(owner) {
    return nodes.checkAttributes(owner, "self", "mp", "<", 4);
};


/**
 * 跳出树，不执行之后的节点。返回BREAK
 */
var n020101_quit = function(owner) {
    return bt_consts.StatusType.BREAK;
};


/**
 * 选择仇恨值第1大目标
 */
var n020110_selectHatredTarget = function(owner) {
    return nodes.selectHatredTarget(owner, 0);
};


/**
 * 是否可使用卡牌 10004
 */
var n020111_canUseCard = function(owner) {
    return nodes.canUseCard(owner, 10004);
};


/**
 * 使用卡牌 id：10004
 */
var n020112_useCard = function(owner) {
    return nodes.useCard(owner, 10004);
};


/**
 * 选择仇恨值第1大目标
 */
var n030_selectHatredTarget = function(owner) {
    return nodes.selectHatredTarget(owner, 0);
};


/**
 * 使用卡牌 
 * cids：[10001, 10002, 10003]
 * weights: [3, 1, 1]
 */
var n031_randomUseCardByID = function(owner) {
    return nodes.randomUseCardByID(owner, [10001, 10002, 10003], [3, 1, 1]);
};


// btree define
var bt_code = {
    n_root: {type: bt_consts.NodeType.ROOT, children: ['n0_Selector']},
    // Selector
    n0_Selector: {type: bt_consts.NodeType.SELECTOR, children: ['n00_DecoratorCountLimit', 'n01_DecoratorCountLimit', 'n02_DecoratorCountLimit', 'n03_Sequence']},
    // 子节点成功执行1次
    n00_DecoratorCountLimit: {type: bt_consts.NodeType.FILTER_EXE_TIMES, cnt: 1, onlySuccess: true, children: ['n000_Sequence']},
    // Sequence
    n000_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n0000_checkAttributes', 'n0001_Selector']},
    n0000_checkAttributes: {type: bt_consts.NodeType.LEAF, func: n0000_checkAttributes},
    // Selector
    n0001_Selector: {type: bt_consts.NodeType.SELECTOR, children: ['n00010_Sequence', 'n00011_Sequence']},
    // Sequence
    n00010_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n000100_checkAttributes', 'n000101_quit']},
    n000100_checkAttributes: {type: bt_consts.NodeType.LEAF, func: n000100_checkAttributes},
    n000101_quit: {type: bt_consts.NodeType.LEAF, func: n000101_quit},
    // Sequence
    n00011_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n000110_selectHatredTarget', 'n000111_canUseCard', 'n000112_useCard']},
    n000110_selectHatredTarget: {type: bt_consts.NodeType.LEAF, func: n000110_selectHatredTarget},
    n000111_canUseCard: {type: bt_consts.NodeType.LEAF, func: n000111_canUseCard},
    n000112_useCard: {type: bt_consts.NodeType.LEAF, func: n000112_useCard},
    // 子节点成功执行1次
    n01_DecoratorCountLimit: {type: bt_consts.NodeType.FILTER_EXE_TIMES, cnt: 1, onlySuccess: true, children: ['n010_Sequence']},
    // Sequence
    n010_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n0100_checkAttributes', 'n0101_Selector']},
    n0100_checkAttributes: {type: bt_consts.NodeType.LEAF, func: n0100_checkAttributes},
    // Selector
    n0101_Selector: {type: bt_consts.NodeType.SELECTOR, children: ['n01010_Sequence', 'n01011_Sequence']},
    // Sequence
    n01010_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n010100_checkAttributes', 'n010101_quit']},
    n010100_checkAttributes: {type: bt_consts.NodeType.LEAF, func: n010100_checkAttributes},
    n010101_quit: {type: bt_consts.NodeType.LEAF, func: n010101_quit},
    // Sequence
    n01011_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n010110_selectHatredTarget', 'n010111_canUseCard', 'n010112_useCard']},
    n010110_selectHatredTarget: {type: bt_consts.NodeType.LEAF, func: n010110_selectHatredTarget},
    n010111_canUseCard: {type: bt_consts.NodeType.LEAF, func: n010111_canUseCard},
    n010112_useCard: {type: bt_consts.NodeType.LEAF, func: n010112_useCard},
    // 子节点成功执行1次
    n02_DecoratorCountLimit: {type: bt_consts.NodeType.FILTER_EXE_TIMES, cnt: 1, onlySuccess: true, children: ['n020_Sequence']},
    // Sequence
    n020_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n0200_checkAttributes', 'n0201_Selector']},
    n0200_checkAttributes: {type: bt_consts.NodeType.LEAF, func: n0200_checkAttributes},
    // Selector
    n0201_Selector: {type: bt_consts.NodeType.SELECTOR, children: ['n02010_Sequence', 'n02011_Sequence']},
    // Sequence
    n02010_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n020100_checkAttributes', 'n020101_quit']},
    n020100_checkAttributes: {type: bt_consts.NodeType.LEAF, func: n020100_checkAttributes},
    n020101_quit: {type: bt_consts.NodeType.LEAF, func: n020101_quit},
    // Sequence
    n02011_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n020110_selectHatredTarget', 'n020111_canUseCard', 'n020112_useCard']},
    n020110_selectHatredTarget: {type: bt_consts.NodeType.LEAF, func: n020110_selectHatredTarget},
    n020111_canUseCard: {type: bt_consts.NodeType.LEAF, func: n020111_canUseCard},
    n020112_useCard: {type: bt_consts.NodeType.LEAF, func: n020112_useCard},
    // Sequence
    n03_Sequence: {type: bt_consts.NodeType.SEQUENCE, children: ['n030_selectHatredTarget', 'n031_randomUseCardByID']},
    n030_selectHatredTarget: {type: bt_consts.NodeType.LEAF, func: n030_selectHatredTarget},
    n031_randomUseCardByID: {type: bt_consts.NodeType.LEAF, func: n031_randomUseCardByID}
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
