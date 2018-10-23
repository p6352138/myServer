/**
 * Date: 2018/6/30
 * Author: liuguolai
 * Description:
 */
var bt_consts = _require('../../bt_consts');

var commonAction = {};
module.exports = commonAction;

// 测试用
commonAction.showText = function (text, text2) {
    console.log(text, text2);
    return bt_consts.StatusType.SUCCESS;
};
