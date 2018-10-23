/**********
 *        出牌协议
 * @param idx: 手牌位置
 * @param cid: card id
 * @param tid: target id
 */

function playCardProto(idx, cid, tid) {
    this.head = "fight.fightHandler.playCard";
    this.data = new playCardData(idx, cid, tid);
}

function playCardData(idx, cid, tid){
    this.idx = idx;
    this.cid = cid;
    this.tid = tid;
}

module.exports = playCardProto;
