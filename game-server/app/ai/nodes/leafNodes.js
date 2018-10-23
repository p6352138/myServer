/**
 * Date: 2018/6/30
 * Author: liuguolai
 * Description:
 */
var commonAction = _require('./actions/commonAction');
var entityAction = _require('./actions/entityAction');
var commonCondition = _require('./conditions/commonCondition');
var entityCondition = _require('./conditions/entityCondition');

var nodeSets = [commonAction, entityAction, commonCondition, entityCondition];
for (var i = 0, len = nodeSets.length; i < len; i++) {
    var nodeSet = nodeSets[i];
    for (var funcName in nodeSet) {
        module.exports[funcName] = nodeSet[funcName];
    }
};
