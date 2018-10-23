/**
 * Date: 2018/6/12
 * Author: liuguolai
 * Description: 所有Entity的管理器
 */
var logger = _require('pomelo-logger').getLogger('game', __filename);
var utils = _require('../util/utils');

var entities = {}
var entitiesClassify = {}

var entityMgr = module.exports;

entityMgr.hasEntity = function (entityid) {
    return entityid in entities;
};

entityMgr.getEntity = function (entityid) {
    return entities[entityid];
};

entityMgr.delEntity = function (entityid) {
    if (entityid in entities) {
        var ent = entities[entityid];
        var classNmae = utils.getObjectClass(ent);
        entitiesClassify[classNmae].delete(classNmae);
        delete entities[entityid];
    }
};

entityMgr.addEntity = function (entityid, ent, override=true) {
    if (entityid in entities) {
        logger.warn("addEntity entity %s already exist", entityid);
        if (!override)
            return;
    }
    entities[entityid] = ent;
    var classNmae = utils.getObjectClass(ent);
    if (!entitiesClassify.hasOwnProperty(classNmae))
        entitiesClassify[classNmae] = new Set();
    entitiesClassify[classNmae].add(ent);
};

entityMgr.getAllEntities = function () {
    return entities;
};
