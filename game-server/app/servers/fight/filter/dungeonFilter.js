/**
 * Date: 2018/6/21
 * Author: liuguolai
 * Description:
 */
var entityManager = _require('../../../services/entityManager');

module.exports = function() {
    return new Filter();
};

var Filter = function() {
};

/**
 * dungeon filter
 */
Filter.prototype.before = function(msg, session, next){
    var dungeonEntity = entityManager.getEntity(session.get('dgEntId'));
    if (!dungeonEntity) {
        next(new Error('No dungeonEntity exist!'));
        return;
    }
    session.dungeonEntity = dungeonEntity;

    next();
};
