/**
 * Date: 2018/9/18
 * Author: liuguolai
 * Description: 好友管理
 */
let pomelo = require('pomelo');
let consts = _require('../public/consts');
let logger = _require('pomelo-logger').getLogger('game', 'friendStub');

const SAVE_DB_TIME = 20 * 1000;  // 存盘间隔

let FriendStub = function (opts) {
    opts = opts || {};
    this.db = pomelo.app.db.getModel('Friend');
    this.entryByEid = {};
    this.rankStatistics = {};  // 段位统计
    this.recommendExclude = {};  // 推荐过滤

    this.eidsWaitToUpdateDB = new Set();  // 待更新的eid集合
    this.saveDBTimer = setInterval(this._onSaveToDB.bind(this), SAVE_DB_TIME);
};

module.exports = FriendStub;
let pro = FriendStub.prototype;

pro._onSaveToDB = function () {
    if (this.eidsWaitToUpdateDB.size === 0)
        return;
    let entry;
    for (let eid of this.eidsWaitToUpdateDB) {
        entry = this.entryByEid[eid];
        this.db.update({_id: eid}, this._filterDBEntry(entry), {upsert: true}, function (err, raw) {
            if (err) {
                logger.error(eid + " save db error: " + err);
            }
        })
    }
    this.eidsWaitToUpdateDB.clear();
};

pro._filterDBEntry = function (entry) {
    return {
        _id: entry["eid"],
        openid: entry["openid"],
        sid: entry["sid"],
        name: entry["name"],
        gender: entry["gender"],
        avatarUrl: entry["avatarUrl"],
        rank: entry["rank"],
        state: entry["state"],
        logoutTime: entry["logoutTime"],
        level: entry["level"],
        friends: entry["friends"],
        il: entry["invitedList"],
    };
};

// 获取entry（动态查询数据库）
pro.getEntry = function (eid, create) {
    let self = this;
    return new Promise(function (resolve, reject) {
        let entry = self.entryByEid[eid];
        if (entry) {
            resolve(entry);
        }
        else {
            self.db.findById(eid, function (err, doc) {
                if (err) {
                    logger.error("db find eid friend info error: " + err);
                    return;
                }
                // 新用户
                let entry = null;
                if (!doc && create) {
                    entry = self._newEntry(eid);
                    self.eidsWaitToUpdateDB.add(eid);
                    self.entryByEid[eid] = entry;
                }
                else if (doc){
                    entry = self._newEntry(eid, doc);
                    self.entryByEid[eid] = entry;
                }
                resolve(entry);
            })
        }
    })
};

// 从db中加载entry
pro.loadEntriesFormDB = function (eids) {
    let self = this;
    return new Promise(function (resolve, reject) {
        self.db.find({_id: {$in: eids}}, function (err, docs) {
            if (err) {
                logger.error("loadEntriesFormDB error: " + err);
                return;
            }
            let res = [];
            for (let doc of docs) {
                let entry = self._newEntry(doc['_id'], doc);
                self.entryByEid[entry.eid] = entry;
                res.push(entry);
            }
            resolve(res);
        })
    })
};

pro._getClientInfoFromEntry = function (entry, relation) {
    return {
        r: relation,
        openid: entry["openid"],
        name: entry["name"],
        gender: entry["gender"],
        avatarUrl: entry["avatarUrl"],
    }
}

// 给客户端的数据
pro._getEntryClientInfo = async function (entry) {
    let friends = entry["friends"], ids = [];
    for (let id in friends) {
        ids.push(id);
    }
    let dbEids = [], entries = [];
    for (let id of ids) {
        if (!(id in this.entryByEid)) {
            dbEids.push(id);
        }
        else {
            entries.push(this.entryByEid[id]);
        }
    }
    if (dbEids.length > 0) {
        let dbEntries = await this.loadEntriesFormDB(dbEids);
        entries = entries.concat(dbEntries);
    }
    let f = {};
    for (let entry of entries) {
        f[entry.eid] = this._getClientInfoFromEntry(entry, friends[entry.eid].r);
    }
    return {
        f: f,
        il: entry["invitedList"]
    }
};

