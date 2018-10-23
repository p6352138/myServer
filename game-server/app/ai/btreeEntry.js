/**
 * Date: 2018/6/28
 * Author: liuguolai
 * Description:
 */
var btreeManager = _require('./btreeManager');
var AgentRunningData = _require('./agentRunnningData');

var BTreeEntry = function (name) {
    var bt = btreeManager.getByName(name);
    if (!bt) {
        throw new Error("btree name error! name: " + name);
    }
    this.runningData = new AgentRunningData(bt.getID());
    this.currentBTree = bt;
};

module.exports = BTreeEntry;

BTreeEntry.prototype.entry = function (agent) {
    var agentRunningData = this.runningData;
    var btreeID = agentRunningData.btreeIds[agentRunningData.curBtreePos];
    var res = btreeManager.getByID(btreeID).entry(agentRunningData, agent);
    return res;
};
