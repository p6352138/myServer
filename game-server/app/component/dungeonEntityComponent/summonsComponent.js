/**
 * Date: 2018/9/13
 * Author: liuguolai
 * Description: 召唤物组件
 */
let Component = _require('../component');
let util = require('util');
let Formula = require('../../util/formula');
let matrixTpl = _require('../../data/Matrix');
let fightHelper = _require('../../helper/fightHelper');

let SummonsComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(SummonsComponent, Component);
module.exports = SummonsComponent;

let pro = SummonsComponent.prototype;

pro.init = function (opts) {
    // 召唤物
    this.spawnSummons = {
        seed: new Date().getTime(),  // 种子
        groupA: {
            // type : { area: num }
        },
        groupB: {}
    };
};

// 添加召唤物
pro.addSpawnSummon = function (groupId, opposite, type, area, num) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    let summonGroup = this.spawnSummons[groupId];
    if (type in summonGroup === false)
        summonGroup[type] = {};
    let addList = [];
    if (area === "random") {  // 随机
        let numList = Formula.randomDivide3Part(num);
        fightHelper.shuffle(numList);
        for (let i = 0; i < numList.length; i++) {
            let curArea = i + 1, addNum = numList[i];
            if (addNum > 0) {
                summonGroup[type][curArea] = (summonGroup[type][curArea] || 0) + addNum;
                addList.push({
                    area: curArea,
                    num: addNum
                })
            }
        }
    }
    else {
        summonGroup[type][area] = (summonGroup[type][area] || 0) + num;
        addList.push({
            area: area,
            num: num
        })
    }

    this.entity.broadcast("onAddSpawnSummon", {
        groupId: groupId,
        type: type,
        addList: addList
    });
};

// 删除召唤物
pro.removeSpawnSummon = function (groupId, opposite, type, area, num) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    let summonGroup = this.spawnSummons[groupId];
    let summons = summonGroup[type];
    if (!summons)
        throw new Error("removeSpawnSummon with type: " + type);
    let removeList = [];
    if (area === "random") {  // 随机删除
        let resNum = [0, 0, 0];
        let leftNum = [summons[1] || 0, summons[2] || 0, summons[3] || 0];
        // todo: 使用最原始方法遍历，后续考虑优化
        while (num--) {
            let totalNum = leftNum[0] + leftNum[1] + leftNum[2];
            if (totalNum <= 0)
                break;
            let idx = Math.floor(Math.random() * totalNum) + 1;
            let total = 0
            for (let i = 0; i < 3; i++) {
                total += leftNum[i];
                if (total >= idx) {
                    resNum[i] += 1;
                    leftNum[i] -= 1;
                    break;
                }
            }
        }
        for (let i = 0; i < resNum.length; i++) {
            let removeNum = resNum[i];
            if (removeNum > 0) {
                summons[i + 1] -= removeNum;
                removeList.push({
                    area: i + 1,
                    num: removeNum,
                })
            }
        }
    }
    else {
        summons[area] = Math.max(0, summons[area] - num);
        removeList.push({
            area: area,
            num: num
        })
    }

    this.entity.broadcast("onRemoveSpawnSummon", {
        groupId: groupId,
        type: type,
        removeList: removeList
    });
};

// 获取召唤物对entity造成的伤害次数
pro.getSummonsDamageCntToEntity = function (groupId, opposite, type, consume) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    var summonGroup = this.spawnSummons[groupId];
    if (type in summonGroup === false)  // 没有该类型的召唤物，不造成伤害
        return null;

    if (groupId === "groupA") {
        var formation = this.entity.formationA;
        var matrixData = matrixTpl[this.entity.matrixIDA];
    }
    else {
        var formation = this.entity.formationB;
        var matrixData = matrixTpl[this.entity.matrixIDB];
    }
    var result = {}
    var summons = summonGroup[type];
    for (var area in summons) {
        var cnt = summons[area];
        var areaList = matrixData["Area" + area];
        for (var pos in areaList) {
            var entID = formation[pos - 1];
            if (entID) {
                result[entID] = (result[entID] || 0) + cnt;
            }
        }
    }
    // 消耗
    if (consume) {
        delete summonGroup[type];
        // this.entity.broadcast("onClearSpawnSummon", {
        //     groupId: groupId,
        //     type: type,
        // });
    }
    return result;
};

// 获取某类型的召唤物数量
pro.getSummonsNumByType = function (groupId, opposite, type) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    var summonGroup = this.spawnSummons[groupId];
    if (type in summonGroup === false)  // 没有该类型的召唤物，不造成伤害
        return 0;
    var summons = summonGroup[type];
    var total = 0;
    for (var area in summons) {
        total += summons[area];
    }
    return total;
};

// 获取召唤物
pro.getSummonsByType = function (groupId, opposite, type) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    var summonGroup = this.spawnSummons[groupId];
    if (type in summonGroup === false)
        return {};
    return summonGroup[type];
};

// 清空召唤物
pro.clearSummonsByType = function(groupId, opposite, type, broadcast) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    var summonGroup = this.spawnSummons[groupId];
    if (type in summonGroup === false)  // 没有该类型的召唤物，不造成伤害
        return;

    delete summonGroup[type];
    if (broadcast) {
        this.entity.broadcast("onClearSpawnSummon", {
            groupId: groupId,
            type: type,
        });
    }
};

// 重置召唤物
pro.resetSummonsByType = function(groupId, opposite, type, total) {
    if (opposite)
        groupId = this.entity._getOppositeGroupId(groupId);
    var summonGroup = this.spawnSummons[groupId];
    if (!total) {
        if (type in summonGroup === false)
            return;
        var summons = summonGroup[type];
        total = 0;
        for (var area in summons) {
            total += summons[area];
        }
    }

    let numList = Formula.randomDivide3Part(total);
    fightHelper.shuffle(numList);
    summonGroup[type] = {
        1: numList[0],
        2: numList[1],
        3: numList[2]
    }
};