// 用户登入获取好友相关信息
pro.login = async function (eid, info, cb) {
    let self = this;
    let entry = await self.getEntry(eid, true);
    let bChanged = false;
    for (let key in info) {
        if (entry[key] !== info[key]) {
            entry[key] = info[key];
            bChanged = true;
        }
    }
    if (bChanged)
        this.eidsWaitToUpdateDB.add(eid);
    entry["online"] = 1;

    let statistics = this._getStatisticsByRank(entry.rank);
    statistics.add(eid);

    let clientInfo = await this._getEntryClientInfo(entry);
    cb(clientInfo);
};

// 用户登出
pro.logout = function (eid, cb) {
    let entry = this.entryByEid[eid];
    entry["online"] = 0;
    entry["logoutTime"] = new Date().getTime();
    this.eidsWaitToUpdateDB.add(eid);
    let statistics = this._getStatisticsByRank(entry.rank);
    statistics.delete(eid);
    delete this.recommendExclude[eid];
    cb();
};

pro._newEntry = function (eid, doc) {
    doc = doc || {};
    let friends = doc.friends || {};
    let invitedList = doc.il || {};
    if (doc.rank) {
        let statistics = this._getStatisticsByRank(doc.rank);
        statistics.delete(eid);
    }
    return {
        eid: eid,
        openid: doc.openid,
        level: doc.level,
        sid: doc.sid,
        rank: doc.rank,
        name: doc.name,
        gender: doc.gender,
        avatarUrl: doc.avatarUrl,
        state: doc.state,
        logoutTime: doc.logoutTime || 0,
        friends: friends,  // { "eid": { "r"(relation):  }}
        invitedList: invitedList
    }
};

pro._notifyToEntry = function (entry, route, ...args) {
    if (entry.online) {
        pomelo.app.rpc.connector.entryRemote[route].toServer(
            entry.sid, entry.eid, ...args, null
        );
    }
};

pro._checkCanAddFriend = function (fromEntry, toEntry) {
    if (!fromEntry || !toEntry) {
        return consts.FriendCode.ID_ERROR;
    }
    let fromEid = fromEntry.eid, toEid = toEntry.eid;
    let myRelationToOther = fromEntry["friends"][toEid];
    if (myRelationToOther) {
        let relation = myRelationToOther["r"];
        if (relation & consts.FriendRelation.FRIEND)
            return consts.FriendCode.FRIEND_ALREADY;
    }
    let otherInvitedList = toEntry["invitedList"];
    if (fromEid in otherInvitedList)
        return consts.FriendCode.INVITED_ALREADY;

    return consts.FriendCode.OK;
};

// 加好友
pro.addFriend = async function (fromEid, toEid, cb) {
    if (fromEid === toEid) {
        cb({code: consts.FriendCode.ID_ERROR});
        return;
    }
    let fromEntry = await this.getEntry(fromEid);
    let toEntry = await this.getEntry(toEid);
    let code = this._checkCanAddFriend(fromEntry, toEntry);
    if (code === consts.FriendCode.OK) {
        let inviterInfo = {
            eid: fromEid,
            openid: fromEntry.openid
        }
        toEntry.invitedList[fromEid] = inviterInfo;
        this.eidsWaitToUpdateDB.add(toEid);
        this._notifyToEntry(toEntry, 'onNewInviter', inviterInfo);
    }
    cb({code: code});
};

// 忽略好友邀请
pro.ignoreInviter = function (fromEid, toEid, cb) {
    let entry = this.entryByEid[fromEid];
    if (toEid in entry.invitedList) {
        delete entry.invitedList[toEid];
        this.eidsWaitToUpdateDB.add(fromEid);
    }
    cb();
};

// 拒绝好友请求
pro.refuseInviter = function (fromEid, toEid, fromName, cb) {
    let entry = this.entryByEid[fromEid];
    if (toEid in entry.invitedList) {
        delete entry.invitedList[toEid];
        this.eidsWaitToUpdateDB.add(fromEid);
        let toEntry = this.entryByEid[toEid];
        if (toEntry)
            this._notifyToEntry(toEntry, 'onAddFriendBeRefused', fromName);
    }
    cb();
};

