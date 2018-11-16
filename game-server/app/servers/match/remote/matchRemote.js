/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description:
 */
var utils = _require('../../../util/utils')
let consts = _require('../../../common/consts')
let logger = require('pomelo-logger').getLogger('game', 'matchRemote');

module.exports = function(app) {
    return new Remote(app);
};

var Remote = function(app) {
    this.app = app;
};

var pro = Remote.prototype;

pro.match = function (teamType, matchNum, matchInfo, dgId, cb) {
    var matchStub = this.app.matchStubs[teamType][matchNum];
    var res = matchStub.match(matchInfo, dgId);
    utils.invokeCallback(cb, {code: res});
};

pro.unmatch = function (teamType, matchNum, uid, cb) {
    logger.debug('unmatch ', teamType, matchNum, uid);
    var matchStub = this.app.matchStubs[teamType][matchNum];
    matchStub.unmatch(uid);
    cb();
};

pro.matchTeam = function (teamType, teamId, teamMembers, matchInfo, cb) {
    let matchNum = matchInfo.matchNum;
    let matchStub = this.app.matchStubs[teamType][matchNum];
    matchStub.matchTeam(teamId, teamMembers, matchInfo, cb);
};

pro.matchConfirm = function (teamType, matchNum, uid, cb) {
    let matchStub = this.app.matchStubs[teamType][matchNum];
    let bSucceed = matchStub.matchConfirm(uid);
    if (bSucceed)
        cb({code: consts.Code.OK});
    else
        cb({code: consts.Code.FAIL});
};
