/**
 * Date: 2018/6/2
 * Author: liuguolai
 * Description: entity基类
 */

var EventEmitter = _require('events').EventEmitter;
var util = _require('util');
var ObjectId = _require('mongoose').Types.ObjectId;
var entityManager = _require('../services/entityManager');
var componentRegister = _require('../component/componentRegister');
var utils = _require('../util/utils');
var consts = _require('../common/consts');

var Entity = function (opts) {
    opts = opts || {};
    this.event2Funcs = {};
    var components = ['logger'];
    opts.components = components.concat(opts.components || []);
    EventEmitter.call(this);
    this.id = opts._id ? opts._id: ObjectId().toString();
    this._kind = utils.getObjectClass(this);
    this.initComponents(opts.components, opts);  // 初始化组件

    entityManager.addEntity(this.id, this);
    this._entityState = consts.ENTITY_STATE_INITED;
};

util.inherits(Entity, EventEmitter);
module.exports = Entity;

let pro = Entity.prototype;

pro.initComponents = function (components, opts) {
    this.components = components;
    for (var i = 0, len = components.length; i < len; i++) {
        var name = components[i];
        var component = componentRegister.getComponent(name);
        this[name] = new component(this);
        if (this[name].init) {
            this[name].init(opts);
        }
    }
};

pro.isA = function (kind) {
    if (kind === this._kind)
        return true;
    return false;
};

pro.isDestroyed = function () {
    return this._entityState === consts.ENTITY_STATE_DESTROYED;
};

pro.destroy = function () {
    // component destroy
    for (var i = this.components.length - 1; i >= 0; i--) {
        var name = this.components[i];
        this[name].destroy();
        delete this[name];
    }
    this.clearEventListeners();
    this.logger = null;
    entityManager.delEntity(this.id);
    this._entityState = consts.ENTITY_STATE_DESTROYED;
};

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
