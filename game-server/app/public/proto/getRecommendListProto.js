/*
 * @Author: liuguolai 
 * @Date: 2018-10-20 11:00:44 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-20 11:02:45
 * @ param oppositeSex: 是否异性 0/1
 * 获取推荐列表
 */
function getRecommendListProto(oppositeSex) {
    this.head = "connector.friendHandler.getRecommendList";
    this.data = new getRecommendListData(oppositeSex);
}

function getRecommendListData(oppositeSex){
    this.oppositeSex = oppositeSex;
}

module.exports = getRecommendListProto;
