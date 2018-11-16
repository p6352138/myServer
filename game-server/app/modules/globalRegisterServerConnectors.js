/**
 * Date: 2018/9/5
 * Author: liuguolai
 * Description: 给中心服注册逻辑服的connector
 */
var countDownLatch = require('../../node_modules/pomelo/lib/util/countDownLatch');
var utils = require('../../node_modules/pomelo/lib/util/utils');
var Constants = require('../../node_modules/pomelo/lib/util/constants');
var logger = require('pomelo-logger').getLogger('game', __filename);

module.exports = function (opts) {
    return new Module(opts);
};

module.exports.moduleId = 'globalRegisterServerConnectors';

var Module = function (opts) {
    opts = opts || {};
    this.app = opts.app;
};

Module.prototype.monitorHandler = function (agent, msg, cb) {
    var app = this.app;
    logger.info(app.getServerId(), "add connector servers");
    app.addServers(msg.connectors);
    cb({
        serverId: agent.id,
        body    : "done"
    });
};

Module.prototype.clientHandler = function (agent, msg, cb) {
    var app = this.app;
    logger.info("add new logic server[%s] connector servers: ", msg.serverID, msg.connectors);
    // var count = utils.size(agent.idMap);
    var servers = [], count = 0;
    var serverTypeMap = app.get('servers');
    for (var type in serverTypeMap) {
        for (var server of serverTypeMap[type]) {
            servers.push(server);
            count++;
        }
    }
    var serverInfo = {
        globalServers: servers
    };
    var latch = countDownLatch.createCountDownLatch(count, {timeout: Constants.TIME.TIME_WAIT_COUNTDOWN}, function() {
        utils.invokeCallback(cb, null, serverInfo);
    });
    var callback = function(msg) {
        serverInfo[msg.serverId] = msg.body;
        latch.done();
    };
    for(let sid in servers) {
        let record = servers[sid];
        agent.request(record.id, module.exports.moduleId, { connectors: msg.connectors }, callback);
    }
};
