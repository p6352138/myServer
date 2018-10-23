/**
 * Date: 2018/6/14
 * Author: liuguolai
 * Description:
 */
var mongodb = require("../lib/mongodb/mongodb")();
var onlineNumRoute = require('./onlineNumRoute');
var consts = require('../consts');
var fly = require('flyio');

var lastUpateServerStateTime = 0;
var updateDuration = 1000 * 60 * 5;

var STATUS_CLOSED = 0;  // 维护
var STATUS_NEW = 1;  // 新服
var STATUS_BUSY = 2;  // 繁忙
var STATUS_HOT = 3;  // 火爆

var HOT_THRESHOLD = 1;  // 火爆阈值

var realTimeServerList = [];

var getServerStatus = function (sid, openServerDate, curDate) {
    if (!(sid in onlineNumRoute.serverInfo))
        return STATUS_CLOSED;
    var info = onlineNumRoute.serverInfo[sid];
    var openDate = new Date(openServerDate);
    // 7天内是新服
    if ((curDate - openDate) / (1000 * 60 * 60 * 24) < 7)
        return STATUS_NEW;
    // 10分钟没有通信记为关闭
    if (curDate.getTime() - info.time > 1000 * 60 * 10)
        return STATUS_CLOSED;
    if (info.num < HOT_THRESHOLD)
        return STATUS_BUSY;
    return STATUS_HOT;
}

var updateServerList = function(curDate) {
    delete require.cache[require.resolve('../config/serverlist')];
    var serverlist = require('../config/serverlist');
    realTimeServerList = [];
    for (var i = 0, len = serverlist.length; i < len; i++) {
        var server = serverlist[i];
        realTimeServerList.push({
            id: server.id,
            ip: server.ip,
            port: server.port,
            name: server.name,
            status: getServerStatus(server.id, server.date, curDate)
        })
    }
}

module.exports = function (req, res, next) {
    if (!("code" in req.query)) {
        res.status(500).end();
        return;
    }
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');
    // res.header('Access-Control-Allow-Credentials','true');
    var date = new Date();
    if (date.getTime() - lastUpateServerStateTime > updateDuration) {
        updateServerList(date);
        lastUpateServerStateTime = date.getTime();
    }
    var code = req.query.code;
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + consts.APP_ID +
        '&secret=' + consts.APP_SECRET + '&js_code=' + code + '&grant_type=authorization_code'
    fly.get(url).then(
        function (response) {
            if (response.status != 200) {
                next(null, {code: consts.Login.FAIL});
                console.error("get openid connect failed.");
                return;
            }
            var openid = code;
            var data = response.data;
            // todo: 模拟登陆，直接拿code作为openid
            if (data["errcode"] != 0) {
                console.error("get openid error." + data);
            } else {
                openid = data["openid"];
            }

            mongodb.find("Account", {openid: openid}, ["lastLoginSid", "sid2lv"], null, function (err, docs) {
                if (err){
                    console.error("db find account error" + err);
                    return;
                }
                var lastLoginSid = 0, ownRoleServers = {};
                if (docs.length) {
                    var data = JSON.parse(JSON.stringify(docs[0]));
                    lastLoginSid = data["lastLoginSid"];
                    ownRoleServers = data.sid2lv;  // Object.getOwnPropertyNames(data.sid2lv);
                }
                var data = {
                    serverlist: realTimeServerList,
                    lastLoginSid: lastLoginSid,
                    ownRoleServers: ownRoleServers
                }

                res.send(data);
            });
        }
    ).catch(function (error) {
        console.error(error);
    })
}