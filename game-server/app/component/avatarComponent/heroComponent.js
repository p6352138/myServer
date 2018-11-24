/**
 * Date: 2018/6/21
 * Author: pwh
 * Description:
 */
let util = require('util');
let Component = _require('../component');
let consts = _require('../../public/consts');
let heroTpl = _require('../../data/Hero');

let Hero = function (heroid, opts) {
    this.heroid = heroid;
    if (!opts) {
        this._initTreasureGroups();
        return;
    }
    this.treasureGroups = opts.treasureGroups;
    this.selectedGroup = opts.selectedGroup;
};

Hero.prototype._initTreasureGroups = function () {
    this.treasureGroups = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];
    this.selectedGroup = 1;  // 默认选中宝物组1
};

Hero.prototype.getInfo = function () {
    return {
        treasureGroups: this.treasureGroups,
        selectedGroup: this.selectedGroup,
    }
};

Hero.prototype.getPersistData = function () {
    return {
        treasureGroups: this.treasureGroups,
        selectedGroup: this.selectedGroup,
    }
};

Hero.prototype.getClientInfo = function () {
    return {
        treasureGroups: this.treasureGroups,
        selectedGroup: this.selectedGroup,
    }
};

/****************************************/

let HeroComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(HeroComponent, Component);
module.exports = HeroComponent;

let pro = HeroComponent.prototype;

pro.init = function (opts) {
    this._initDbData(opts.hero || {});
};

pro._initDbData = function (data) {
    this._initOwnHeros(data.ownHeros);
};

pro._initOwnHeros = function (heros) {
    this.ownHeros = {};
    if (!heros) {
        // 新号默认英雄
        this.addHero(1000, false);
        this.addHero(2000, false);
        return;
    }
    for (let heroid in heros) {
        this.ownHeros[heroid] = new Hero(heroid, heros[heroid]);
    }
};

pro.getPersistData = function () {
    let ownHeros = {};
    for (let heroid in this.ownHeros) {
        ownHeros[heroid] = this.ownHeros[heroid].getPersistData();
    }
    return {
        ownHeros: ownHeros
    };
};

pro.getClientInfo = function () {
    let ownHeros = {};
    for (let heroid in this.ownHeros) {
        ownHeros[heroid] = this.ownHeros[heroid].getClientInfo();
    }
    return {
        ownHeros: ownHeros
    };
};

pro.hasHero = function (heroid) {
    return this.ownHeros.hasOwnProperty(heroid);
};

pro.heroNum = function () {
    return Object.getOwnPropertyNames(this.ownHeros).length;
};

pro.getOwnHeroIdList = function () {
    return Object.getOwnPropertyNames(this.ownHeros).map(Number);
};

pro.getOwnHerosInfo = function () {
    var herosInfo = {};
    for (var heroid in this.ownHeros) {
        herosInfo[heroid] = this.ownHeros[heroid].getInfo();
    }
    return herosInfo;
};

pro.canAddHero = function (heroid) {
    if (!heroTpl.hasOwnProperty(heroid))
        return false;
    if (this.hasHero(heroid))
        return false;
    return true;
};

pro.addHero = function (heroid, bNotify=true) {
    if (!this.canAddHero(heroid))
        return false;
    this.ownHeros[heroid] = new Hero(heroid);
    if (bNotify) {
        // todo
    }
    return true;
};
