/*
 * @Author: liuguolai 
 * @Date: 2018-09-25 10:51:28 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-25 10:53:05
 * 忽略组队邀请
 */
function ignoreTeamInviteProto(id) {
    this.head = "connector.teamHandler.ignoreTeamInvite";
    this.data = new ignoreTeamInviteData(id);
}

function ignoreTeamInviteData(id){
    this.id = id;
}

module.exports = ignoreTeamInviteProto;
