let cardsData = require('../data/Cards')

var drawCards = module.exports;

function randomInProbability( weights ){
    if( arguments.length > 1 ){
      weights = [].slice.call( arguments );
    }
   
    var total, current = 0, parts = [],
        i = 0, l = weights.length;
   
    // reduce 方法的简单兼容
    total = weights.reduce ? weights.reduce( function( a, b ){
      return a + b;
    } ) : eval( weights.join( '+' ) );
   
    for( ; i < l; i ++ ){
      current += weights[ i ];
      parts.push( 'if( p < ', current / total, ' ) return ', i / l, ' + n;' );
    }
   
    return Function( 'var p = Math.random(), n = Math.random() / ' + l + ';' + parts.join( '' ) );
}

drawCards.isInit = false;

drawCards.init = function(){
    this.three = new Array();   //三星卡池
    this.four = new Array();    //四星卡池
    this.five = new Array();    //五星卡池

    var cardss = cardsData[1000];
    for(var key in cardss.Cards)
    {
        var result = Math.floor(cardss.Cards[key] / 1000);
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
}

drawCards.getCards = function(){
    var cardss = cardsData[1000];
    var updateRandom = randomInProbability(cardss.Probability);
    var data = new Array();
    ///保保底检测
    var security = true;
    for(var i = 1;i<=20;i++)
    {
        var randomIndex = 0;

        if(i % 5 == 0)
        {
          randomIndex = Math.floor( 2 * updateRandom() ); 
        }
        else
        {
          randomIndex = Math.floor( 3 * updateRandom() ); 
        }

        if(randomIndex == 0)
            security = false;

        data.push(randomIndex);
    }

    if(security)
    {
       var index = Math.floor(20 * Math.random());
       data[index] = 0;
    }

    return data;
}

/// id 卡包id，lv 星级
drawCards.drawCard = function(id,lv)
{
    if(!this.isInit)
    {
        this.init();
        this.isInit = true;
    }

    ///暂时默认取名将包
    switch(lv)
    {
        case 0:
            return this.five[Math.floor(this.five.length * Math.random())];
        case 1:
            return this.four[Math.floor(this.four.length * Math.random())];
        case 2:
            return this.three[Math.floor(this.three.length * Math.random())];
    }
}
