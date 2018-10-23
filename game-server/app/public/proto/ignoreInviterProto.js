/*
 * @Author: liuguolai 
 * @Date: 2018-09-19 16:17:36 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-19 16:29:50
 * 忽略好友请求
 */
function ignoreInviterProto(id) {
    this.head = "connector.friendHandler.ignoreInviter";
    this.data = new ignoreInviterData(id);
}

function ignoreInviterData(id){
    this.id = id;
}

module.exports = ignoreInviterProto;