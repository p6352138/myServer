/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description: component基类定义
 */
let EventEmitter = require('events').EventEmitter;
let util = require('util');

let Component = function (entity) {
    EventEmitter.call(this);
    this.entity = entity;

    this.event2Funcs = {};
};

util.inherits(Component, EventEmitter);
module.exports = Component;

let pro = Component.prototype;

pro.safeBindEvent = function (event, func) {
    if (!(event in this.event2Funcs)) {
        this.event2Funcs[event] = [];
    }
    this.on(event, func);
    this.event2Funcs[event].push(func);
};

pro.clearEventListeners = function () {
    for (let event in this.event2Funcs) {
        let funcs = this.event2Funcs[event];
        for (let i = 0; i < funcs.length; i++) {
            this.removeListener(event, funcs[i]);
        }
    }
    this.event2Funcs = {};
};

pro.destroy = function () {
    this.clearEventListeners();
    this.entity = null;
};
