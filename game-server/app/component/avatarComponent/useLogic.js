/**
 * Date: 2018/10/23
 * Author: liuguolai
 * Description: 使用逻辑
 */
let itemTpl = _require('../../data/Item');

let useLogic = module.exports;

useLogic.addItem = function (avt, item, cnt) {
    let useInfo = itemTpl[item.id].UseInfo;
    let genItemID = useInfo.id, genCnt = useInfo.cnt * cnt;
    avt.bag.addItem(genItemID, genCnt, false);
    return cnt;
};
