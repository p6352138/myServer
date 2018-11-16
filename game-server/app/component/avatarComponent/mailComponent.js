/**
 * Date: 2018/10/23
 * Author: liuguolai
 * Description: 邮件
 */
let Component = _require('../component');
let util = require('util');
let consts = _require('../../common/consts');
let pomelo = require('pomelo');
let mailTpl = _require('../../data/Mail');
let mailManager = _require('../../manager/mailManager');
let utils = require('../../util/utils');

let MailComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(MailComponent, Component);
module.exports = MailComponent;

let pro = MailComponent.prototype;

pro.init = function (opts) {
    this._initDbData(opts.mail || {});

    this.entity.safeBindEvent("EventLogin", this._onLogin.bind(this));
    this.gotMailGuids = new Set();  // 缓存最近得到过的邮件id，防止重复获取
    this._dirtyNewMails = {};
    this._dirtyMailFlag = {};  // 邮件状态脏数据
};

pro._initDbData = function (data) {
    // last get global mail time
    this.lggmt = data.lggmt || new Date().getTime();
    this.friendMails = data.friendMails || {};
    this.systemMails = data.systemMails || {};
    this.messages = data.messages || {};
};

pro.getPersistData = function () {
    return {
        lggmt: this.lggmt,
        friendMails: this.friendMails,
        systemMails: this.systemMails,
        messages: this.messages,
    }
};

pro.getClientInfo = function () {
    return {
        friendMails: this.friendMails,
        systemMails: this.systemMails,
        messages: this.messages,
    }
};

// 远程调用接口
pro._callRemote = function (funcName, ...args) {
    pomelo.app.rpc.mail.mailRemote[funcName](null, this.entity.id, ...args);
};

pro._onLogin = function (entity) {
    let self = this;
    self._checkRemoveOutdateMail();
    self._callRemote('loginGetMails', this.lggmt, function (resp) {
        self.lggmt = resp.time;
        self.addNewMails(resp.mails);
    });
};

pro._checkRemoveOutdateMail = function () {
    let timeNow = new Date().getTime();
    for (let mailGuid of Object.getOwnPropertyNames(this.systemMails)) {
        let mailInfo = this.systemMails[mailGuid];
        if (this._checkMailOutdate(mailInfo, timeNow))
            delete this.systemMails[mailGuid];
    }
    for (let guid of Object.getOwnPropertyNames(this.messages)) {
        let message = this.messages[guid];
        // 消息只能系统删，7天自动删除
        if (timeNow - message.time > consts.Mail.LIFE_TIME) {
            delete this.messages[guid];
        }
    }
};

pro._checkMailOutdate = function (mailInfo, checkTime) {
    if (utils.isEmptyObject(mailInfo.reward)) {
        // 没有附件
        if (checkTime - mailInfo.time > consts.Mail.LIFE_TIME)
            return true;
    }
    else {
        if (mailInfo.flag === consts.Mail.FLAG_GOT && checkTime - mailInfo.gotTime > consts.Mail.LIFE_TIME)
            return true;
    }
    return false;
};

pro._addFriendNewMail = function (mailGuid, mailInfo) {
    mailInfo['flag'] = consts.Mail.FLAG_UNREAD;
    let mailID = mailInfo.mailID, friendID = mailInfo.kwargs.id;
    for (let guid in this.friendMails) {
        let info = this.friendMails[guid];
        // 合并
        if (info.kwargs.id === friendID && mailID === info.mailID) {
            let oldReward = info.reward;
            for (let k in oldReward) {
                mailInfo.reward[k] = (mailInfo.reward[k] || 0) + oldReward[k];
            }
            this._actualDelMail(consts.Mail.TYPE_FRIEND, guid, false);
            break;
        }
    }
    this.friendMails[mailGuid] = mailInfo;
    this._addDirtyNewMail(consts.Mail.TYPE_FRIEND, mailGuid, mailInfo);
};

pro._addSystemNewMail = function (mailGuid, mailInfo) {
    mailInfo['flag'] = consts.Mail.FLAG_UNREAD;
    this.systemMails[mailGuid] = mailInfo;
    this._addDirtyNewMail(consts.Mail.TYPE_SYSTEM, mailGuid, mailInfo);
};

pro._addNewMessage = function (guid, message) {
    // 已过期
    if (new Date().getTime() - message.time > consts.Mail.LIFE_TIME)
        return;
    this.messages[guid] = message;
    this._addDirtyNewMail(consts.Mail.TYPE_MESSAGE, guid, message);
};

pro._addDirtyNewMail = function (type, mailGuid, mailInfo) {
    if (!this._dirtyNewMails.hasOwnProperty(type)) {
        this._dirtyNewMails[type] = {};
    }
    this._dirtyNewMails[type][mailGuid] = mailInfo;
};

pro.flushDirtyNewMails = function () {
    if (utils.isEmptyObject(this._dirtyNewMails))
        return;
    this.entity.sendMessage('onAddMails', this._dirtyNewMails);
    this._dirtyNewMails = {};
};

pro.addNewMails = function (mailsData) {
    let timeNow = new Date().getTime(), haveNew = false;
    for (let mailGuid in mailsData) {
        // 重复邮件
        if (this.gotMailGuids.has(mailGuid))
            continue;
        let mailInfo = mailsData[mailGuid];
        if (this._checkMailOutdate(mailInfo, timeNow))
            continue;

        let type;
        if (mailInfo.mailID) {
            type = mailTpl[mailInfo.mailID].Type;
        }
        else {
            // 不配表的同意归到系统
            type = consts.Mail.TYPE_SYSTEM;
        }
        if (type === consts.Mail.TYPE_FRIEND) {
            this._addFriendNewMail(mailGuid, mailInfo);
        }
        else if (type === consts.Mail.TYPE_SYSTEM) {
            this._addSystemNewMail(mailGuid, mailInfo);
        }
        else if (type === consts.Mail.TYPE_MESSAGE) {
            this._addNewMessage(mailGuid, mailInfo);
        }
        this.gotMailGuids.add(mailGuid);
        haveNew = true;
    }
    if (haveNew) {
        this.flushDirtyNewMails();
        this.flushDirtyMailFlag();
    }
};