pro._checkCanAcceptFriend = function (fromEntry, toEntry) {
    if (!fromEntry || !toEntry) {
        return consts.FriendCode.ID_ERROR;
    }
    let fromEid = fromEntry.eid, toEid = toEntry.eid;
    // 清请求项
    if (toEid in fromEntry.invitedList) {
        delete fromEntry.invitedList[toEid];
    }
    else {
        return consts.FriendCode.NO_INVITER;
    }

    let myRelationToOther = fromEntry["friends"][toEid];
    if (myRelationToOther) {
        let relation = myRelationToOther["r"];
        if (relation & consts.FriendRelation.FRIEND)
            return consts.FriendCode.FRIEND_ALREADY;
    }
    let otherRelationToMe = toEntry["friends"][fromEid];
    if (otherRelationToMe) {
        let relation = otherRelationToMe["r"];
        if (relation & consts.FriendRelation.FRIEND)
            return consts.FriendCode.FRIEND_ALREADY;
    }

    if (fromEid in toEntry.invitedList) {
        delete toEntry.invitedList[fromEid];
    }

    return consts.FriendCode.OK;
};

pro._addFriendRelation = function (entry, toEid, toOpenid) {
    if (toEid in entry["friends"] === false) {
        entry["friends"][toEid] = {};
    }
    let relation = entry["friends"][toEid]["r"] || 0;
    entry["friends"][toEid]["r"] = relation | consts.FriendRelation.FRIEND;
    entry["friends"][toEid]["openid"] = toOpenid;
    this.eidsWaitToUpdateDB.add(entry.eid);
};

// 同意好友请求
pro.acceptFriend = async function (fromEid, toEid, fromName, cb) {
    if (fromEid === toEid) {
        cb({code: consts.FriendCode.ID_ERROR});
        return;
    }
    let fromEntry = await this.getEntry(fromEid);
    let toEntry = await this.getEntry(toEid);
    let code = this._checkCanAcceptFriend(fromEntry, toEntry);
    if (code === consts.FriendCode.OK) {
        this._addFriendRelation(fromEntry, toEid, toEntry.openid);
        this._addFriendRelation(toEntry, fromEid, fromEntry.openid);
        this._notifyToEntry(fromEntry, 'onNewFriend', toEid, fromEntry["friends"][toEid], "");
        this._notifyToEntry(toEntry, 'onNewFriend', fromEid, toEntry["friends"][fromEid], fromName);
        logger.info("%s accept friend %s", fromEid, toEid);
    }
    cb({code: code});
};

pro._checkCanDeleteFriend = function (fromEntry, toEntry) {
    if (!fromEntry || !toEntry) {
        return consts.FriendCode.ID_ERROR;
    }
    let fromEid = fromEntry.eid, toEid = toEntry.eid;
    let myRelationToOther = fromEntry["friends"][toEid];
    if (!myRelationToOther)
        return consts.FriendCode.NOT_FRIEND;
    let relation = myRelationToOther["r"];
    if (!(relation & consts.FriendRelation.FRIEND))
        return consts.FriendCode.NOT_FRIEND;

    return consts.FriendCode.OK;
};

pro._removeFriendRelation = function (entry, toEid) {
    let relation = entry["friends"][toEid]["r"];
    let newRelation = relation & !consts.FriendRelation.FRIEND;
    if (!newRelation) {
        delete entry["friends"][toEid];
    }
    else {
        entry["friends"][toEid]["r"] = newRelation;
    }
    this.eidsWaitToUpdateDB.add(entry.eid);
    this._notifyToEntry(entry, 'onDeleteFriend', toEid);
};

