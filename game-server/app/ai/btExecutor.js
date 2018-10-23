/**
 * Date: 2018/6/26
 * Author: liuguolai
 * Description:
 */
var btreeManager = _require('./btreeManager');
var btreeEntry = _require('./btreeEntry');

var BTExecutor = function (owner, strategy) {
    this.owner = owner;
    this.curTree = this.getBTree(strategy);

    this.reset();
};

module.exports = BTExecutor;

var pro = BTExecutor.prototype;

pro.hasBTree = function (aiName) {
    var moduleName = './aiData/' + aiName;
    try {
        _require(moduleName);
    } catch (e) {
        console.error(e.name);
        console.error(e.message);
        return false;
    }
    if (btreeManager.getByName(aiName))
        return true;
    return false;
};

pro.getBTree = function (aiName) {
    if (!this.hasBTree(aiName))
        return null;
    return new btreeEntry(aiName);
};

pro.tick = function () {
    return this.curTree.entry(this.owner);
};

pro.reset = function () {
    this.exeStates = {}
};

pro.setExecuteState = function (func, state) {
    if (state === null)
        delete this.exeStates[func];
    else
        this.exeStates[func] = state;
};

pro.getExecuteState = function (func) {
    return this.exeStates[func];
};

pro.destroy = function () {
    this.curTree = null;
};
