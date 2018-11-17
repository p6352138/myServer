
var async = require('async');

module.exports = function (opts) {
    return new Module(opts);
};

///监控标识符 ，用于唯一标识该监控模块，非常重要的一个参数，要向该模块获取和发送数据都靠这个ID作为参数！特别是之后如果需要让外部程序获取该模块的监控数据也必须靠这个参数
module.exports.moduleId = 'onlineUser';

var Module = function (opts) {
    opts = opts || {};
    this.app = opts.app;
};

Module.prototype.monitorHandler = function (agent, msg, cb) {
    //this.app: 当前监控模块监控的服务器实例
    var app = this.app;

    var connection = app.components.__connection__;
    if (!connection) {
        cb({
            serverId: agent.id,
            body    : 'error'
        });
        return;
    }

    var connectionService = this.app.components.__connection__;
	if(!connectionService) {
		// logger.error('not support connection: %j', agent.id);
		return;
	}
    var info = connectionService.getStatisticsInfo();
    console.log('serverId: ' ,agent.id, ' info: ', info);
    cb(null, {
        serverId: agent.id,
        body    : info
    });
};

Module.prototype.clientHandler = function (agent, msg, cb) {
    var app = this.app;
    var servers = app.getServersByType('connector');
    var onLineUser = {};
    if(servers){
        async.mapSeries(servers,function(server,callback){
            agent.request(server.id, module.exports.moduleId, msg, function(err,info){
                if(err){
                    cb(null,{body : 'err'});
                    return;
                }
                // delete info.body.loginedList;
                onLineUser[server.id] = info.body;
                callback();
            });
        },function(err,res){
            // console.log('onLineUser: ', onLineUser);
            cb(null,{
                body : onLineUser
            });
        });
    }else{
        cb(null,{body : onLineUser});
    }
};