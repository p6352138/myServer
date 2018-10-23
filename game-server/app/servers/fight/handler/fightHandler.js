module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

var handler = Handler.prototype;

// 获取dps信息
handler.getDps = function (msg, session, next) {
    session.dungeonEntity.dps.getDps(next);
};

// 选英雄
handler.selectHero = function(msg, session, next) {
    var heroid = msg.heroid;
    var code = session.dungeonEntity.selectHero(session.uid, heroid);
    next(null, {code: code});
};

// 确认英雄
handler.confirmHero = function(msg, session, next) {
    var code = session.dungeonEntity.confirmHero(session.uid);
    next(null, {code: code});
};

// 加载进度
handler.loadProgress = function (msg, session, next) {
    session.dungeonEntity.loadProgress(session.uid, msg.progress);
    next(null, {});
};

// 加载完成
handler.loadFinished = function(msg, session, next) {
	session.dungeonEntity.loadFinished(session.uid);
	next(null, {});
};

// 出牌
handler.playCard = function(msg, session, next) {
    var idx = msg.idx, cid = msg.cid, tid = msg.tid;
    var code = session.dungeonEntity.playCard(session.uid, idx, cid, tid);
    next(null, {code: code});
};
