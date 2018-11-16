/**
 * Date: 2018/10/23
 * Author: liuguolai
 * Description:
 */
module.exports = function(app) {
    return new Remote(app);
};

let Remote = function(app) {
    this.app = app;
};

let pro = Remote.prototype;

pro.addMailToPlayers = function (mailGuid, entIDs, mailInfo, cb) {
    this.app.mailStub.addMailToPlayers(mailGuid, entIDs, mailInfo, cb);
};

pro.addGlobalMail = function (mailInfo, cb) {
    this.app.mailStub.addGlobalMail(mailInfo, cb);
};

pro.delMailFromDB = function (entID, mailGuids, cb) {
    this.app.mailStub.delMailFromDB(entID, mailGuids, cb);
};

pro.loginGetMails = function (entID, lggmt, cb) {
    this.app.mailStub.loginGetMails(entID, lggmt, cb);
};
