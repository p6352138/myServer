/*
 * @Author: liuguolai 
 * @Date: 2018-10-25 20:12:09 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-25 20:13:04
 * 邮件快速删除
 */
function quickDelMailsProto(type) {
    this.head = "connector.mailHandler.quickDelMails";
    this.data = new quickDelMailsData(type);
}

function quickDelMailsData(type){
    this.type = type;
}

module.exports = quickDelMailsProto;
