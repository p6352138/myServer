/**
 * Date: 2018/9/12
 * Author: liuguolai
 * Description:
 */
let Formula = {};

// 随机3份
Formula.randomDivide3Part = function (total) {
    // ROUND(M1/3+RANDBETWEEN(-M1/6,M1/6),0)
    let m3 = Math.floor(total / 3), m6 = Math.floor(total / 6);
    let num1 = m3 + Math.floor(Math.random() * (2 * m6 + 1) - m6);
    let num2 = m3 + Math.floor(Math.random() * (2 * m6 + 1) - m6);
    let num3 = total - num1 - num2;
    return [num1, num2, num3];
};

// 随机n份
Formula.randomDivideNPart = function (total, part) {
    if (part === 1) {
        return [total];
    }
    // 插桩，不含0份
    let pileList = [], needPile = part - 1;
    while (pileList.length < needPile) {
        pileList.push(Math.floor(Math.random() * total) + 1);
    }
    pileList.push(0);
    pileList.push(total);
    pileList.sort((a, b) => (a - b));
    let res = [];
    for (let i = 0; i < total; i++) {
        res.push(pileList[i + 1] - pileList[i]);
    }
    return res;
};

// 随机n份，保证不为0
Formula.randomDivideNPartNoZero = function (total, part) {
    if (part === 1) {
        return [total];
    }
    if (total === part) {
        let res = Array(total);
        res.fill(1);
        return res;
    }
    if (total < part) {
        let res = Array(part);
        res.fill(0);
        for (let i = 0; i < total; i++) {
            let randIdx = Math.floor(Math.random() * part);
            res[randIdx] += 1;
        }
        return res;
    }
    // 插桩，不含0份
    let pileSet = new Set(), needPile = part - 1, num = 0, maxCycleNum = 2 * total;
    while (pileSet.size < needPile) {
        pileSet.add(Math.floor(Math.random() * total) + 1);
        if (++num === maxCycleNum) {
            throw new Error("randomDivideNPart cycle too much total: " + total);
        }
    }
    pileSet.add(0);
    pileSet.add(total);
    let list = Array.from(pileSet);
    list.sort((a, b) => (a - b));
    let res = [];
    for (let i = 0; i < total; i++) {
        res.push(list[i + 1] - list[i]);
    }
    return res;
};

module.exports = Formula;
