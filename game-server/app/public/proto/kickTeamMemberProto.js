/*
 * @Author: liuguolai 
 * @Date: 2018-09-25 11:36:12 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-25 11:37:42
 * 踢出队伍
 */
 function kickTeamMemberProto(id) {
    this.head = "connector.teamHandler.kickTeamMember";
    this.data = new kickTeamMemberData(id);
}

function kickTeamMemberData(id){
    this.id = id;
}

module.exports = kickTeamMemberProto;