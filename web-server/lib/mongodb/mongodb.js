var assert = require('assert');
var mongoose = require('mongoose');
var schemaConfig = require('./schemaConfig')
var config = require('../../config/mongodb');


var uri = null;

/**
 * 连接成功
 */
mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + uri);
});

/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});

var instance = null;

module.exports = function () {
    if (instance) {
        return instance;
    }
    return instance = new Mongodb();
}

var Mongodb = function() {
    this.init();
};

// 初始化连接
Mongodb.prototype.init = function () {
    var host = config.host, port = config.port, database = config.database;
    uri = "mongodb://" + host + ":" + port + "/" + database + "?authSource=admin";
    mongoose.connect(uri,  config.options);
    // 初始化model
    this.initModel();
};

Mongodb.prototype.initModel = function () {
    var models = {};
    for (var name in schemaConfig) {
        models[name] = mongoose.model(name, schemaConfig[name]);
    };
    Mongodb.prototype.models = models;
};

Mongodb.prototype.newModel = function (name, data) {
    assert(name in this.models, "no model: " + name);
    var model = this.models[name];
    return new model(data);
};

Mongodb.prototype.getModel = function (name) {
    assert(name in this.models, "no model: " + name);
    return this.models[name];
};

Mongodb.prototype.find = function (modelName, conditions, projection=null, options=null, callback=null) {
    this.getModel(modelName).find(conditions, projection, options, callback);
};

Mongodb.prototype.update = function (modelName, conditions, doc, options, callback) {
    this.getModel(modelName).update(conditions, doc, options, callback);
};
