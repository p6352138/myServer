var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var ms = module.exports;

ms.pushMessageByUids = function(uids,route,msg, opts){
    pomelo.app.get('channelService').pushMessageByUids(route,msg,uids, opts, errHandler);
}

ms.pushMessageToPlayer = function(uid,route,msg, opts){
    ms.pushMessageByUids([uid],route,msg, opts);
}

// 全服广播（此接口只能中心服调用）
ms.pushMessageToAllAvatars = function (route, msg) {
    let connectors = pomelo.app.getServersByType('connector');
    for (let connector of connectors) {
        pomelo.app.rpc.connector.entryRemote.onGlobalMessage.toServer(connector.id, route, msg, null);
    }
};

function errHandler(err,fails){
    if(!!err){
        logger.error('Push Message error ! %j',err.stack);
    }
}