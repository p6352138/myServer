/*
 * @Author: liuguolai 
 * @Date: 2018-10-25 20:09:00 
 * @Last Modified by: liuguolai
 * @Last Modified time: 2018-10-25 20:25:27
 * 领取邮件奖励，返回code为OK是表示领取成功，flag标志当前邮件状态(已领/删除)，reward为所获奖励
 */
function getMailRewardProto(type, guid) {
    this.head = "connector.mailHandler.getMailReward";
    this.data = new getMailRewardData(type, guid);
}

function getMailRewardData(type, guid){
    this.type = type;
    this.guid = guid;
}

module.exports = getMailRewardProto;
