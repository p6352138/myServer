/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description: 路由控制
 */

var exp = module.exports

exp.fight = function (session, msg, app, cb) {
    var serverId = session.get('fightServer');

    if(!serverId) {
        cb(new Error('can not find server info for type: ' + msg.serverType));
        return;
    }

    cb(null, serverId);
};

/**
 * 匹配服路由
 * @param bCross 是否跨服匹配
 * @param msg
 * @param app
 * @param cb
 */
exp.match = function (bCross, msg, app, cb) {
    var servers = app.getServersByType('match'), serverId;

    for (var server of servers) {
        if (bCross) {
            if (server.global) {
                serverId = server.id;
                break;
            }
        }
        else {
            if (!server.global) {
                serverId = server.id;
                break;
            }
        }
    }

    if(!serverId) {
        cb(new Error('can not find server info for type: ' + msg.serverType + ' bCross: ' + bCross));
        return;
    }

    cb(null, serverId);
};
