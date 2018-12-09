let cards = require('../game-server/app/data/Cards')

var p = Math.random(), n = Math.random()/4;

console.log('p == ',p,' n === ',n);

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
/*
var updateRandom = randomInProbability( 0.01, 0.03, 0.06, 0.09 );

function updateRandom() {
  var p = Math.random(), n = Math.random() / 4;
 
  if( p < 0.01 )
    return 0 + n;
 
  if( p < 0.04 )
    return 0.25 + n;
 
  if( p < 0.1 )
    return 0.5 + n;
 
  if( p < 1 )
    return 0.75 + n;
}
*/
//var objects = [ '登山包', '旅行箱', '移动电源', '不中奖' ];
//var randomIndex = Math.floor( objects.length * updateRandom() ); 
//var object = objects[ randomIndex ];

var three = new Array();   //三星卡池
var four = new Array();    //四星卡池
var five = new Array();    //五星卡池

    var cardss = cards[1000];
    for(var key in cardss.Cards)
    {
        var result = cardss.Cards[key].ID / 1000;
        if(result == 3)
        {
            three.push(cardss.Cards[key])
        }
        else if(result == 4)
        {
            four.push(cardss.Cards[key])
        }
        else if(result == 5)
        {
            five.push(cardss.Cards[key])
        }
    }

    var updateRandom = randomInProbability(cardss.Probability);
    var data = new Array();
    ///保定检测
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
        //console.log('cur card = ',randomIndex ,' cur index = ',i);
    }

    if(security)
    {
       var index = Math.floor(20 * Math.random());
       data[index] = 0;
    }

    console.log('cur card = ',data);
