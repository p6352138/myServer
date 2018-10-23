/**
 * Date: 2018/9/19
 * Author: liuguolai
 * Description: 好友相关接口
 */
module.exports = function (app) {
    return new Handler(app);
};

let Handler = function (app) {
    this.app = app;
};

let handler = Handler.prototype;

handler.addFriend = function (msg, session, next) {
    session.avatar.friend.addFriend(msg.id, next);
};

handler.ignoreInviter = function (msg, session, next) {
    session.avatar.friend.ignoreInviter(msg.id, next);
};

handler.refuseInviter = function (msg, session, next) {
    session.avatar.friend.refuseInviter(msg.id, next);
};

handler.acceptFriend = function (msg, session, next) {
    session.avatar.friend.acceptFriend(msg.id, next);
};

handler.deleteFriend = function (msg, session, next) {
    session.avatar.friend.deleteFriend(msg.id, next);
};

handler.getFriendsManageInfo = function (msg, session, next) {
    session.avatar.friend.getFriendsManageInfo(next);
};

handler.getRecommendList = function (msg, session, next) {
    session.avatar.friend.getRecommendList(msg.oppositeSex, next);
};
