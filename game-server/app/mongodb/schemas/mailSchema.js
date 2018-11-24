/**
 * Date: 2018/10/23
 * Author: pwh
 * Description:
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let MailSchema = new Schema({
    _id: String,
    mailInfo: {}
});

MailSchema.set('toObject', { getters: true });

module.exports = MailSchema;