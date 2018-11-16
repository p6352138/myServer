/*
 * @Author: liuguolai 
 * @Date: 2018-10-23 10:13:16 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-23 10:16:38
 * 背包使用
 */
function bagUseProto(itemID, cnt) {
    this.head = "connector.entryHandler.bagUse";
    this.data = new bagUseData(itemID, cnt);
}

function bagUseData(itemID, cnt){
    this.itemID = itemID;
    this.cnt = cnt;
}

module.exports = bagUseProto;
