/**
 * Date: 2018/6/4
 * Author: liuguolai
 * Description:
 */
var mongoose = _require('mongoose'),
    Schema = mongoose.Schema;

var accountSchema = new Schema({
    openid: String,  // 登录用用户名
    uid: Number,  // 数字id
    uuid: String
});

module.exports = accountSchema