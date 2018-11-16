/**
 * Date: 2018/9/13
 * Author: liuguolai
 * Description:
 */
module.exports = function (req, res, next) {
    let data = accessTokenMgr.getInfo();
    res.send(data);
}