/*
 * @Author: liuguolai 
 * @Date: 2018-09-22 16:16:56 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-11 11:00:19
 * 同意邀请
 */
function acceptInviteProto(inviterID, teamId) {
    this.head = "connector.teamHandler.acceptInvite";
    this.data = new acceptInviteData(inviterID, teamId);
}

function acceptInviteData(inviterID, teamId){
    this.id = inviterID;
    this.teamId = teamId;
}

module.exports = acceptInviteProto;