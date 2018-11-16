/**
 * Date: 2018/10/23
 * Author: liuguolai
 * Description: 邮件管理
 */
let logger = require('pomelo-logger').getLogger('game', 'mailStub');
let pomelo = require('pomelo');
let consts = _require('../common/consts');
let ObjectId = require('mongoose').Types.ObjectId;
let utils = _require('../util/utils');
let messageService = require('./messageService');

let MailStub = function (opts) {
    this.db = pomelo.app.db.getModel('Mail');
    this.globalDb = pomelo.app.db.getModel('GlobalMail');
    this.working = false;
    this.queue = [];
    this.cache = {};  // 单人邮件缓存，缓存单人未领取的全量邮件
    this.globalCache = [];  // 全服邮件的缓存
    this.globalOldestTime = new Date().getTime();  // 记录缓存了在此时间后的全服邮件
};

module.exports = MailStub;
let pro = MailStub.prototype;

// 添加个人邮件
pro.addMailToPlayers = function (mailGuid, entIDs, mailInfo, cb) {
    // 直接写db
    let updateDict = {
        ["mailInfo." + mailGuid]: mailInfo
    }
    let self = this;
    self.db.update({_id: {$in: entIDs}}, updateDict, {upsert: true}, function (err, raw) {
        if (err) {
            logger.error("%s add mail[%o] error: %o", entIDs, mailInfo, err);
            cb(consts.Code.FAIL);
            return;
        }
        cb(consts.Code.OK);
        // 加缓存
        for (let entID of entIDs) {
            if (self.cache.hasOwnProperty(entID)) {
                self.cache[entID][mailGuid] = mailInfo;
            }
        }
        // 通知在线玩家
        pomelo.app.rpc.authGlobal.authRemote.callOnlineAvtsMethod(
            null, entIDs, 'onNewMailNotify', mailGuid, mailInfo, null);
    })
};

// 删除个人邮件
pro.delMailFromDB = function (entID, mailGuids, cb) {
    let updateDict = {}, cache = this.cache[entID];
    for (let mailGuid of mailGuids) {
        updateDict["mailInfo." + mailGuid] = 1;
        if (cache)
            delete cache[mailGuid];
    }
    this.db.update({_id: entID}, {$unset: updateDict}, function (err, raw) {
        if (err) {
            logger.error("%s del mail:%s error: %o", entID, mailGuids, err);
            utils.invokeCallback(cb, {code: consts.Code.FAIL});
        }
        else
            utils.invokeCallback(cb, {code: consts.Code.OK});
    });
};

pro.loginGetMails = async function (entID, lastGetGlobalMailTime, cb) {
    let timeNow = new Date().getTime();
    let mails = await this.getGlobalMail(lastGetGlobalMailTime);
    let entMails = await this.getMail(entID), toDel = [];
    for (let mailGuid in entMails) {
        mails[mailGuid] = entMails[mailGuid];
        toDel.push(mailGuid);
    }
    cb({
        time: timeNow,
        mails: mails
    });
    // 顺便把个人邮件删了
    if (toDel.length > 0) {
        for (let mailGuid of toDel) {
            delete this.cache[entID][mailGuid];
        }
        this.delMailFromDB(entID, toDel);
    }
};

// 获取个人邮件
pro.getMail = function (entID) {
    let self = this;
    return new Promise(function (resolve, reject) {
        if (self.cache.hasOwnProperty(entID)) {
            resolve(self.cache[entID]);
        }
        self.db.findById(entID, function (err, doc) {
            if (err) {
                logger.error('get ent[%s] mail form db fail.', entID);
                return;
            }
            if (doc) {
                self.cache[entID] = doc.mailInfo;
            }
            else {
                self.cache[entID] = {};
            }
            resolve(self.cache[entID]);
        });
    });
};

pro._getGlobalMails = function (time) {
    let ret = {};
    for (let i = this.globalCache.length - 1; i >= 0; i--) {
        let data = this.globalCache[i];
        let mailGuid = data._id, mailInfo = data.mailInfo;
        if (mailInfo.time < time)
            break;
        ret[mailGuid] = mailInfo;
    }
    return ret;
};

pro.getGlobalMail = function (time) {
    let self = this;
    return new Promise(function (resolve, reject) {
        if (!time) {
            resolve({});
            return;
        }
        if (self.globalOldestTime < time) {
            resolve(self._getGlobalMails(time));
            return;
        }
        self.globalDb.find({"mailInfo.time": {$gt: time}}, function (err, docs) {
            if (err) {
                logger.error('get global mails err[%o]', err);
                return;
            }
            // 缓存
            self.globalCache = [], self.globalOldestTime = time;
            let toDel = [], timeNow = new Date().getTime(), lifeTime = 86400 * 30 * 1000;
            for (let doc of docs) {
                let mailInfo = doc.mailInfo, mailGuid = doc._id;
                if (timeNow - mailInfo.time > lifeTime) {
                    toDel.push(mailGuid);
                }
                else {
                    self.globalCache.push(doc);
                }
            }
            self.globalCache.sort(function (a, b) {
                return a.mailInfo.time - b.mailInfo.time;
            })
            resolve(self._getGlobalMails(time));
        });
    });
};

pro._addGlobalMail = function (mailInfo) {
    let self = this;
    self.working = true;
    let time = new Date().getTime();
    mailInfo['time'] = time;
    let mailGuid = ObjectId().toString();
    self.globalDb.update({_id: mailGuid}, {mailInfo: mailInfo}, {upsert: true}, function (err, raw) {
        if (err) {
            logger.error("add global mail[%o] error: %o", mailInfo, err);
        }
        else {
            self.globalCache.push({
                _id: mailGuid,
                mailInfo: mailInfo
            })
            messageService.pushMessageToAllAvatars('mail.onNewGlobalMailNotify', {
                [mailGuid]: mailInfo
            })
        }
        self._workDone();
    })
};

pro._workDone = function () {
    this.working = false;
    this._checkNext();
};

pro._checkNext = function () {
    if (this.working || this.queue.length === 0)
        return;
    let mailInfo = this.queue.shift();
    this._addGlobalMail(mailInfo);
};

pro._tryToSendGlobalMail = function (mailInfo) {
    this.queue.push(mailInfo);
    this._checkNext();
};

// 添加全服邮件
pro.addGlobalMail = function (mailInfo, cb) {
    this._tryToSendGlobalMail(mailInfo);
    cb();
};
