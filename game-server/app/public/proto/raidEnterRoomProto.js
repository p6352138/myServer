/*
 * @Author: liuguolai 
 * @Date: 2018-10-09 15:03:59 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-09 15:04:27
 * 进入关卡
 */
function raidEnterRoomProto(raidID, roomIdx) {
    this.head = "connector.raidHandler.raidEnterRoom";
    this.data = new raidEnterRoomData(raidID, roomIdx);
}

function raidEnterRoomData(raidID, roomIdx){
    this.raidID = raidID;
    this.roomIdx = roomIdx;
}

module.exports = raidEnterRoomProto;