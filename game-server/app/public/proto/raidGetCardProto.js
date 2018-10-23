/*
 * @Author: liuguolai 
 * @Date: 2018-10-10 11:25:32 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-10 11:41:36
 * 副本选择卡牌加入牌组
 * cardID 为0时表示放弃
 */
function raidGetCardProto(raidID, cardID) {
    this.head = "connector.raidHandler.raidGetCard";
    this.data = new raidGetCardData(raidID, cardID);
}

function raidGetCardData(raidID, cardID){
    this.raidID = raidID;
    this.cardID = cardID;
}

module.exports = raidGetCardProto;
