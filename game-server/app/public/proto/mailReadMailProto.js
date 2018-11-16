/*
 * @Author: liuguolai 
 * @Date: 2018-10-25 20:02:46 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-25 20:17:42
 * 查看邮件时发送，收到OK时将邮件状态设为已读
 * @param type: 邮件类型，见consts
 * @param guid: 邮件唯一id，即收到的key
 */
function readMailProto(type, guid) {
    this.head = "connector.mailHandler.readMail";
    this.data = new readMailData(type, guid);
}

function readMailData(type, guid){
    this.type = type;
    this.guid = guid;
}

module.exports = readMailProto;
