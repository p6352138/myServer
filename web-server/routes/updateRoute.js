/**
 * Date: 2018/6/16
 * Author: liuguolai
 * Description:
 */
var mongodb = require("../lib/mongodb/mongodb")();

module.exports = function (req, res, next) {
    if (!("openid" in req.query) || !("sid" in req.query)) {
        res.status(500).end();
        return;
    }
    if (!("lv" in req.query)) {
        console.log("update data err: ", req.query);
        res.status(500).end();
        return;
    }
    var sid = req.query.sid;
    var data = {
        lastLoginSid: sid,
    }
    data["sid2lv." + sid] = req.query.lv;
    console.log(data);
    mongodb.update("Account", {openid: req.query.openid}, {$set: data}, {upsert: true}, function (err, product) {
        if (err){
            console.log(req.query.openid + " update db error: " + err);
            res.status(500).end();
            return;
        }
        res.end();
    });
}