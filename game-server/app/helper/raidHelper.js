/**
 * Date: 2018/10/12
 * Author: liuguolai
 * Description:
 */
let raidTpl = _require('../data/Raid');
let roomTpl = _require('../data/Room');

let raidHelper = module.exports;

// 生成副本随机关卡选项
raidHelper.genRaidRoomTypeList = function (raidID, roomIdx) {
    let raidData = raidTpl[raidID];
    let roomInitData = raidData.Rooms[roomIdx];
    let cardcount = roomInitData.cardcount, roomID = roomInitData.room_id;
    let randomRooms = roomTpl[roomID].Rooms, totalWeight = 0, rooms = [], result = [];
    for (let info of randomRooms) {
        totalWeight += info.weight;
        rooms.push(info);
    }
    while (cardcount) {
        let rand = Math.floor(Math.random() * totalWeight) + 1;
        let weight = 0;
        for (let i = 0; i < rooms.length; i++) {
            let info = rooms[i];
            weight += info.weight;
            if (rand <= weight) {
                result.push({
                    type: info.type,
                    id: info.id,
                });
                totalWeight -= info.weight;
                rooms.splice(i, 1);
                cardcount--;
                break;
            }
        }
    }
    return result;
};
