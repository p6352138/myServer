/**
 * Date: 2018/10/23
 * Author: liuguolai
 * Description:
 */
let pomelo = require('pomelo');
let mailTpl = _require('../data/Mail');
let ObjectId = require('mongoose').Types.ObjectId;
let consts = require('../common/consts');

let mailManager = module.exports;

/**
 * 添加新的邮件或消息
 * @param entIDs 目标的uuid
 * @param mailID 邮件表id
 * @param kwargs 根据具体系统玩法确定
 * @param cb
 */
mailManager.addMailToPlayers = function (entIDs, mailID, kwargs, cb=null) {
    if (!mailTpl.hasOwnProperty(mailID)) {
        throw new Error('add Mail no mailID:' + mailID + ' entIDs:' + entIDs);
    }
    if (typeof entIDs === 'string') {
        entIDs = [entIDs];
    }
    let mailGuid = ObjectId().toString();
    let mailInfo = {
        mailID: mailID,
        time: new Date().getTime(),
        kwargs: kwargs
    }
    if (mailTpl[mailID].Type !== consts.Mail.TYPE_MESSAGE) {
        mailInfo['reward'] = mailTpl[mailID].Reward;
    }
    pomelo.app.rpc.mail.mailRemote.addMailToPlayers(null, mailGuid, entIDs, mailInfo, cb);
};

mailManager.addGlobalMail = function (mailID, kwargs, cb=null) {
    if (!mailTpl.hasOwnProperty(mailID)) {
        throw new Error('add Mail no mailID:' + mailID + ' entIDs:' + entIDs);
    }
    let reward = mailTpl[mailID].Reward;
    let mailInfo = {
        mailID: mailID,
        reward: reward,
        kwargs: kwargs
    }
    pomelo.app.rpc.mail.mailRemote.addGlobalMail(null, mailInfo, cb);
};

mailManager.addGMMailToPlayers = function (entIDs, title, desc, reward, cb=null) {
    if (typeof entIDs === 'string') {
        entIDs = [entIDs];
    }
    let mailGuid = ObjectId().toString();
    let mailInfo = {
        title: title,
        desc: desc,
        time: new Date().getTime(),
        reward: reward
    }
    pomelo.app.rpc.mail.mailRemote.addMailToPlayers(null, mailGuid, entIDs, mailInfo, cb);
};

mailManager.addGMGlobalMail = function (title, desc, reward, cb=null) {
    let mailInfo = {
        title: title,
        desc: desc,
        reward: reward
    }
    pomelo.app.rpc.mail.mailRemote.addGlobalMail(null, mailInfo, cb);
};
