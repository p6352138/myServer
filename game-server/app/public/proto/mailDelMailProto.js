/*
 * @Author: liuguolai 
 * @Date: 2018-10-25 20:10:15 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-25 20:10:48
 * 删除邮件
 */
function delMailProto(type, guid) {
    this.head = "connector.mailHandler.delMail";
    this.data = new delMailData(type, guid);
}

function delMailData(type, guid){
    this.type = type;
    this.guid = guid;
}

module.exports = delMailProto;
