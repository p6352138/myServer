/**
 * Date: 2018/9/20
 * Author: liuguolai
 * Description:
 */
var entityManager = _require('../../../services/entityManager');

module.exports = function() {
    return new Filter();
};

var Filter = function() {
};

Filter.prototype.before = function(msg, session, next){
    if (session.uid) {
        session.avatar = entityManager.getEntity(session.uid);
    }

    next();
};
