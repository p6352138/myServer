/*
 * @Author: liuguolai 
 * @Date: 2018-09-20 09:17:42 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-20 09:18:34
 * 同意好友请求
 */
function acceptFriendProto(id) {
    this.head = "connector.friendHandler.acceptFriend";
    this.data = new acceptFriendData(id);
}

function acceptFriendData(id){
    this.id = id;
}

module.exports = acceptFriendProto;
