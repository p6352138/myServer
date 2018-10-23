/**
 * Date: 2018/6/15
 * Author: liuguolai
 * Description:
 */
var serverInfo = {}  // 服务器信息缓存

var router = function (req, res, next) {
    if (!("sid" in req.query) || !("num" in req.query)) {
        res.status(500).end();
        return;
    }
    // 更新在线人数
    serverInfo[req.query.sid] = {
        "time": new Date().getTime() / 1000,
        "num": req.query.num
    }
    res.end();
}

module.exports.serverInfo = serverInfo;
module.exports.router = router;