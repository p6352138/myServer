/**
 * Date: 2018/8/3
 * Author: liuguolai
 * Description: 更新配置信息
 */
var fs = require('fs');

var arguments = process.argv.splice(2);
// if (arguments.length < 2)
//     return;

var serverID = arguments[0];
var ip = arguments[1];
var localIp = arguments[2];

var projectPath = require.resolve('../config/mangoProject');
var projectConfig = require(projectPath);
if (serverID !== undefined) {  // 覆盖serverID
    for (var env in projectConfig) {
        projectConfig[env].serverID = parseInt(serverID);
    }
    fs.writeFileSync(projectPath, JSON.stringify(projectConfig, undefined, 2));
}
var curServerID;
for (var env in projectConfig) {
    curServerID = projectConfig[env].serverID;
    break;
}

if (localIp === undefined) {  // 获取局域网IP
    var os = require('os');
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var iface = ifaces[dev];
        for (var details of iface) {
            if (details.family == 'IPv4') {
                localIp = details.address;
                break;
            }
        }
        if (localIp)
            break;
    }
}

var serversPath = require.resolve('../config/servers');
var serversConfig = require(serversPath);
function RecursiveChangeIp(obj) {
    if (obj instanceof Array) {
        for (var childObj of obj) {
            RecursiveChangeIp(childObj);
        }
    }
    else if (obj instanceof Object) {
        if (ip && obj.hasOwnProperty("publicHost")) {
            obj.publicHost = ip;
        }
        if (obj.hasOwnProperty("host")) {
            obj.host = localIp;
        }
        for (var k in obj) {
            RecursiveChangeIp(obj[k]);
        }
    }
}
RecursiveChangeIp(serversConfig);

function RecursiveChangeId(obj) {
    if (obj instanceof Array) {
        for (var childObj of obj) {
            RecursiveChangeId(childObj);
        }
    }
    else if (obj instanceof Object) {
        if (obj.hasOwnProperty("name")) {
            obj.id = obj.name + "##" + curServerID;
        }
        for (var k in obj) {
            if (k == "global_dev" || k == "global_pro")
                continue;
            RecursiveChangeId(obj[k]);
        }
    }
}
RecursiveChangeId(serversConfig);
fs.writeFileSync(serversPath, JSON.stringify(serversConfig, undefined, 2));
