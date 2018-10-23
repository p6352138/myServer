/**
 * Date: 2018/9/6
 * Author: liuguolai
 * Description: connector注册中心服数据
 */
var logger = _require('pomelo-logger').getLogger('game', __filename);

module.exports = function (opts) {
    return new Module(opts);
};

module.exports.moduleId = 'connectorRegisterGlobalServers';

var Module = function (opts) {
    opts = opts || {};
    this.app = opts.app;
};

Module.prototype.monitorHandler = function (agent, globalServers, cb) {
    var app = this.app;
    for (var server of globalServers) {
        server.global = true;
    }
    app.addServers(globalServers);
    cb(null);
    logger.info(app.getServerId(), "add global servers.")
};
