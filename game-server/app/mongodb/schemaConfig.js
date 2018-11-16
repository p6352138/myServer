/**
 * Date: 2018/6/4
 * Author: liuguolai
 * Description:
 */
let avatarSchema = _require('./schemas/avatarSchema');
let accountSchema = _require('./schemas/accountSchema');
let friendSchema = _require('./schemas/friendSchema');
let mailSchema = _require('./schemas/mailSchema');
let globalMailSchema = _require('./schemas/globalMailSchema');

let name2Schema = {
    "Account": accountSchema,
    "Avatar": avatarSchema,
    "Friend": friendSchema,
    "Mail": mailSchema,
    "GlobalMail": globalMailSchema,
};

module.exports = name2Schema;