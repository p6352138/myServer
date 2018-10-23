/*
 * @Author: liuguolai 
 * @Date: 2018-09-20 10:29:53 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-20 10:30:29
 * 删除好友
 */
function deleteFriendProto(id) {
    this.head = "connector.friendHandler.deleteFriend";
    this.data = new deleteFriendData(id);
}

function deleteFriendData(id){
    this.id = id;
}

module.exports = deleteFriendProto;
