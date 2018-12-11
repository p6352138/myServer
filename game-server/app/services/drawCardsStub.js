/**
 * Date: 2018/9/7
 * Author: pwh
 * Description:  抽卡管理
 */
 
let logger = require('pomelo-logger').getLogger('game', 'teamStub');
let pomelo = require('pomelo');
let cards = require('../data/Cards')

let DrawCardsStub = function (opts) {
    opts = opts || {};
    //this.cards = new Array();  // 卡池
    this.three = new Array();   //三星卡池
    this.four = new Array();    //四星卡池
    this.five = new Array();    //五星卡池

    ///初始化卡池 1000 名将卡包
    var cardss = cards[1000];
    for(var key in cardss.Cards)
    {
        var result = cardss.Cards[key].ID / 1000;
        if(result == 3)
        {
            this.three.push(cardss.Cards[key])
        }
        else if(result == 4)
        {
            this.four.push(cardss.Cards[key])
        }
        else if(result == 5)
        {
            this.five.push(cardss.Cards[key])
        }
    }
};

module.exports = DrawCardsStub;
let pro = DrawCardsStub.prototype;

pro.drawCard = function (entID,PoolID,cb) {
   
    if (entInfo.id in this.ids)
        return cb({code: consts.TeamCode.IN_TEAM});

    /*let team = this.createEmptyTeam(teamType, specialId);
    this.ids[entInfo.id] = {
        teamID: team.id,
        sid: entInfo.sid,
    }*/


    cb({code: consts.TeamCode.OK});
    team.addMember(entInfo);
};

