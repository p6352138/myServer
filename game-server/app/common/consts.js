/**
 * Date: 2018/7/16
 * Author: liuguolai
 * Description: 服务器专用consts
 */
var uconsts = _require('../public/consts');

var consts = {
    APP_ID: "wx6e08467553158527",
    APP_SECRET: "4c5ce70f86af49bd8eba1901ff1adc62",

    OPEN_CROSS_SERVER: true,  // 是否开启跨服

    // entity state
    ENTITY_STATE_INITED: 1,
    ENTITY_STATE_DESTROYED: 2,

    // 属性名定义(ai)
    AttributeName: {
        HP: "hp",
        HP_PCT: "hpPct",
        MP: "mp",
        THEW: "thew",
        IN_HAND_CARDS_NUM: "inHandCardsNum",  // 手牌数
    },

    // 排序类型（ai）
    SortType: {
        UP: "up",  // 升序
        DOWN: "down",  // 降序
    },

    // 仇恨类型（ai）
    HatredType: {
        FIRST: 1,  // 仇恨最好
        SECOND: 2,  // 仇恨次高
    },

    // 货币消耗reason
    SpendReason: {
        EXCHANGE_SILVER: "exchangeSilver",
    }
};

for (var f in uconsts) {
    if(uconsts.hasOwnProperty(f)) {
        consts[f] = uconsts[f];
    }
};

module.exports = consts;
