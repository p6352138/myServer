/*
 * @Author: liuguolai 
 * @Date: 2018-09-25 10:05:03 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-25 10:05:31
 */
function refuseTeamInviteProto(id) {
    this.head = "connector.teamHandler.refuseTeamInvite";
    this.data = new refuseTeamInviteData(id);
}

function refuseTeamInviteData(id){
    this.id = id;
}

module.exports = refuseTeamInviteProto;