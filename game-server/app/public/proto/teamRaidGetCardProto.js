/*
 * @Author: liuguolai 
 * @Date: 2018-10-15 17:31:18 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-15 17:32:23
 * 组队副本获取奖励卡牌
 */
function teamRaidGetCardProto(cardID) {
    this.head = "connector.raidHandler.teamRaidGetCard";
    this.data = new teamRaidGetCardData(cardID);
}

function teamRaidGetCardData(cardID) {
    this.cardID = cardID;
}

module.exports = teamRaidGetCardProto;
