/**
 * Date: 2018/6/27
 * Author: liuguolai
 * Description:
 */

module.exports = {
    NodeType: {
        ROOT: 1,
        LEAF: 2,
        SEQUENCE: 3,
        SELECTOR: 4,
        PROBABILITY: 5,
        SUBTREE: 6,
        QUITTREE: 7,  // 离开子树

        FILTER_ALWAYS: 101,  // 总是输出一个结果
        FILTER_REVERSE: 102,  // 取反
        FILTER_EXE_TIMES: 103,  //  成功执行N次
        FILTER_EXE_SECONDS: 104,  // 指定时间内持续执行
        FILTER_EXE_INTERVAL: 105,  // 至少N秒后执行下一次
    },

    StatusType: {
        // ERROR
        ERROR_: -2,
        ERROR_UNKNOWN_SUBTREE: -100,
        // type
        FAILURE: 0,
        SUCCESS: 1,
        RUNNING: 2,
        BREAK: 3,
    }
};
