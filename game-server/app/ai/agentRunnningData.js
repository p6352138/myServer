/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('./bt_consts');

var AgentRunningData = function (btId) {
    this.btreeIds = [btId];
    this.curBtreePos = 0;
    this.lastRunningChild = {};  // id: idx
    this.subtreeRet = bt_consts.StatusType.FAILURE;
    this.nodeInfo = {};  // 运行时动态数据 id: info
};

module.exports = AgentRunningData;
