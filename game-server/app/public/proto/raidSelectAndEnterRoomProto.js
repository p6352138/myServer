/*
 * @Author: liuguolai 
 * @Date: 2018-10-09 15:01:57 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-09 15:03:26
 * 选择并进入关卡
 */
function raidSelectAndEnterRoomProto(raidID, roomIdx, idx) {
    this.head = "connector.raidHandler.raidSelectAndEnterRoom";
    this.data = new raidSelectAndEnterRoomData(raidID, roomIdx, idx);
}

function raidSelectAndEnterRoomData(raidID, roomIdx, idx){
    this.raidID = raidID;
    this.roomIdx = roomIdx;
    this.idx = idx;
}

module.exports = raidSelectAndEnterRoomProto;