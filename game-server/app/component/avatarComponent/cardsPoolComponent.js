/**
 * Date: 2018/9/7
 * Author: pwh
 * Description: 卡池组件
 */

let util = require('util');
let Component = _require('../component');
var drawHelp = _require('../../helper/drawCardsHelp')
let consts = _require('../../public/consts')

let CardsPoolComponet = function(entity)
{
    Component.call(this,entity);
}

util.inherits(CardsPoolComponet, Component);
module.exports = CardsPoolComponet;

let pro = CardsPoolComponet.prototype;

pro.init = function(opts){
    this._initDbData(opts.cardsPool );
}

pro._initDbData = function (data) {
    this.cards = data.cards == null ? drawHelp.getCards() : data.cards;
    this.count = data.count == null ? 5 : data.count;
};

pro.getPersistData = function(){
    return {
        cards : this.cards,
        count : this.count,
    }
}

// 抽卡请求
pro.drawCard = function (id,type,next) {
    var result = new Array();

    // id == 1000 默认名将包
    if(type == consts.DrawType.ONCE)
    {
        result.push(drawHelp.drawCard(id,this.cards[0]));
        this.cards.splice(0,1);
        this.entity.hero.hasHero(result[0]);
    }
    else if(type == consts.DrawType.QUINTIC)
    {
        for(var i =0;i<5;i++)
        {
            var heroid = drawHelp.drawCard(id,this.cards[0]);
            result.push(heroid);
            this.cards.splice(0,1);
            this.entity.hero.hasHero(heroid);
        }
    }

    if(this.cards.length <= 5)
    {
        var arr = drawHelp.getCards();
        this.cards = this.cards.concat(arr);
    }

    let resp = {
        code: consts.DrawCardCode.OK,
        hero : result,
        count : this.count,
    }
    
    next(null, resp);
};

