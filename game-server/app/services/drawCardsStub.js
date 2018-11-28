/**
 * Date: 2018/9/7
 * Author: pwh
 * Description:  抽卡管理
 */
 
let logger = require('pomelo-logger').getLogger('game', 'teamStub');
let pomelo = require('pomelo');
let heroData = require('../data/Hero')

let DrawCardsStub = function (opts) {
    opts = opts || {};
    this.cards = new Array();  // 卡池

    ///初始化卡池
    for(var key in heroData)
    {

    }
};

module.exports = DrawCardsStub;
let pro = DrawCardsStub.prototype;

pro.drawCard = function (cb) {
    if (entInfo.id in this.ids)
        return cb({code: consts.TeamCode.IN_TEAM});
    let team = this.createEmptyTeam(teamType, specialId);
    this.ids[entInfo.id] = {
        teamID: team.id,
        sid: entInfo.sid,
    }
    cb({code: consts.TeamCode.OK});
    team.addMember(entInfo);
};

