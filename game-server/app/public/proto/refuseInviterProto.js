/*
 * @Author: liuguolai 
 * @Date: 2018-09-19 16:45:46 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-19 16:46:19
 * 拒绝好友请求
 */
function refuseInviterProto(id) {
    this.head = "connector.friendHandler.refuseInviter";
    this.data = new refuseInviterData(id);
}

function refuseInviterData(id){
    this.id = id;
}

module.exports = refuseInviterProto;
