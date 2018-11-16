/**
 * Date: 2018/10/22
 * Author: liuguolai
 * Description: 背包
 */
let Component = _require('../component');
let util = require('util');
let consts = _require('../../common/consts');
let itemTpl = _require('../../data/Item');
let useLogic = _require('./useLogic');

let BagComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(BagComponent, Component);
module.exports = BagComponent;

let pro = BagComponent.prototype;

pro.init = function (opts) {
    this._initDbData(opts.bag || {});

    this._dirtyItemInfo = {};
};

pro._initDbData = function (data) {
    this.items = data.items || {};
};

pro.getPersistData = function () {
    return {
        items: this.items,
    }
};

pro.getClientInfo = function () {
    return {
        items: this.items,
    }
};

pro._newItemGrid = function (itemID) {
    return {
        id: itemID,
        cnt: 0
    }
};

pro.getItemGridByID = function (itemID, insert=false) {
    if (insert && !this.items.hasOwnProperty(itemID)) {
        this.items[itemID] = this._newItemGrid(itemID);
    }
    return this.items[itemID];
};

// 设置item的数量
pro._setItemNum = function (itemID, cnt, bNotify) {
    let itemGrid = this.getItemGridByID(itemID);
    itemGrid.cnt = cnt;
    this._dirtyItemInfo[itemID] = itemGrid;
    if (cnt <= 0) {
        delete this.items[itemID];
    }
    if (bNotify) {
        this.flushDirtyData();
    }
};

pro.flushDirtyData = function () {
    this.entity.sendMessage('onBagItemsUpdate', this._dirtyItemInfo);
    this._dirtyItemInfo = {};
};

// 添加多个道具
pro.addItems = function (items) {
    for (let itemID in items) {
        this.addItem(itemID, items[itemID], false);
    }
    this.flushDirtyData();
};

// 通过道具添加货币
pro._addCurrency = function (itemID, cnt, reason, bNotify) {
    if (itemID === consts.Item.CURRENCY.GOLD) {
        this.entity.avatarProp.giveFreeGold(cnt, reason, bNotify);
    }
    else if (itemID === consts.Item.CURRENCY.SILVER) {
        this.entity.avatarProp.giveSilver(cnt, reason, bNotify);
    }
    else if (itemID === consts.Item.CURRENCY.POWER) {
        this.entity.avatarProp.givePower(cnt, reason, bNotify);
    }
    else {
        this.entity.logger.error('add currency error. id[%s] cnt[%s] reason[%s]', itemID, cnt, reason);
    }
};

// 添加item
pro.addItem = function (itemID, cnt, bNotify=true, reason='default') {
    if (!itemTpl.hasOwnProperty(itemID)) {
        this.entity.logger.error('item id not exist. ' + itemID);
        return;
    }
    if (itemTpl[itemID].Type === consts.Item.TYPE_CURRENCY) {
        this._addCurrency(itemID, cnt, reason, bNotify);
        return;
    }
    let itemGrid = this.getItemGridByID(itemID, true);
    let newCnt = itemGrid.cnt + cnt;
    this._setItemNum(itemID, newCnt, bNotify);
    this.entity.logger.info('add item reason[%s] id[%s] cnt[%s] newNum[%s]', reason, itemID, cnt, newCnt);
};

// 删除item
pro.delItem = function (itemID, cnt, bNotify=true, reason='default') {
    let itemGrid = this.getItemGridByID(itemID);
    if (!itemGrid || itemGrid.cnt < cnt) {
        this.entity.logger.error('del item fail. reason[%s] itemID[%s] cnt[%s]', reason, itemID, cnt);
        return;
    }
    let newCnt = itemGrid.cnt - cnt;
    this._setItemNum(itemID, newCnt, bNotify);
    this.entity.logger.info('del item reason[%s] id[%s] cnt[%s] newNum[%s]', reason, itemID, cnt, newCnt);
};

// 获取某物品数量
pro.getItemCnt = function (itemID) {
    let itemGrid = this.getItemGridByID(itemID);
    if (!itemID)
        return 0;
    return itemGrid.cnt;
};

pro._checkCanSell = function (itemID, cnt) {
    let itemGrid = this.getItemGridByID(itemID);
    if (!itemGrid || itemGrid.cnt < cnt || cnt <= 0) {
        return false;
    }
    if (itemTpl[itemID].Button.indexOf(consts.Bag.FUNC_SELL) === -1)
        return false;
    return true;
};

// 背包出售
pro.bagSell = function (itemID, cnt, next) {
    let bCanSell = this._checkCanSell(itemID, cnt);
    if (!bCanSell) {
        this.entity.logger.error('seel item fail. itemID[%s] cnt[%s]', itemID, cnt);
        return next(null, {code: consts.Code.FAIL});
    }
    let price = itemTpl[itemID].Price;
    let silver = price * cnt;
    this.delItem(itemID, cnt);
    this.entity.avatarProp.giveSilver(silver, consts.GiveReason.BAG_SELL);
    this.entity.logger.info('bag sell itemID[%s] cnt[%s]', itemID, cnt);
    next(null, {code: consts.Code.OK});
};

pro._checkCanUse = function (itemID, cnt) {
    let itemGrid = this.getItemGridByID(itemID);
    if (!itemGrid || itemGrid.cnt < cnt || cnt <= 0) {
        return false;
    }
    let data = itemTpl[itemID];
    if (this.entity.level < data.UseLevel)
        return false;
    if (data.Button.indexOf(consts.Bag.FUNC_USE) === -1 || !data.UseLogic)
        return false;
    return true;
};

// 背包使用
pro.bagUse = function (itemID, cnt, next) {
    let bCanUse = this._checkCanUse(itemID, cnt);
    if (!bCanUse) {
        this.entity.logger.error('use item fail. itemID[%s] cnt[%s]', itemID, cnt);
        return next(null, {code: consts.Code.FAIL});
    }
    let func = useLogic[itemTpl[itemID].UseLogic];
    if (!func) {
        return next(null, {code: consts.Code.FAIL});
    }
    let itemGrid = this.getItemGridByID(itemID);
    let usedCnt = func(this.entity, itemGrid, cnt);
    if (usedCnt > 0)
        this.delItem(itemID, usedCnt);
    this.entity.logger.info('bag use itemID[%s] usedCnt[%s] left[%s]', itemID, usedCnt, itemGrid.cnt - usedCnt);
    next(null, {code: consts.Code.OK});
};
