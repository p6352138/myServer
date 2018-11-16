/**
 * Date: 2018/9/7
 * Author: liuguolai
 * Description: 队伍
 */
var ObjectId = require('mongoose').Types.ObjectId;
var logger = require('pomelo-logger').getLogger('game', 'team');
var assert = require('assert');
var pomelo = require('pomelo');
let consts = _require('../public/consts');
let raidTpl = _require('../data/Raid');

var Team = function (stub, teamType, specialId) {
    this.id = ObjectId().toString();
    this.stub = stub;
    this.teamType = teamType;
    this.specialId = specialId;
    if (this.teamType === consts.Team.TYPE_RAID) {
        this.teamMaxNum = raidTpl[specialId].RequirePlayers;
    }
    else {
        this.teamMaxNum = consts.Team.MAX_NUM;
    }
    this.channel = pomelo.app.get('channelService').getChannel(this.id, true);
    this.members = [];
    this.posList = [0, 0, 0, 0];  // 记录位置
};

module.exports = Team;
var pro = Team.prototype;

pro.size = function () {
    return this.members.length;
};

// 获取空位置
pro.getEmptyPos = function (take = true) {
    for (let i = 0; i < this.teamMaxNum; i++) {
        if (!this.posList[i]) {
            if (take)
                this.posList[i] = 1;
            return i;
        }
    }
};

pro.isCaptainID = function (uid) {
    return this.members[0].id === uid;
};

pro.hasMember = function (uid) {
    for (let member of this.members) {
        if (member.id === uid)
            return true;
    }
    return false;
};

pro.isMemberReady = function (uid) {
    for (let member of this.members) {
        if (member.id === uid) {
            if (member.ready)
                return true;
            return false;
        }
    }
    return false;
};

pro.canMatch = function () {
    for (let member of this.members) {
        if (!member.ready)
            return false;
    }
    return true;
};

pro.canJoin = function (uid) {
    if (this.size() >= this.teamMaxNum)
        return false;
    for (let member of this.members) {
        if (member.id === uid)
            return false;
    }
    return true;
};

pro.addMember = function (entInfo) {
    assert(this.size() < this.teamMaxNum);

    entInfo.ready = 1;  // 默认准备了
    entInfo.pos = this.getEmptyPos();
    this.members.push(entInfo);
    this.channel.add(entInfo.id, entInfo.sid);
    this._refreshTeam();
    logger.info("Team %s addMember %s", this.id, entInfo.id);
};

// 选取等级最高的为队长
pro._electMaxLvCaptain = function () {
    if (this.size() > 1) {
        let maxIdx = 0, maxLv = this.members[0].level;
        for (let idx = 1; idx < this.size(); idx++) {
            if (this.members[idx].level > maxLv) {
                maxIdx = idx;
                maxLv = this.members[idx].level;
            }
        }
        if (maxIdx > 0) {
            let tmp = this.members[0];
            this.members[0] = this.members[maxIdx];
            this.members[maxIdx] = tmp;
        }
    }
}

pro.delMember = function (uid) {
    let delIdx = -1, member = null;
    for (let i = 0; i < this.members.length; i++) {
        if (this.members[i].id === uid) {
            delIdx = i;
            member = this.members[i];
        }
    }
    if (delIdx >= 0) {
        this.members.splice(delIdx, 1);
        this.posList[member.pos] = 0;
        this._callMember(member, 'onLeaveTeam');
        delete this.stub.ids[uid];
        if (delIdx === 0) {  // 重新选队长
            this._electMaxLvCaptain();
        }
        this._refreshTeam();
        logger.info("Team %s delMember %s", this.id, uid);
    }
};

// 改变准备转态
pro.changeReadyState = function (uid) {
    for (let member of this.members) {
        if (member.id === uid) {
            member.ready ^= 1;
            this._callTeam('onTeamReadyStateChange', uid, member.ready);
            return;
        }
    }
};

// 开始匹配
pro.beginTeamMatch = function (cb) {
    let matchInfo = {
        matchNum: this.teamMaxNum,
        dgId: this.specialId,  // todo: 历史原因，匹配都用dgId标识好了
    };
    pomelo.app.rpc.match.matchRemote.matchTeam(
        null, this.teamType, this.id, this.members, matchInfo, function (code) {
            cb({code: code});
        });
};

pro.updateMatchPunishBeginTime = function (uid, pbt) {
    for (let member of this.members) {
        if (member.id === uid) {
            member.pbt = pbt;
            this._refreshTeam();
            return;
        }
    }
};

pro._refreshTeam = function () {
    this._callTeam('onRefreshTeam', this.id, this.teamType, this.specialId, this.members);
};

// 队内广播
pro._callTeam = function (funcName, ...args) {
    for (let member of this.members) {
        pomelo.app.rpc.connector.entryRemote[funcName].toServer(member.sid, member.id, ...args, null);
    }
};

pro._callMember = function (member, funcName, ...args) {
    pomelo.app.rpc.connector.entryRemote[funcName].toServer(member.sid, member.id, ...args, null);
};

pro.destroy = function () {
    for (let member of this.members) {
        this._callMember(member, 'onLeaveTeam');
        delete this.stub.ids[member.id];
    }
    delete this.stub.teams[this.id];
    this.stub = null;
    this.channel = null;
    pomelo.app.get('channelService').destroyChannel(this.id);
};
