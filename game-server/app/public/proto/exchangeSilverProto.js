/*
 * @Author: liuguolai 
 * @Date: 2018-10-22 11:25:52 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-22 11:26:45
 * 兑换银两
 */
function exchangeSilverProto(gold) {
    this.head = "connector.entryHandler.exchangeSilver";
    this.data = new exchangeSilverData(gold);
}

function exchangeSilverData(gold){
    this.gold = gold;
}

module.exports = exchangeSilverProto;
