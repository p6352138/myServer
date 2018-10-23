/*
 * @Author: liuguolai 
 * @Date: 2018-09-25 10:52:50 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-25 10:59:17
 * 忽略求邀
 */
function ignoreTeamApplyProto(id) {
    this.head = "connector.teamHandler.ignoreTeamApply";
    this.data = new ignoreTeamApplyData(id);
}

function ignoreTeamApplyData(id){
    this.id = id;
}

module.exports = ignoreTeamApplyProto;
