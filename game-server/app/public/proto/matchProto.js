/**********
 *        匹配协议
 *        teamType:  队伍类型，见consts
 *        dgId:1        Dungeon id
 *           
 */

function matchProto(teamType, matchNum, dgId) {
    this.head = "connector.matchHandler.match";
    this.data = new matchData(teamType, matchNum, dgId);
}

function matchData(teamType, matchNum, dgId){
    this.teamType = teamType;
    this.matchNum = matchNum;
    this.dgId = dgId;
}

module.exports = matchProto;