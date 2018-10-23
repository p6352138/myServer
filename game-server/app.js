var reload = require('./app/util/require');

var pomelo = require('pomelo');
var mongodb = _require("./app/mongodb/mongodb");
var RollStub = _require('./app/services/rollStub');
var MatchStub = _require('./app/services/matchStub');
var routeUtil = _require('./app/util/routeUtil');
var dungeonFilter = _require('./app/servers/fight/filter/dungeonFilter');
let avatarFilter = _require('./app/servers/connector/filter/avatarFilter');
var consts = require('./app/common/consts');
var logger = require('pomelo-logger').getLogger('game', __filename);
let FriendStub = _require('./app/services/friendStub');
let TeamStub = _require('./app/services/teamStub');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'mango');
app.set('reload', reload, true);

var initDB = function (app) {
    app.loadConfig('mongodb', app.getBase() + '/config/mongodb.json');
    var db = mongodb(app);
    db.init();
    app.set('db', db, true);
};

let initAccessToken = function (app) {
    let AccessTokenManager = require('./app/services/accessTokenManager');
    let mgr = new AccessTokenManager();
    mgr.getAccessToken();
    app.set('accessTokenMgr', mgr, true);
};

// app configuration
app.configure('production|development', 'connector', function () {
    app.before(avatarFilter());
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 10,
            useDict: true,
            useProtobuf: true,
            handshake: function (msg, cb) {
                cb(null, {});
            }
        });
});

app.configure('production|development', 'gate', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            useDict: true,
            useProtobuf: true,
        });
});

app.configure('production|development|global_dev|global_pro', 'fight', function () {
    app.before(dungeonFilter());
});

app.configure('production|development|global_dev|global_pro', function () {
    app.enable('systemMonitor');
    if (typeof app.registerAdmin === 'function') {
        var onlineUser = require('./app/modules/onlineUser');
        app.registerAdmin(onlineUser, {app: app});
    }

    app.loadConfig('mangoConfig', app.getBase() + '/config/mangoProject.json');
    app.route('fight', routeUtil.fight);
    //app.filter(pomelo.timeout());
    // initDB(app);
    // message缓冲
    app.set('pushSchedulerConfig', {scheduler: pomelo.pushSchedulers.buffer, flushInterval: 20});
    if (app.serverType !== 'master') {
        // 战斗服配置
        var fights = app.get('servers').fight;
        var fightIdsMap = {};
        for (var id in fights) {
            var fight = fights[id].fight;
            var matchNum = fights[id].matchNum;
            if (!fightIdsMap.hasOwnProperty(fight)) {
                fightIdsMap[fight] = {};
            }
            if (!fightIdsMap[fight].hasOwnProperty(matchNum)) {
                fightIdsMap[fight][matchNum] = [];
            }
            fightIdsMap[fight][matchNum].push(fights[id].id);
        }
        app.set('fightIdsMap', fightIdsMap);
    }

    // handler 热更新开关
    app.set('serverConfig',
        {
            reloadHandlers: false
        });

    // remote 热更新开关
    app.set('remoteConfig',
        {
            reloadRemotes: false
        });
});

app.configure('production|development', function () {
    if (typeof app.registerAdmin === 'function') {
        var connectorRegisterGlobalServers = require('./app/modules/connectorRegisterGlobalServers');
        app.registerAdmin(connectorRegisterGlobalServers, {app: app});
    }
    // app.route('match', routeUtil.match);
    initDB(app);
});

app.configure('global_dev|global_pro', function () {
    if (typeof app.registerAdmin === 'function') {
        var globalRegisterServerConnectors = require('./app/modules/globalRegisterServerConnectors');
        app.registerAdmin(globalRegisterServerConnectors, {app: app});
    }
});

app.configure('production|development', 'auth', function () {
    app.set('rollStub', RollStub(app));
});

app.configure('global_dev|global_pro', 'authGlobal', function () {
    app.set('rollStub', RollStub(app));
});

app.configure('production|development|global_dev|global_pro', 'match', function () {
    // 队伍类型对应要建的匹配服
    let types = {
        [consts.Team.TYPE_LADDER]: {
            matchNums: [4],
        },
        [consts.Team.TYPE_PRACTICE]: {
            matchNums: [4],
        },
        [consts.Team.TYPE_RAID]: {
            matchNums: [2, 3, 4],
        }
    };
    let matchStubs = {};
    for (let teamType in types) {
        matchStubs[teamType] = {};
        for (let matchNum of types[teamType].matchNums) {
            matchStubs[teamType][matchNum] = new MatchStub({teamType: teamType, matchNum: matchNum});
        }
    }
    app.set('matchStubs', matchStubs, true);
    // var server = app.getCurServer();
    // if (server.pvp) {
    //     console.log("xxxxxxxxxxxxxxxx", "pvp", app.get('env'));
    //     app.matchStub = MatchStub({matchType: server.match, pvp: true})
    // }
    // else {
    //     console.log("xxxxxxxxxxxxxx", "pve", server.num);
    //     app.matchStub = MatchStub({matchType: server.match, num: server.num})
    // }
});

app.configure('production|development|global_dev|global_pro', 'friend', function () {
    initDB(app);
    app.set('friendStub', new FriendStub({}), true);
});

app.configure('production|development|global_dev|global_pro', 'team', function () {
    initDB(app);
    app.set('teamStub', new TeamStub({}), true);
});

let connectToCrossServer = function () {
    if (!consts.OPEN_CROSS_SERVER)
        return;
    app.event.on('start_all', function () {
        var env = app.get('env');
        if (env !== "production" && env !== "development")
            return;
        if (app.serverType !== 'master')
            return;
        // 向中心服注册connector，建立rpc通信
        var connectors = app.getServersByType('connector');
        logger.info("notify connectors to global center.");
        var requestToGlobal = require('./app/util/requestToGlobal');
        requestToGlobal.request({
            moduleId: 'globalRegisterServerConnectors',
            msg: {
                serverID: app.get('mangoConfig').serverID,
                connectors: connectors
            },
            cb: function (err, info) {
                if (err) {
                    logger.error(err);
                }
                else {
                    logger.info("global center register done. global servers: ", info.globalServers);
                    // 向connector广播
                    var masterAgent = app.components['__master__'].master.masterConsole.agent;
                    var count = 0;
                    for (var connector of connectors) {
                        count++;
                        masterAgent.request(
                            connector.id, 'connectorRegisterGlobalServers', info.globalServers, function (err) {
                                if (err) {
                                    logger.error(err);
                                }
                                count--;
                                if (count === 0) {
                                    logger.info("all connectors add global servers done.")
                                }
                            })
                    }
                }
            }
        })
    });
}

var startFinished = function () {
    connectToCrossServer();
    if (app.serverType === 'connector') {
        initAccessToken(app);
    }
};

// start app
app.start(startFinished);

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});