pro.addMailToFriends = function (fIDs, mailID) {
    mailID = parseInt(mailID)
    let kwargs = {
        PlayerName: this.entity.name,
        id: this.entity.id,
        avatarUrl: this.entity.avatarUrl
    }
    mailManager.addMailToPlayers(fIDs, mailID, kwargs);
};

pro.onNewMailNotify = function (mailGuid, mailInfo) {
    this.addNewMails({[mailGuid]: mailInfo});
    this._callRemote('delMailFromDB', [mailGuid], null);
};

pro.onNewGlobalMailNotify = function (mails) {
    this.addNewMails(mails);
    for (let mailGuid in mails) {
        this.lggmt = mails[mailGuid].time;
        break;
    }
};

pro._getMailInfo = function (type, mailGuid) {
    if (type === consts.Mail.TYPE_FRIEND) {
        return this.friendMails[mailGuid];
    }
    else if (type === consts.Mail.TYPE_SYSTEM) {
        return this.systemMails[mailGuid];
    }
    return undefined;
};

// 查看邮件
pro.readMail = function (type, mailGuid, next) {
    let mailInfo = this._getMailInfo(type, mailGuid);
    if (!mailInfo) {
        return next(null, {code: consts.MailCode.NOT_EXIST});
    }
    if (mailInfo.flag !== consts.Mail.FLAG_UNREAD)
        return next(null, {code: consts.MailCode.HAD_READ});
    mailInfo.flag = consts.Mail.FLAG_READ;
    next(null, {code: consts.MailCode.OK});
};

pro._checkCanGetMailReward = function (mailInfo) {
    if (!mailInfo)
        return consts.MailCode.NOT_EXIST;
    if (utils.isEmptyObject(mailInfo.reward))
        return consts.MailCode.NO_REWARD;
    if (mailInfo.flag === consts.Mail.FLAG_GOT)
        return consts.MailCode.HAD_GOT;
    return consts.MailCode.OK;
};

// 领取邮件奖励
pro.getMailReward = function (type, mailGuid, next) {
    let mailInfo = this._getMailInfo(type, mailGuid);
    let code = this._checkCanGetMailReward(mailInfo);
    if (code === consts.MailCode.OK) {
        let flag = consts.Mail.FLAG_GOT;
        mailInfo.flag = consts.Mail.FLAG_GOT;
        mailInfo.gotTime = new Date().getTime();  // 记录领取时间，七天后自动删除
        this.entity.bag.addItems(mailInfo.reward);
        // 好友邮件领取了就删除
        if (type === consts.Mail.TYPE_FRIEND) {
            delete this.friendMails[mailGuid];
            flag = consts.Mail.FLAG_DEL;
        }
        next(null, {
            code: code,
            flag: flag,
            reward: mailInfo.reward
        });
        this.entity.logger.info('get mail reward.%o', mailInfo.reward);
    }
    else
        next(null, {code: code});
};

pro._actualDelMail = function (type, mailGuid, bNotify=true) {
    if (type === consts.Mail.TYPE_FRIEND) {
        delete this.friendMails[mailGuid];
    }
    else if (type === consts.Mail.TYPE_SYSTEM) {
        delete this.systemMails[mailGuid];
    }
    this._dirtyMailFlag[mailGuid] = {
        guid: mailGuid,
        type: type,
        flag: consts.Mail.FLAG_DEL
    }
    if (bNotify) {
        this.flushDirtyMailFlag();
    }
};

pro.flushDirtyMailFlag = function () {
    if (utils.isEmptyObject(this._dirtyMailFlag))
        return;
    let infos = [];
    for (let mailGuid in this._dirtyMailFlag) {
        infos.push(this._dirtyMailFlag[mailGuid]);
    }
    this.entity.sendMessage('onMailsFlagUpdate', {
        changeList: infos,
    });
    this._dirtyMailFlag = {};
};

pro._checkCanDelMail = function (mailInfo) {
    if (!mailInfo)
        return consts.MailCode.NOT_EXIST;
    if (!utils.isEmptyObject(mailInfo.reward) && mailInfo.flag !== consts.Mail.FLAG_GOT)
        return consts.MailCode.HAVE_REWARD;

    return consts.MailCode.OK;
};

// 删除邮件
pro.delMail = function (type, mailGuid, next) {
    let mailInfo = this._getMailInfo(type, mailGuid);
    let code = this._checkCanDelMail(mailInfo);
    if (code === consts.MailCode.OK) {
        this._actualDelMail(type, mailGuid);
    }
    next(null, {code: code});
};

// 快速删除
pro.quickDelMails = function (type, next) {
    let mails;
    if (type === consts.Mail.TYPE_FRIEND) {
        mails = this.friendMails;
    }
    else if (type === consts.Mail.TYPE_SYSTEM) {
        mails = this.systemMails;
    }
    for (let mailGuid of Object.getOwnPropertyNames(mails)) {
        let mailInfo = mails[mailGuid];
        if (mailInfo.flag === consts.Mail.FLAG_UNREAD)
            continue
        if (this._checkCanDelMail(mailInfo) === consts.MailCode.OK) {
            this._actualDelMail(type, mailGuid, false);
        }
    }
    this.flushDirtyMailFlag();
    next(null, {code: consts.MailCode.OK});
};
