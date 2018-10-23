/**
 * Date: 2018/9/18
 * Author: liuguolai
 * Description:
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let FriendSchema = new Schema({
    _id: String,
    openid: String,
    name: String,
    gender: Number,
    avatarUrl: String,
    sid: String,
    rank: Number,
    state: Number,
    level: Number,
    friends: {},
    il: {},
});

FriendSchema.set('toObject', { getters: true });

module.exports = FriendSchema;