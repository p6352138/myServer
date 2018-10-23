var cardsMgr = module.exports;

///抽卡堆
var cards = [30];
///弃牌库
var discardCards = [];
///消耗牌库
var ExhaustedCards = [];


cardsMgr.init = function(){
    /// 暂代初始化算法
    for(var i=0;i<30;i++)
    {
        cards[i] = i;
    }

    ///乱序
    cards = shuffle(cards);
}

///抽牌
cardsMgr.DrawPile = function()
{
    return cards.shift();
}

cardsMgr.getCardsNum = function(){
    return cards.length;
}

cardsMgr.getDisCardsNum = function(){
    return discardCards.length;
}

cardsMgr.getExhaustedCardsNum = function(){
    return ExhaustedCards.length;
}


/// 乱序 算法，从数组末尾乱序前面的位置替换数据，以此类推。
shuffle = function(arr){
    var length = arr.length,randomIndex,temp;

    while(length)
    {
        randomIndex = Math.floor(Math.random() * (length--));
        temp = arr[randomIndex];
        arr[randomIndex] = arr[length];
        arr[length] = temp;
    }
    return arr;
}