/**
 * Date: 2018/9/13
 * Author: liuguolai
 * Description:
 */
let pomelo = require('pomelo');
let fly = require('flyio');
let logger = require('pomelo-logger').getLogger('game', "accessTokenManager");

let AccessTokenManager = function () {
    let mangoConfig = pomelo.app.get('mangoConfig');;
    this.url = 'http://' + mangoConfig.centerServerIP + ':' + mangoConfig.centerControlPort + '/AccessToken';
    this.access_token = "";
    this.expires_in = 0;
    this.endTime = 0;
};

module.exports = AccessTokenManager;

let pro = AccessTokenManager.prototype;

pro.getAccessToken = function () {
    let self = this;
    fly.get(self.url).then(function (response) {
        if (response.status != 200) {
            logger.error("get access_token connect failed.");
            // 重试
            setTimeout(self.getAccessToken.bind(self), 10 * 1000);
            return;
        }
        let data = response.data;
        logger.info("access token info", data);
        self.access_token = data.access_token;
        let leftTime = parseInt(data.leftTime) + 10;
        setTimeout(self.getAccessToken.bind(self), leftTime * 1000);
    }).catch(function (error) {
        logger.error("get access_token error: ", error);
    });
};
