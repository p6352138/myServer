/**
 * Date: 2018/9/18
 * Author: liuguolai
 * Description:  好友组件
 */
let pomelo = require('pomelo');
let util = require('util');
let Component = _require('../component');
let consts = _require('../../public/consts');
let utils = require('../../util/utils');

const SHOT_KEY_DICT = {
    r: "relation",
};

let FriendComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(FriendComponent, Component);
module.exports = FriendComponent;

let pro = FriendComponent.prototype;

pro.init = function (opts) {
    this._bindEvent();
    this.friends = {};  // 好友信息
    this.invitedList = {};  // 邀请列表
};

pro._bindEvent = function () {
    this.entity.safeBindEvent("EventLogin", this._onLogin.bind(this));
    this.entity.safeBindEvent("EventLogout", this._onLogout.bind(this));
    this.entity.safeBindEvent("EventReconnect", this._onReconnect.bind(this));
};

pro._onReconnect = function (entity) {
    this.entity.sendMessage('onAllFriendsInfo', this.getClientInfo());
};

pro._onLogin = function (entity) {
    let self = this;
    self._callRemote(
        "login", {
            sid: pomelo.app.getServerId(),
            openid: self.entity.openid,
            name: self.entity.name,
            gender: self.entity.gender,
            avatarUrl: self.entity.avatarUrl,
            level: self.entity.level,
            rank: self.entity.ladder.rank,
            state: consts.UserState.ONLINE,
        }, function (info) {
            let friends = info["f"];
            for (let eid in friends) {
                self.friends[eid] = self._genFriendUnit(eid, friends[eid]);
            }
            self.invitedList = info["il"];
            self.entity.sendMessage('onAllFriendsInfo', self.getClientInfo());
        });
    this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.ONLINE, true);
};

pro._onLogout = function (entity) {
    this._callRemote("logout", null);
    this.entity.setWxUserStorage(consts.WxStorageKey.STATE, consts.UserState.OFFLINE);
};

pro.destroy = function () {
    Component.prototype.destroy.call(this);
};

pro._genFriendUnit = function (eid, data) {
    let res = {eid: eid};
    for (let key in data) {
        res[SHOT_KEY_DICT[key] || key] = data[key];
    }
    return res;
};

pro.getClientInfo = function () {
    let inviters = [];
    for (let eid in this.invitedList) {
        inviters.push(this.invitedList[eid]);
    }
    let friends = [];
    for (let eid in this.friends) {
        let info = this.friends[eid];
        friends.push(info);
    }
    return {
        friends: friends,
        invitedList: inviters,
    }
};

pro.updateProp = function (key, value) {
    this._callRemote("updateProp", key, value, null);
};

pro.isFriend = function (eid) {
    if (eid in this.friends) {
        if (this.friends[eid]["relation"] & consts.FriendRelation.FRIEND)
            return true;
    }
    return false;
};

// 远程调用接口
pro._callRemote = function (funcName, ...args) {
    pomelo.app.rpc.friend.friendRemote[funcName](null, this.entity.id, ...args);
};

// 请求加好友
pro.addFriend = function (eid, next) {
    this._callRemote("addFriend", eid, function (resp) {
        next(null, resp);
    });
};

// 新的好友请求
pro.onNewInviter = function (inviterInfo) {
    this.invitedList[inviterInfo.eid] = inviterInfo;
    this.entity.sendMessage('onAddInviter', inviterInfo);
};

// 忽略好友请求
pro.ignoreInviter = function (eid, next) {
    if (eid in this.invitedList) {
        delete this.invitedList[eid];
        this._callRemote("ignoreInviter", eid, null);
    }
    next(null, {code: consts.FriendCode.OK});
};

// 拒绝好友请求
pro.refuseInviter = function (eid, next) {
    if (eid in this.invitedList) {
        delete this.invitedList[eid];
        this._callRemote("refuseInviter", eid, this.entity.name, null);
    }
    next(null, {code: consts.FriendCode.OK});
};

// 好友请求被拒绝
pro.onAddFriendBeRefused = function (refuserName) {
    this.entity.sendMessage('onAddFriendBeRefused', {name: refuserName});
};

// 同意好友请求
pro.acceptFriend = function (eid, next) {
    if (this.isFriend(eid)) {
        next(null, {code: consts.FriendCode.FRIEND_ALREADY});
        return;
    }
    if (eid in this.invitedList) {
        delete this.invitedList[eid];
        this._callRemote("acceptFriend", eid, this.entity.name, function (resp) {
            next(null, resp);
        });
    }
    else {
        next(null, {code: consts.FriendCode.NO_INVITER});
    }
};

// 新好友
pro.onNewFriend = function (friendEid, newFriendInfo, fromName) {
    this.friends[friendEid] = this._genFriendUnit(friendEid, newFriendInfo);
    this.entity.sendMessage('onNewFriend', this.friends[friendEid]);
    // 如果有同意者名字，表示是我发出的请求
    if (fromName) {
        this.entity.sendMessage('onAcceptFriendNotify', {name: fromName});
    }
    if (friendEid in this.invitedList) {
        delete this.invitedList[friendEid];
    }
};

// 删除好友
pro.deleteFriend = function (eid, next) {
    if (!this.isFriend(eid)) {
        next(null, {code: consts.FriendCode.NOT_FRIEND});
        return;
    }
    this._callRemote("deleteFriend", eid, function (resp) {
        next(null, resp);
    });
};

// 删除好友通知
pro.onDeleteFriend = function (eid) {
    if (eid in this.friends) {
        let relation = this.friends[eid]["relation"];
        relation &= !consts.FriendRelation.FRIEND;
        if (!relation) {
            delete this.friends[eid];
        }
        else {
            this.friends[eid]["relation"] = relation;
        }
        this.entity.sendMessage('onDeleteFriend', {eid: eid});
    }
};

// 获取好友托管数据
pro.getFriendsManageInfo = function (next) {
    if (utils.isEmptyObject(this.friends)) {
        return next(null, {infos: []});
    }
    this._callRemote('getFriendsManageInfo', function (resp) {
        return next(null, {infos: resp});
    })
};

// 获取推荐好友
pro.getRecommendList = function (oppositeSex, next) {
    this._callRemote('getRecommendList', oppositeSex, function (resp) {
        return next(null, {res: resp});
    })
};
