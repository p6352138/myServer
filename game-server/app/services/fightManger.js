var cardsMgr = require('../services/cardsMgr');
var player = require('../entity/player');
var messageService = require('../services/messageService');
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var fightManger = module.exports;

var players = [];
var rooms = [];

fightManger.init = function(){
    ///牌组初始化
    cardsMgr.init();

    setInterval(checkPile,5000);

    console.log("fightManger init ...");
}

fightManger.beginFight = function(uid,roomid)
{
    var self = this;
    var item = player;
    item.uid = uid;

    for(var i=0;i<5;i++)
    {
        item.DrawPile(cardsMgr.DrawPile());
    }

    players.push(item);

    pushFreshPile();
}

fightManger.exit = function(){

    //this.channel.destroy();

    clearInterval();
}

GetPileData = function(uid)
{
    var data = {"playerCards":players[0].ShowCards,
            "cards":cardsMgr.getCardsNum(),
            "discardCards":cardsMgr.getDisCardsNum(),
            "ExhaustedCards":cardsMgr.getExhaustedCardsNum()
        }
    return data;
}

/// 五秒发牌
checkPile = function()
{
    for(var i=0;i<players.length;i++)
    {
        if(players[i].CheckCards(10))
        {
            players[i].DrawPile(cardsMgr.DrawPile());

            pushFreshPile(players[i].uid);
            //messageService.pushMessageToPlayer(players[i].uid,'OnFreshPile',GetPileData(players[i].uid));
            //console.log('OnFreshPile %j',GetPileData(players[i].uid));
        }
    }
}

pushFreshPile = function(uid)
{
    var channel = pomelo.app.get('channelService').getChannel(10000, false);
    if(channel == null)
        console.log('not found chanel !!!');
    channel.pushMessage('OnFreshPile',GetPileData(uid));
}
