/**
 * Date: 2018/10/24
 * Author: liuguolai
 * Description:
 */
module.exports = function (app) {
    return new Handler(app);
};

let Handler = function (app) {
    this.app = app;
};

let handler = Handler.prototype;

handler.readMail = function (msg, session, next) {
    session.avatar.mail.readMail(msg.type, msg.guid, next);
};

handler.getMailReward = function (msg, session, next) {
    session.avatar.mail.getMailReward(msg.type, msg.guid, next);
};

handler.delMail = function (msg, session, next) {
    session.avatar.mail.delMail(msg.type, msg.guid, next);
};

handler.quickDelMails = function (msg, session, next) {
    session.avatar.mail.quickDelMails(msg.type, next);
};
