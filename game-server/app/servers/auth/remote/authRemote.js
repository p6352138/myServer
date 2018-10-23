/**
 * Date: 2018/6/11
 * Author: liuguolai
 * Description:
 */

module.exports = function (app) {
    return new Remote(app);
}

var Remote = function (app) {
    this.app = app;
}

var pro  = Remote.prototype

pro.checkin = function (openid, uid, sid, cb) {
    this.app.get('rollStub').checkin(openid, uid, sid, cb);
};

// relay角色登录
pro.relayCheckin = function (openid, uid, sid, cb) {
    this.app.get('rollStub').relayCheckin(openid, uid, sid, cb);
};

pro.checkout = function (openid, uid, cb) {
    this.app.get('rollStub').checkout(openid, uid, cb);
};
