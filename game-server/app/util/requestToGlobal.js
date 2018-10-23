/**
 * Date: 2018/9/5
 * Author: liuguolai
 * Description:
 */
var adminClient = require('pomelo-admin').adminClient;
var pomelo = require('pomelo');

var DEFAULT_USERNAME = 'admin';
var DEFAULT_PWD = 'admin';

var CONNECT_ERROR = 'Fail to connect to global admin console server.';

var requestToGlobal = module.exports;

var connectToMaster = function (id, opts, cb) {
    var client = new adminClient({username: opts.username, password: opts.password, md5: true});
    client.connect(id, opts.host, opts.port, function(err) {
        if(err) {
            abort(CONNECT_ERROR + err.red);
        }
        if(typeof cb === 'function') {
            cb(client);
        }
    });
};

requestToGlobal.request = function (opts) {
    opts = opts || {};
    opts.username = opts.username || DEFAULT_USERNAME;
    opts.password = opts.password || DEFAULT_PWD;
    var mangoConfig = pomelo.app.get('mangoConfig');
    opts.host = opts.host || mangoConfig.globalMasterIP;
    opts.port = opts.port || mangoConfig.globalMasterPort;
    var id = 'pomelo_request_global_' + Date.now();
    var moduleId = opts.moduleId || 'globalRegisterServerConnectors';
    var msg = opts.msg || {};
    var callback = opts.cb;
    connectToMaster(id, opts, function(client) {
        client.request(moduleId, msg, function(err, info) {
            if (callback) {
                callback(err, info);
            }
            client.close();
        });
    });
}
