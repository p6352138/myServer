/*
 * @Author: liuguolai 
 * @Date: 2018-10-22 19:16:02 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-23 10:14:11
 * 背包出售
 */
function bagSellProto(itemID, cnt) {
    this.head = "connector.entryHandler.bagSell";
    this.data = new bagSellData(itemID, cnt);
}

function bagSellData(itemID, cnt){
    this.itemID = itemID;
    this.cnt = cnt;
}

module.exports = bagSellProto;
