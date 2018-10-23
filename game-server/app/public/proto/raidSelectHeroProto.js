/*
 * @Author: liuguolai 
 * @Date: 2018-10-08 17:42:46 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-08 17:44:24
 * 单人副本选择英雄
 */
function raidSelectHeroProto(raidID, heroid) {
    this.head = "connector.raidHandler.raidSelectHero";
    this.data = new raidSelectHeroData(raidID, heroid);
}

function raidSelectHeroData(raidID, heroid){
    this.raidID = raidID;
    this.heroid = heroid;
}

module.exports = raidSelectHeroProto;
