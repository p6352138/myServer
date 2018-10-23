/*
 * @Author: liuguolai 
 * @Date: 2018-10-15 10:11:31 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-15 16:38:36
 * 组队副本选择英雄
 */
function teamRaidSelectHeroProto(heroid) {
    this.head = "connector.raidHandler.teamRaidSelectHero";
    this.data = new teamRaidSelectHeroData(heroid);
}

function teamRaidSelectHeroData(heroid) {
    this.heroid = heroid;
}

module.exports = teamRaidSelectHeroProto;
