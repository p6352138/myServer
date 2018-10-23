/*
 * @Author: liuguolai 
 * @Date: 2018-09-19 15:45:56 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-09-19 16:29:35
 * 添加好友
 */
function addFriendProto(id) {
    this.head = "connector.friendHandler.addFriend";
    this.data = new addFriendData(id);
}

function addFriendData(id){
    this.id = id;
}

module.exports = addFriendProto;