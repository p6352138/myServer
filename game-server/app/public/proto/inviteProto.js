/*
 * @Author: liuguolai 
 * @Date: 2018-09-22 11:04:49 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-22 11:05:50
 * 队伍邀请
 */
function inviteProto(id) {
    this.head = "connector.teamHandler.invite";
    this.data = new inviteData(id);
}

function inviteData(id){
    this.id = id;
}

module.exports = inviteProto;