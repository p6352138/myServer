/**
 * Date: 2018/9/13
 * Author: liuguolai
 * Description: 管理access_token
 */
let fly = require('flyio');
let consts = require('../consts');

let AccessTokenMgr = function () {
    this.url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
        + consts.APP_ID + '&secret=' + consts.APP_SECRET;
    this.access_token = "";
    this.expires_in = 0;
    this.endTime = 0;
};

module.exports = AccessTokenMgr;

let pro = AccessTokenMgr.prototype;

pro.getAccessToken = function () {
    let self = this;
    fly.get(self.url).then(function (response) {
        if (response.status != 200) {
            console.error("get access_token connect failed.");
            return;
        }
        let data = response.data;
        console.log(data);
        if (data.access_token) {
            self.access_token = data.access_token;
            self.expires_in = data.expires_in;
            self.endTime = new Date().getTime() + self.expires_in * 1000;
            setTimeout(self.getAccessToken.bind(self), self.expires_in * 1000);
        }
        else {
            console.error(data);
            // 30秒后重试
            setTimeout(self.getAccessToken.bind(self), 30 * 1000);
        }
    }).catch(function (error) {
        console.error("get access_token error: ", error);
    });
};

pro.getInfo = function () {
    let leftTime = Math.max(0, Math.floor((this.endTime - new Date().getTime()) / 1000));
    return {
        access_token: this.access_token,
        leftTime: leftTime
    }
}
