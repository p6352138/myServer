/**
 * Date: 2018/6/28
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('./bt_consts');
var RootNode = _require('./nodes/rootNode');
var SequenceNode = _require('./nodes/sequenceNode');
var SelectorNode = _require('./nodes/selectorNode');
var ProbabilityNode = _require('./nodes/probabilityNode');
var LeafNode = _require('./nodes/leafNode');
var SubtreeNode = _require('./nodes/subtreeNode');
var QuittreeNode = _require('./nodes/quittreeNode');
var FilterAlwaysNode = _require('./nodes/filterAlwaysNode');
var FilterReverseNode = _require('./nodes/filterReverseNode');
var FilterExetimesNode = _require('./nodes/filterExetimesNode');
var FilterExeSecondsNode = _require('./nodes/filterExesecondsNode');
// var FilterExeintervalNode = _require('./nodes/filterExeintervalNode');

var createNormalCreator = function (node) {
    return function (nodeName, nodeInfo) {
        return new node(nodeName);
    }
};

var createCreatorWithOneKey = function (node, key) {
    return function (nodeName, nodeInfo) {
        var value = nodeInfo[key];
        return new node(nodeName, value);
    }
};

var createCreatorWithTwoKeys = function (node, key1, key2) {
    return function (nodeName, nodeInfo) {
        var value1 = nodeInfo[key1];
        var value2 = nodeInfo[key2];
        return new node(nodeName, value1, value2);
    }
};

var nodeCreators = {};
nodeCreators[bt_consts.NodeType.ROOT] = createNormalCreator(RootNode);
nodeCreators[bt_consts.NodeType.LEAF] = createCreatorWithOneKey(LeafNode, "func");
nodeCreators[bt_consts.NodeType.SEQUENCE] = createNormalCreator(SequenceNode);
nodeCreators[bt_consts.NodeType.SELECTOR] = createNormalCreator(SelectorNode);
nodeCreators[bt_consts.NodeType.PROBABILITY] = createNormalCreator(ProbabilityNode);
nodeCreators[bt_consts.NodeType.SUBTREE] = createCreatorWithOneKey(SubtreeNode, "subtree");
nodeCreators[bt_consts.NodeType.QUITTREE] = createCreatorWithOneKey(QuittreeNode, "quitType");
nodeCreators[bt_consts.NodeType.FILTER_ALWAYS] = createCreatorWithOneKey(FilterAlwaysNode, "alwaysType");
nodeCreators[bt_consts.NodeType.FILTER_REVERSE] = createNormalCreator(FilterReverseNode);
nodeCreators[bt_consts.NodeType.FILTER_EXE_TIMES] = createCreatorWithTwoKeys(FilterExetimesNode, "cnt", "onlySuccess");
nodeCreators[bt_consts.NodeType.FILTER_EXE_SECONDS] = createCreatorWithOneKey(FilterExeSecondsNode, "ms");
// nodeCreators[bt_consts.NodeType.FILTER_EXE_INTERVAL] = createCreatorWithTwoKeys(FilterExeintervalNode, "interval", "firstDelay");

var nodeManager = module.exports;

nodeManager.createByNode = function (nodeName, nodeInfo) {
    var type = nodeInfo.type;
    var creator = nodeCreators[type];
    if (!creator) {
        console.error("can not find node creator of type: " + type);
        return null;
    }
    return creator(nodeName, nodeInfo);
};
