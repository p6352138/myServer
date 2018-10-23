var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AvatarSchema = new Schema({
    _id: String,
    openid: String,
    uid: Number,
    level: Number,
    name: String,
    gender: Number,
    avatarUrl: String,
    gold: Number,
    freeGold: Number,
    silver: Number,
    ladder: {},
    raid: {}
});

AvatarSchema.set('toObject', { getters: true });

module.exports = AvatarSchema;