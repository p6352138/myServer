/*
 * @Author: liuguolai 
 * @Date: 2018-10-15 17:20:16 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-15 17:21:55
 * 组队副本选择关卡
 */
function teamRaidSelectRoomProto(roomIdx) {
    this.head = "connector.raidHandler.teamRaidSelectRoom";
    this.data = new teamRaidSelectRoomData(roomIdx);
}

function teamRaidSelectRoomData(roomIdx) {
    this.roomIdx = roomIdx;
}

module.exports = teamRaidSelectRoomProto;
