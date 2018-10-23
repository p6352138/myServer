/**
 * Date: 2018/6/21
 * Author: liuguolai
 * Description:
 */
var util = _require('util');
var Component = _require('../component');
var consts = _require('../../public/consts');


var Hero = function (opts) {
    this.lv = opts.lv;
};

Hero.prototype.getInfo = function () {
    return {
        lv: this.lv,
    }
};

/****************************************/

var HeroComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(HeroComponent, Component);
module.exports = HeroComponent;

HeroComponent.prototype.init = function (opts) {
    // 测试数据
    this.ownHeros = {
        1000: new Hero({lv: 1}),  // todo: 此处应该是hero对象
        2000: new Hero({lv: 1})
    }
};

HeroComponent.prototype.hasHero = function (heroid) {
    return this.ownHeros.hasOwnProperty(heroid);
};

HeroComponent.prototype.heroNum = function () {
    return Object.getOwnPropertyNames(this.ownHeros).length;
};

HeroComponent.prototype.getOwnHeroIdList = function () {
    return Object.getOwnPropertyNames(this.ownHeros).map(Number);
};

HeroComponent.prototype.getOwnHerosInfo = function () {
    var herosInfo = {};
    for (var heroid in this.ownHeros) {
        herosInfo[heroid] = this.ownHeros[heroid].getInfo();
    }
    return herosInfo;
};
