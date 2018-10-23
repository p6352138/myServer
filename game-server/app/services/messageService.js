var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var ms = module.exports;

ms.pushMessageByUids = function(uids,route,msg){
    pomelo.app.get('channelService').pushMessageByUids(route,msg,uids,errHandler);
}

ms.pushMessageToPlayer = function(uid,route,msg){
    ms.pushMessageByUids([uid],route,msg);
}

function errHandler(err,fails){
    if(!!err){
        logger.error('Push Message error ! %j',err.stack);
    }
}