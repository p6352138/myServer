/**
 * Date: 2018/6/4
 * Author: liuguolai
 * Description:
 */
let avatarSchema = _require('./schemas/avatarSchema');
let accountSchema = _require('./schemas/accountSchema');
let friendSchema = _require('./schemas/friendSchema');

let name2Schema = {
    "Account": accountSchema,
    "Avatar": avatarSchema,
    "Friend": friendSchema,
};

module.exports = name2Schema;