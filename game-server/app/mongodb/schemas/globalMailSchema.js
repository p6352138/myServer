/**
 * Date: 2018/10/25
 * Author: pwh
 * Description:
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let GlobalMailSchema = new Schema({
    _id: String,
    mailInfo: {}
});

GlobalMailSchema.set('toObject', { getters: true });

module.exports = GlobalMailSchema;