var consts = _require('../../../common/consts');
var fly = _require('flyio');
var logger = _require('pomelo-logger').getLogger('game', __filename);
var Avatar = _require('../../../entity/avatar');
var entityManager = _require('../../../services/entityManager');
var entityFactory = _require('../../../entity/entityFactory');
let wxHelper = require('../../../helper/wxHelper');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
    // 微信login获取的code
    let self = this;
    let code = msg.code, userInfo = msg.userInfo;
    if (!code) {
        next(null, {code: consts.Login.FAIL});
        return;
    }
    // todo: 通过code获取session_key和openid
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + consts.APP_ID +
        '&secret=' + consts.APP_SECRET + '&js_code=' + code + '&grant_type=authorization_code'
    fly.get(url).then(
        function (response) {
            if (response.status != 200) {
                next(null, {code: consts.Login.FAIL});
                logger.error("get openid connect failed.");
                return;
            }
            var openid = code, session_key = "";
            var data = response.data;
            // todo: 模拟登陆，直接拿code作为openid
            if (data["errcode"] != 0) {
                logger.error("get openid error." + data);
            } else {
                openid = data["openid"];
                session_key = data["session_key"];
            }

            // 查db
            self.app.db.find("Avatar", {"openid": openid}, ["_id"], null, function (err, docs) {
                if (err){
                    logger.error("db find avatar error" + err);
                    next(null, {code: consts.Login.FAIL});
                    return;
                }
                var uuid = null;
                if (docs.length == 0) {
                    uuid = self.app.db.genId();
                } else {
                    uuid = docs[0]["_id"];
                }
                self.app.rpc.auth.authRemote.checkin(null, openid, uuid, self.app.get('serverId'),
                    function (result, formerSid, formerUid) {
                        // 已经登录，走顶号流程
                        if (result == consts.CheckInResult.ALREADY_ONLINE) {
                            if (formerUid !== uuid){
                                // 事件大了！！！
                                logger.error("same account with different uuid, openid[%s] formerUid[%s] newUid[%s]", openid, formerUid, uuid);
                                next(null, {code: consts.Login.FAIL});
                                return;
                            }
                            if (formerSid == self.app.get('serverId')) {
                                var avatar = entityManager.getEntity(formerUid);
                                if (!avatar) {
                                    readyLogin(self.app, session, uuid, openid, session_key, userInfo, next, false);
                                }
                                else {
                                    avatar.reconnect();  // 重连上了
                                    self.app.get('sessionService').kick(formerUid, "relay");
                                    session.bind(avatar.id);
                                    session.on('closed', onAvatarLeave.bind(null, self.app));
                                    // 重新设置session setting
                                    avatar.importSessionSetting();
                                    next(null, {
                                        code: consts.Login.OK,
                                        info: avatar.clientLoginInfo()
                                    });
                                    avatar.emit("EventReconnect", avatar);
                                }
                            }
                            else {
                                // 不在同一个进程，告诉客户端重连
                                var conector = null;
                                var connectors = self.app.getServersByType('connector');
                                for (var i in connectors) {
                                    if (connectors[i].id === formerSid)
                                        conector = connectors[i];
                                }
                                next(null, {
                                    code: consts.Login.RELAY,
                                    uuid: code,
                                    host: conector.host,
                                    port: conector.clientPort
                                });
                            }
                        }
                        else {
                            readyLogin(self.app, session, uuid, openid, session_key, userInfo, next, false);
                        }
                    });
            });
        }
    ).catch(function (error) {
        logger.error(error);
    })
};

var readyLogin = function (app, session, uuid, openid, session_key, userInfo, next, bRelay) {
    // 查db
    app.db.find("Avatar", {"_id": uuid}, null, null, function (err, docs) {
        if (err){
            logger.error("db find avatar error" + err);
            next(null, {code: consts.Login.FAIL});
            return;
        }
        if (docs.length == 0) {
            // 新建号
            var avatar = entityFactory.createEntity("Avatar", uuid, {
                openid: openid,
                session_key: session_key,
            })
            // 新号设置托管信息
            if (session_key) {
                wxHelper.setUserStorage(
                    avatar.openid, avatar.session_key,
                    consts.WxStorageKey.LEVEL, avatar.level,
                    consts.WxStorageKey.RANK, avatar.ladder.rank);
            }
            avatar.save();  // 主动存盘一次
            logger.info("create new avatar id: " + avatar.id);
        } else {
            // 登录成功
            docs[0].openid = openid;
            docs[0].session_key = session_key;
            var avatar = entityFactory.createEntity("Avatar", null, docs[0]);
            logger.info("avatar login success. id: " + avatar.id);
        }
        avatar.updateUserInfo(userInfo);
        var sessionService = app.get('sessionService');
        sessionService.kick(avatar.id);
        session.bind(avatar.id);
        session.on('closed', onAvatarLeave.bind(null, app));
        next(null, {
            code: consts.Login.OK,
            info: avatar.clientLoginInfo()
        });
        if (bRelay) {
            app.rpc.auth.authRemote.relayCheckin(null, openid, uuid, app.get('serverId'), null);
        }
        // 通知中心服
        var mangoConfig = app.get('mangoConfig');
        var url = 'http://' + mangoConfig.centerServerIP + ':' + mangoConfig.centerServerUpdatePort + '/Login'
        fly.get(url, {
            openid: openid,
            sid: mangoConfig.serverID,
            lv: avatar.level
        });
    })
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onAvatarLeave = function(app, session, reason) {
	if(!session || !session.uid) {
		return;
	}
	if (reason == "relay") {
	    // 顶号
        console.log("xxxxxxxxxxxxxxx", "onAvatarLeave relay")
        return;
    }
	var avtID = session.uid;
    var avatar = entityManager.getEntity(avtID);
    console.log("avatarLeave: " + session.uid);
    // 通知中心服
    var mangoConfig = app.get('mangoConfig');
    var url = 'http://' + mangoConfig.centerServerIP + ':' + mangoConfig.centerServerUpdatePort + '/Update'
    fly.get(url, {
        openid: avatar.openid,
        sid: mangoConfig.serverID,
        lv: avatar.level
    });

    avatar.disconnect();
};

handler.command = function (msg, session) {
    var avatar = entityManager.getEntity(session.uid);
    avatar && avatar.gm.handleGMCommand(msg.cmd, msg.params);
};

handler.exchangeSilver = function (msg, session, next) {
    session.avatar.avatarProp.exchangeSilver(msg.gold, next);
};
