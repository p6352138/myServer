/**
 * Date: 2018/9/26
 * Author: pwh
 * Description:
 */
let matchHelper = module.exports;

matchHelper.PVPMatchNumToNeeds = {
    1: [
        // 7个1
        {1: 7},
        // 2个2,3个1
        {2: 2, 1: 3},
        // 3个2,1个1
        {2: 3, 1: 1},
        // 1个3,1个2,2个1
        {3: 1, 2: 1, 1: 2},
        // 1个4,1个2,1个1
        {4: 1, 2: 1, 1: 1},
        // 1个3,2个2
        {3: 1, 2: 2},
        // 2个3,1个1
        {3: 2, 1: 1},
        // 1个4,1个3
        {4: 1, 3: 1}
    ],
    2: [
        // 1个2,4个1
        {2: 1, 1: 4},
        // 2个2,2个1
        {2: 2, 1: 2},
        // 1个3,3个1
        {3: 1, 1: 3},
        // 1个4,2个1
        {4: 1, 1: 2},
        // 3个2
        {2: 3},
        // 1个3,1个2,1个1
        {3: 1, 2: 1, 1: 1},
        // 1个4,1个2
        {4: 1, 2: 1}
    ],
    3: [
        // 1个2,3个1
        {2: 1, 1: 3},
        // 2个2,1个1
        {2: 2, 1: 1},
        // 1个3,2个1
        {3: 1, 1: 2},
        // 1个4,1个1
        {4: 1, 1: 1}
    ],
    4: [
        // 1个2,2个1
        {2: 1, 1: 2},
        // 2个2
        {2: 2},
        // 1个3,1个1
        {3: 1, 1: 1},
        // 1个4
        {4: 1}
    ]
};