// 删除好友
pro.deleteFriend = async function (fromEid, toEid, cb) {
    if (fromEid === toEid) {
        cb({code: consts.FriendCode.ID_ERROR});
        return;
    }
    let fromEntry = await this.getEntry(fromEid);
    let toEntry = await this.getEntry(toEid);
    let code = this._checkCanDeleteFriend(fromEntry, toEntry);
    if (code === consts.FriendCode.OK) {
        this._removeFriendRelation(fromEntry, toEid);
        this._removeFriendRelation(toEntry, fromEid);
        logger.info("%s delete friend %s", fromEid, toEid);
    }
    cb({code: code});
};

// 更新属性
pro.updateProp = async function (eid, key, value) {
    let entry = await this.getEntry(eid);
    if (!entry) {
        logger.error("updateProp can't find entry[%s] key[%s] value[%s]", eid, key, value);
        return;
    }
    // 段位更新，更新统计信息，用于好友推荐
    if (key === 'rank' && entry[key] !== value) {
        let statistics = this._getStatisticsByRank(entry[key]);
        statistics.delete(eid);
        statistics = this._getStatisticsByRank(value);
        statistics.add(eid);
    }
    entry[key] = value;
    this.eidsWaitToUpdateDB.add(eid);
};

pro._getManageInfo = function (entry) {
    if (!entry)
        return null;
    return {
        id: entry["eid"],
        rank: entry["rank"],
        state: entry["state"],
        level: entry["level"],
        logoutTime: entry["logoutTime"]
    }
};

// 获取好友的托管数据
pro.getFriendsManageInfo = async function (eid, cb) {
    let entry = await this.getEntry(eid);
    if (!entry) {
        logger.error("getFriendsManageInfo can't find entry[%s]", eid);
        cb([]);
        return;
    }
    let friends = entry.friends, ids = [];
    // TODO：先不做黑名单过滤，有了再说
    for (let id in friends) {
        ids.push(id);
    }
    let dbEids = [], entries = [];
    for (let id of ids) {
        if (!(id in this.entryByEid)) {
            dbEids.push(id);
        }
        else {
            entries.push(this.entryByEid[id]);
        }
    }
    if (dbEids.length > 0) {
        let dbEntries = await this.loadEntriesFormDB(dbEids);
        entries = entries.concat(dbEntries);
    }
    let res = [];
    for (let entry of entries) {
        res.push(this._getManageInfo(entry))
    }
    cb(res);
};

pro._getStatisticsByRank = function (rank) {
    if (!(rank in this.rankStatistics)) {
        this.rankStatistics[rank] = new Set();
    }
    return this.rankStatistics[rank];
};

pro._getRecommendExclude = function (eid) {
    if (!(eid in this.recommendExclude)) {
        this.recommendExclude[eid] = new Set();
    }
    return this.recommendExclude[eid];
};

pro._getEntryRecommendInfo = function (entry) {
    return {
        id: entry["eid"],
        rank: entry["rank"],
        state: entry["state"],
        level: entry["level"],
        logoutTime: entry["logoutTime"],
        openid: entry["openid"],
        name: entry["name"],
        gender: entry["gender"],
        avatarUrl: entry["avatarUrl"],
    }
};

// 获取推荐列表
pro.getRecommendList = async function (eid, oppositeSex, cb) {
    let entry = await this.getEntry(eid);
    let exclude = this._getRecommendExclude(eid);
    let rank = entry.rank, gender = entry.gender, friends = entry.friends, staticstics, tmpEntry;
    let res = [], num = 0;
    for (let curRank of [rank, rank + 1, rank - 1]) {
        if (curRank < 1 || curRank > 29)
            continue;
        staticstics = this._getStatisticsByRank(curRank);
        for (let id of staticstics) {
            if (id === eid)
                continue;
            if (id in friends)
                continue;
            if (exclude.has(id))
                continue;
            tmpEntry = this.entryByEid[id];
            if (!tmpEntry.online)
                continue;
            if (oppositeSex && gender === tmpEntry.gender)
                continue;
            res.push(this._getEntryRecommendInfo(tmpEntry));
            exclude.add(id);
            num += 1;
            if (num >= 4)
                break;
        }
        if (num >= 4)
            break;
    }
    cb(res);
};
