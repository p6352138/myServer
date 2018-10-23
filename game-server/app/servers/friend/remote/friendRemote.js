/**
 * Date: 2018/9/18
 * Author: liuguolai
 * Description:
 */
module.exports = function(app) {
    return new Remote(app);
};

var Remote = function(app) {
    this.app = app;
};

var pro = Remote.prototype;

pro.login = function (uid, info, cb) {
    this.app.friendStub.login(uid, info, cb);
};

pro.logout = function (uid, cb) {
    this.app.friendStub.logout(uid, cb);
};

pro.addFriend = function (fromUid, toUid, cb) {
    this.app.friendStub.addFriend(fromUid, toUid, cb);
};

pro.ignoreInviter = function (fromUid, toUid, cb) {
    this.app.friendStub.ignoreInviter(fromUid, toUid, cb);
};

pro.refuseInviter = function (fromUid, toUid, fromName, cb) {
    this.app.friendStub.refuseInviter(fromUid, toUid, fromName, cb);
};

pro.acceptFriend = function (fromUid, toUid, fromName, cb) {
    this.app.friendStub.acceptFriend(fromUid, toUid, fromName, cb);
};

pro.deleteFriend = function (fromUid, toUid, cb) {
    this.app.friendStub.deleteFriend(fromUid, toUid, cb);
};

pro.updateProp = function (uid, key, value, cb) {
    this.app.friendStub.updateProp(uid, key, value);
    cb();
};

pro.getFriendsManageInfo = function (uid, cb) {
    this.app.friendStub.getFriendsManageInfo(uid, cb);
};

pro.getRecommendList = function (uid, oppositeSex, cb) {
    this.app.friendStub.getRecommendList(uid, oppositeSex, cb);
};
