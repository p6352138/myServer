/*
 * @Author: liuguolai 
 * @Date: 2018-09-21 19:18:54 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-11 10:50:01
 * 创建队伍
 * @specialId: PVP为0即可，副本时表示副本id
 */
function buildTeamProto(teamType, specialId = 0) {
    this.head = "connector.teamHandler.buildTeam";
    this.data = new buildTeamData(teamType, specialId);
}

function buildTeamData(teamType, specialId) {
    this.teamType = teamType;
    this.specialId = specialId;
}

module.exports = buildTeamProto;