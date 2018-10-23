/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description: 玩家战斗匹配接口
 */

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

handler.match = function (msg, session, next) {
    session.avatar.match.match(msg.teamType, msg.matchNum, msg.dgId, next);
};

handler.unmatch = function (msg, session, next) {
    let code = session.avatar.match.unmatch();
    next(null, {code: code});
};

handler.matchConfirm = function (msg, session, next) {
    session.avatar.match.matchConfirm(next);
};
