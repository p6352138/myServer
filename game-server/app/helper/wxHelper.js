/**
 * Date: 2018/9/20
 * Author: liuguolai
 * Description: 微信接口
 */
let crypto = require('crypto');
let pomelo = require('pomelo');
let logger = require('pomelo-logger').getLogger('game', "wxHelper");

// let Fly = require('flyio/dist/npm/fly');
// let fly = new Fly();
let fly = require('flyio');

//定义公共headers
// fly.config.headers={xx:5,bb:6,dd:7}
//设置超时
// fly.config.timeout = 10000;
//设置请求基地址
// fly.config.baseURL = "https://api.weixin.qq.com/"

let wxHelper = module.exports;

// args: k, v, k, v...
wxHelper.setUserStorage = function (openid, session_key, ...args) {
    let kv_list = [];
    for (let i = 0; i < args.length; i += 2) {
        kv_list.push({key: args[i], value: args[i + 1]})
    }
    let data = {
        kv_list: kv_list
    }
    // 签名
    let hmac = crypto.createHmac('sha256', session_key);
    hmac.update(JSON.stringify(data));
    let signature = hmac.digest(encoding='hex');
    let url = 'https://api.weixin.qq.com/wxa/set_user_storage?access_token=' + pomelo.app.accessTokenMgr.access_token
        + '&signature=' + signature + '&openid=' + openid + '&sig_method=hmac_sha256';
    console.log("xxxxxxxxxxxxx url", url);
    fly.post(url, data)
        .then(function (response) {
            if (response.status != 200) {
                logger.error("setUserStorage failed.");
                return;
            }
            let data = response.data;
            if (data.errcode == -1) {
                // 系统繁忙，此时请开发者稍候再试
                logger.warn("setUserStorage busy.", data);
                setTimeout(wxHelper.setUserStorage, 10 * 1000);
            }
            else if (data.code != 0) {
                logger.error("setUserStorage get error.", data);
            }
        })
        .catch(function (err) {
            logger.error(err);
        })
};
