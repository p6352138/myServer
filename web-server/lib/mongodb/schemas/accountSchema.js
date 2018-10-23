/**
 * Date: 2018/6/4
 * Author: liuguolai
 * Description:
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var accountSchema = new Schema({
    openid: String,  // 登录用用户名
    lastLoginSid: Number,  // 上次登录服
    sid2lv: Map
});
accountSchema.index({ openid: 1, type: 1 });

module.exports = accountSchema