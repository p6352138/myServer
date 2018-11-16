/*
 * @Author: liuguolai 
 * @Date: 2018-11-05 19:31:11 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-11-05 19:31:59
 * 兑换体力
 */
function exchangePowerProto(gold) {
    this.head = "connector.entryHandler.exchangePower";
    this.data = new exchangePowerData(gold);
}

function exchangePowerData(gold){
    this.gold = gold;
}

module.exports = exchangePowerProto;
