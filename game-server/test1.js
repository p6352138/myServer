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

var objects = [ '登山包', '旅行箱', '移动电源', '不中奖' ];
var randomIndex = Math.floor( objects.length * updateRandom() ); 
var object = objects[ randomIndex ];