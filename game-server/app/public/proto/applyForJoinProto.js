/*
 * @Author: liuguolai 
 * @Date: 2018-09-25 09:29:12 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-25 09:30:27
 * 申请入队（求邀我）
 */
function applyForJoinProto(id) {
    this.head = "connector.teamHandler.applyForJoin";
    this.data = new applyForJoinData(id);
}

function applyForJoinData(id){
    this.id = id;
}

module.exports = applyForJoinProto;