/**********
 *        选择英雄协议
 *        heroid: hero id
 *
 */

function selectHeroProto(heroid) {
    this.head = "fight.fightHandler.selectHero";
    this.data = new selectHerohData(heroid);
}

function selectHerohData(heroid){
    this.heroid = heroid;
}

module.exports = selectHeroProto;