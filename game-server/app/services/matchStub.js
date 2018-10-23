/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description: 负责匹配
 */
var pomelo = require('pomelo');
var consts = _require('../public/consts');
var logger = _require('pomelo-logger').getLogger('game', 'matchStub');
let utils = _require('../util/utils');
let matchHelper = _require('../helper/matchHelper');
let rankTpl = _require('../data/Rank');

// 管理匹配成功后的确认
let PreMatchEntity = function (stub, dgId, teamA, teamB) {
    this.stub = stub;
    this.dgId = dgId;
    // teamA、teamB是队列里的信息
    this.teamA = teamA || [];
    this.teamB = teamB || [];

    this.init();
};

PreMatchEntity.prototype.init = function () {
    this._notifyShowMatchConfirm();
    // 30秒倒计时
    this.timer = setTimeout(this._onTimeOut.bind(this), 30 * 1000);
};

// 通知进入匹配成功确认界面
PreMatchEntity.prototype._notifyShowMatchConfirm = function () {
    let memList = [], sids = [], infoList = this.teamA.concat(this.teamB);
    let timeNow = new Date().getTime();
    // 记录需要确认的id
    this.needConfirmIds = new Set();
    for (let info of infoList) {
        let teamId = info.teamId;
        if (teamId) {  // 组队
            let teamMems = this.stub.teamInfo[teamId];
            for (let member of teamMems) {
                memList.push({
                    id: member.id,
                    openid: member.openid
                });
                sids.push(member.sid);
                this.needConfirmIds.add(member.id);
                this.stub.uid2PreMatchEnt[member.id] = this;
                this.stub.updateMatchTime(member.id, timeNow);
            }
        }
        else {  // 个人
            let uid = info.uid;
            let ent = this.stub.info[uid];
            memList.push({
                id: uid,
                openid: ent.openid,
            });
            sids.push(ent.sid);
            this.needConfirmIds.add(uid);
            this.stub.uid2PreMatchEnt[uid] = this;
            this.stub.updateMatchTime(uid, timeNow);
        }
    }
    this.sids = sids, this.memList = memList;
    for (let i = 0; i < memList.length; i++) {
        pomelo.app.rpc.connector.entryRemote.onEnterMatchConfirm.toServer(sids[i], memList[i].id, memList, null);
    }
};

// 超时
PreMatchEntity.prototype._onTimeOut = function () {
    this.checkAndEnd();
};

// 确认
PreMatchEntity.prototype.confirm = function (uid) {
    if (this.needConfirmIds.has(uid)) {
        this.needConfirmIds.delete(uid);
        // 广播通知
        for (let i = 0; i < this.memList.length; i++) {
            pomelo.app.rpc.connector.entryRemote.onMatchConfirm.toServer(
                this.sids[i], this.memList[i].id, uid, null);
        }
        // 全部确认
        if (this.needConfirmIds.size === 0) {
            this.checkAndEnd();
        }
        return true;
    }
    return false;
};

PreMatchEntity.prototype.checkAndEnd = function () {
    clearTimeout(this.timer);
    if (this.needConfirmIds.size === 0) {
        // 进入战斗
        this._enterDungeon();
    }
    else {
        // 全部确认的队伍重新回到匹配，没确认的进行惩罚
        this.rematchAndPunish();
    }
    for (let i = 0; i < this.memList.length; i++) {
        let id = this.memList[i].id;
        delete this.stub.uid2PreMatchEnt[id];
    }
    this.stub = null;
    this.teamA = null;
    this.teamB = null;
    this.needConfirmIds = null;
    this.memList = null;
    this.sids = null;
};

PreMatchEntity.prototype.rematchAndPunish = function () {
    let excludeids = new Set(), punishBeginTime = new Date().getTime(), toRemove = new Set();
    for (let uid of this.needConfirmIds) {
        let ent = this.stub.info[uid];
        // 惩罚
        pomelo.app.rpc.connector.entryRemote.onMatchNoConfirmPunish.toServer(
            ent.sid, ent.id, punishBeginTime, null);
        let teamId = ent.teamId;
        let checkId = teamId ? teamId : ent.id;
        if (!excludeids.has(checkId)) {
            excludeids.add(checkId);
            if (teamId) {
                // 队伍所有人返回组队界面
                let teamMems = this.stub.teamInfo[teamId];
                for (let member of teamMems) {
                    pomelo.app.rpc.connector.entryRemote.onMatchNoConfirm.toServer(
                        member.sid, member.id, null);
                    toRemove.add(member.id);
                }
                delete this.stub.teamInfo[teamId];
            }
            else {
                pomelo.app.rpc.connector.entryRemote.onMatchNoConfirm.toServer(
                    ent.sid, ent.id, null);
                toRemove.add(ent.id);
            }
        }
    }
    for (let id of toRemove) {
        delete this.stub.info[id];
    }
    // 确认了的回到匹配界面
    let infoList = this.teamA.concat(this.teamB);
    for (let info of infoList) {
        let teamId = info.teamId;
        let checkId = teamId ? teamId : info.uid;
        if (excludeids.has(checkId))
            continue;
        if (this.stub.isPVP) {
            this.stub.actualMatchPVP(info, this.dgId);
        }
        else {
            this.stub.actualMatchPVE(teamId, this.dgId);
        }
    }
};

PreMatchEntity.prototype._enterDungeon = function () {
    let teamA = this.teamA, teamB = this.teamB, uidsA = [], uidsB = [];
    for (let info of teamA) {
        let teamId = info.teamId;
        if (teamId) {  // 组队
            let teamMems = this.stub.teamInfo[teamId];
            uidsA = uidsA.concat(teamMems.map((member) => member.id));
            delete this.stub.teamInfo[teamId];
        }
        else {  // 个人
            uidsA.push(info.uid);
        }
    }
    for (let info of teamB) {
        let teamId = info.teamId;
        if (teamId) {  // 组队
            let teamMems = this.stub.teamInfo[teamId];
            uidsB = uidsB.concat(teamMems.map((member) => member.id));
            delete this.stub.teamInfo[teamId];
        }
        else {  // 个人
            uidsB.push(info.uid);
        }
    }
    if (this.stub.isPVP) {
        let teamAInfo = {}, teamBInfo = {};
        for (let uid of uidsA) {
            teamAInfo[uid] = this.stub.getUidInfo(uid);
            delete this.stub.info[uid];
        }
        for (let uid of uidsB) {
            teamBInfo[uid] = this.stub.getUidInfo(uid);
            delete this.stub.info[uid];
        }
        console.log(teamAInfo, teamBInfo);
        this.stub.notifyNewFight(this.dgId, teamAInfo, teamBInfo);
    }
    else {
        let teamAInfo = [];
        for (let uid of uidsA) {
            teamAInfo.push(this.stub.getUidInfo(uid));
            delete this.stub.info[uid];
        }
        console.log(teamAInfo);
        this.stub.notifyNewFight(this.dgId, teamAInfo);
    }
};

/* ************************************************************ */

var MatchStub = function (opts) {
    opts = opts || {};
    this.teamType = opts.teamType;
    if (this.teamType === consts.Team.TYPE_LADDER) {
        this.matchType = consts.MatchType.PVP;
        // 匹配时间，保留5个最近的
        this.matchTime = {};
        this.predictMatchTime = {};
        for (let i = 1; i <= 7; i++) {
            this.matchTime[i] = [];
            this.predictMatchTime[i] = 10;
        }
    }
    else if (this.teamType === consts.Team.TYPE_PRACTICE) {
        this.matchType = consts.MatchType.PVP;
        this.matchTime = [];
        this.predictMatchTime = 10;
    }
    else if (this.teamType === consts.Team.TYPE_RAID) {
        this.matchType = consts.MatchType.PVE;
        this.matchTime = [];
        this.predictMatchTime = 10;
    }
    this.matchNum = opts.matchNum;  // 战斗人数
    if (this.matchType === consts.MatchType.PVP) {
        this.isPVP = true;
    }
    else {
        this.isPVP = false;
    }
    this.queue = {};
    this.info = {};

    this.fightServerIds = pomelo.app.get("fightIdsMap")[this.matchType][this.matchNum];
    if (!this.fightServerIds) {
        logger.warn("matchType[%s] matchNum[%s] without servers", this.matchType, this.matchNum);
        this.fightServerIds = [];
    }
    this.serverNum = this.fightServerIds.length;
    this.curServerIdx = 0;

    this.teamInfo = {};
    this.uid2PreMatchEnt = {};

    // 10分钟刷新预计匹配时间
    setInterval(this._refreshPredictMatchTime.bind(this), 10 * 60 * 1000);
};

module.exports = MatchStub;
var pro = MatchStub.prototype;

// 刷新预计时间
pro._refreshPredictMatchTime = function () {
    if (this.teamType === consts.Team.TYPE_LADDER) {
        for (let rankType in this.matchTime) {
            let matchTimeList = this.matchTime[rankType];
            let len = matchTimeList.length;
            if (len === 0)
                continue;
            let totalTime = 0, cnt = 0;
            for (let i = len - 1; i >= 0; i--) {
                totalTime += matchTimeList[i];
                cnt += 1;
                if (cnt >= 5)
                    break;
            }
            this.predictMatchTime[rankType] = Math.floor(totalTime / cnt / 1000);
        }
    }
    else if (this.teamType === consts.Team.TYPE_PRACTICE) {
        let len = this.matchTime.length;
        if (len === 0)
            return;
        let totalTime = 0, cnt = 0;
        for (let i = len - 1; i >= 0; i--) {
            totalTime += this.matchTime[i];
            cnt += 1;
            if (cnt >= 5)
                break;
        }
        this.predictMatchTime = Math.floor(totalTime / cnt / 1000);
    }
};

// 实时更新匹配时间队列
pro.updateMatchTime = function (uid, timeNow) {
    let ent = this.info[uid];
    let time = timeNow - ent.beginTime;
    if (this.teamType === consts.Team.TYPE_LADDER) {
        // 段位
        let rankType = rankTpl[ent.rank].Type;
        let matchTimeList = this.matchTime[rankType];
        matchTimeList.push(time);
        if (matchTimeList.length > 10000) {
            matchTimeList.splice(0, matchTimeList.length - 10);
        }
    }
    else if (this.teamType === consts.Team.TYPE_PRACTICE || this.teamType === consts.Team.TYPE_RAID) {
        this.matchTime.push(time);
        if (this.matchTime.length > 10000) {
            this.matchTime.splice(0, this.matchTime.length - 10);
        }
    }
};

// 获取预计匹配时间
pro._getPredictMatchTime = function (rank) {
    if (this.teamType === consts.Team.TYPE_LADDER) {
        let rankType = rankTpl[rank].Type;
        return this.predictMatchTime[rankType];
    }
    else if (this.teamType === consts.Team.TYPE_PRACTICE) {
        return this.predictMatchTime;
    }
    else if (this.teamType === consts.Team.TYPE_RAID) {
        return this.predictMatchTime;
    }
};

pro.getUidInfo = function (uid) {
    let ent = this.info[uid];
    let inTeam, score;
    if (ent.teamId) {
        inTeam = 1;
        score = ent.tls;
    }
    else {
        inTeam = 0;
        score = ent.sls;
    }
    return {
        id: uid,
        openid: ent.openid,
        sid: ent.sid,
        dgId: ent.dgId,
        name: ent.name,
        inTeam: inTeam,
        score: score
    }
};

// 在剩余队列中检测剩余数量
pro._checkQueueLeftNum = function (dgId, leftNum, maxNum) {
    if (leftNum <= 0)
        return true;
    let dgId2queues = this.queue[dgId];
    for (let i = Math.min(leftNum, maxNum); i > 0; i--) {
        let queue = dgId2queues[i];
        if (!queue || queue.length === 0)
            continue;
        if (queue.length * i >= leftNum) {
            leftNum %= i;
        }
        else {
            leftNum -= queue.length * i;
        }
        if (leftNum === 0)
            return true;
        return this._checkQueueLeftNum(dgId, leftNum, i - 1);
    }
    return false;
};

// 匹配开启战斗
pro.checkMatchPVE = function (dgId) {
    if (this._checkQueueLeftNum(dgId, this.matchNum, this.matchNum) === false)
        return;
    let dgId2queues = this.queue[dgId], leftNum = this.matchNum, uids = [], teamA = [];
    for (let i = this.matchNum; i > 0; i--) {
        if (i > leftNum)
            continue;
        let queue = dgId2queues[i];
        if (!queue || queue.length === 0)
            continue;
        // 全都是组队
        while (queue.length > 0) {
            let teamId = queue.shift();
            teamA.push({teamId: teamId});
            // let teamMems = this.teamInfo[teamId];
            // uids = uids.concat(teamMems.map((member) => member.id));
            // delete this.teamInfo[teamId];
            leftNum -= i;
            if (leftNum < i)
                break;
        }
        if (leftNum === 0)
            break;
    }
    teamA.sort(function (a, b) {
        let lenA = this.teamInfo[a.teamId].length;
        let lenB = this.teamInfo[b.teamId].length;
        return lenB - lenA;
    }.bind(this))
    new PreMatchEntity(this, dgId, teamA, []);
    // let battleInfo = {};
    // for (let uid of uids) {
    //     battleInfo[uid] = this.getUidInfo(uid);
    //     delete this.info[uid];
    // }
    // this.notifyNewFight(dgId, battleInfo);
};

pro.notifyNewFight = function (dgId, teamA, teamB) {
    var teamB = teamB || {};
    // 简单的循环处理，TODO： 更实时的负载均衡
    var server = this.fightServerIds[this.curServerIdx % this.serverNum];
    this.curServerIdx++;
    if (this.teamType === consts.Team.TYPE_RAID) {
        pomelo.app.rpc.fight.fightRemote.newTeamRaid.toServer(server, dgId, teamA, null);
    }
    else {
        pomelo.app.rpc.fight.fightRemote.newFight.toServer(server, this.teamType, dgId, teamA, teamB, {}, null);
    }
};

pro._getQueue = function (dgId, teamNum) {
    if (!this.isPVP) {
        if (!this.queue.hasOwnProperty(dgId)) {
            this.queue[dgId] = {};
        }
        if (!(teamNum in this.queue[dgId])) {
            this.queue[dgId][teamNum] = [];
        }
        return this.queue[dgId][teamNum];
    }
    if (!this.queue.hasOwnProperty(dgId)) {
        this.queue[dgId] = [];
    }
    return this.queue[dgId];
};

// 单人匹配
pro.match = function (matchInfo, dgId) {
    let uid = matchInfo.id;
    if (uid in this.info)
        return consts.MatchCode.IN_QUEUE;
    matchInfo.dgId = dgId
    matchInfo.beginTime = new Date().getTime();
    this.info[uid] = matchInfo;
    let queueInfo = {
        teamId: null,
        uid: uid,
        score: matchInfo.sls,
        memNum: 1,
        idx: -1,
    }
    this.actualMatchPVP(queueInfo, dgId);

    return consts.MatchCode.OK;
};

// 取消匹配
pro.unmatch = function (uid) {
    if (uid in this.uid2PreMatchEnt) {
        return;
    }
    if (uid in this.info) {
        let memInfo = this.info[uid];
        let dgId = memInfo.dgId;
        // 组队匹配
        let teamId = memInfo.teamId;
        if (teamId) {
            let teamMems = this.teamInfo[teamId];
            let queue = this._getQueue(dgId);
            let idx = -1;
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].teamId === teamId) {
                    idx = i;
                    break;
                }
            }
            if (idx >= 0)
                queue.splice(idx, 1);
            else
                logger.error("unmatch can't find team in queue. teamId[%s] uid[%s]", teamId, uid);
            for (let member of teamMems) {
                pomelo.app.rpc.connector.entryRemote.onUnmatch.toServer(
                    member.sid, member.id, {by: uid}, null
                );
                delete this.info[member.id];
            }
            delete this.teamInfo[teamId];
        }
        else {
            let queue = this._getQueue(dgId);
            let idx = -1;
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].uid === uid) {
                    idx = i;
                    break;
                }
            }
            if (idx >= 0)
                queue.splice(idx, 1);
            else
                logger.error("unmatch can't find uid in queue. teamId[%s]", teamId, uid);
            pomelo.app.rpc.connector.entryRemote.onUnmatch.toServer(
                memInfo.sid, memInfo.id, {by: uid}, null
            );
            delete this.info[uid];
        }
    }
};

pro._canMatchTeam = function (teamMems) {
    if (teamMems.length > this.matchNum)
        return false;
    for (var member of teamMems) {
        if (member.id in this.info)
            return false;
    }
    return true;
};

// 组队匹配
pro.matchTeam = function (teamId, teamMembers, matchInfo) {
    if (this.isPVP) {
        this.matchTeamPVP(teamId, teamMembers, matchInfo);
    }
    else {
        this.matchTeamPVE(teamId, teamMembers, matchInfo);
    }
};

// PVE组队匹配
pro.matchTeamPVE = function(teamId, teamMembers, matchInfo) {
    if (!this._canMatchTeam(teamMembers))
        return consts.Code.FAIL;
    let dgId = matchInfo.dgId || 0;
    let timeNow = new Date().getTime();
    for (let member of teamMembers) {
        member.dgId = dgId;
        member.teamId = teamId;
        member.beginTime = timeNow;
        this.info[member.id] = member;
    }
    this.teamInfo[teamId] = teamMembers;
    this.actualMatchPVE(teamId, dgId);
};

pro.actualMatchPVE = function (teamId, dgId) {
    let teamMembers = this.teamInfo[teamId];
    let queue = this._getQueue(dgId, teamMembers.length);
    queue.push(teamId);

    let matchInfo = {
        matchNum: this.matchNum,
        teamType: this.teamType,
        success: 0,
        predictTime: this._getPredictMatchTime()
    }
    // 通知客户端匹配
    for (let member of teamMembers) {
        pomelo.app.rpc.connector.entryRemote.onMatchBegin.toServer(member.sid, member.id, matchInfo, null);
    }
    this.checkMatchPVE(dgId);
};

// PVP组队匹配
pro.matchTeamPVP = function (teamId, teamMembers, matchInfo) {
    if (!this._canMatchTeam(teamMembers))
        return consts.Code.FAIL;
    let dgId = matchInfo.dgId || 0, teamScore = 0;
    let timeNow = new Date().getTime();
    for (let member of teamMembers) {
        member.dgId = dgId;
        member.teamId = teamId;
        member.beginTime = timeNow;
        this.info[member.id] = member;
        teamScore += member.tls;
    }
    this.teamInfo[teamId] = teamMembers;
    let memNum = teamMembers.length, score;
    if (memNum === 1) {
        score = teamMembers[0].sls;
    }
    else {
        score = Math.floor(teamScore / memNum);
    }
    let info = {
        teamId: teamId,
        uid: null,
        score: score,
        memNum: memNum,
        idx: -1,
    }
    this.actualMatchPVP(info, dgId);
};

pro.actualMatchPVP = function (info, dgId) {
    let bMatchSucceed = this._doMatchPVP(info, dgId);
    let matchInfo = {
        matchNum: this.matchNum,
        teamType: this.teamType,
        success: bMatchSucceed ? 1 : 0,
    }
    // 匹配不成功，进入了队列
    let teamId = info.teamId;
    if (teamId) {
        let teamMems = this.teamInfo[teamId];
        let predictMatchTime = this._getPredictMatchTime(teamMems[0].rank);
        matchInfo["predictTime"] = predictMatchTime;
        // 通知客户端匹配
        for (let member of teamMems) {
            pomelo.app.rpc.connector.entryRemote.onMatchBegin.toServer(member.sid, member.id, matchInfo, null);
        }
    }
    else {
        let ent = this.info[info.uid];
        let predictMatchTime = this._getPredictMatchTime(ent.rank);
        matchInfo["predictTime"] = predictMatchTime;
        // 通知客户端匹配
        pomelo.app.rpc.connector.entryRemote.onMatchBegin.toServer(ent.sid, ent.id, matchInfo, null);
    }
};

pro._doMatchPVP = function (info, dgId) {
    let queue = this._getQueue(dgId);
    let score = info.score, teamNum = queue.length, idx = teamNum - 1;
    for (let i = 0; i < teamNum; i++) {
        if (queue[i].score > score) {
            idx = i;
            break;
        }
    }
    let leftIdx = idx - 1, rightIdx = idx;
    let leftInfo, rightInfo;
    let minMaxScope = 100;  // 最大最小分差
    let results = [], totalNums = 0;
    // results中队伍人数对应的队伍数
    let resultsTeamCnts = {
        1: 0, 2: 0, 3: 0, 4: 0
    }
    while (leftIdx >= 0) {
        leftInfo = queue[leftIdx];
        if (score - leftInfo.score <= minMaxScope) {
            leftInfo.idx = leftIdx
            results.push(leftInfo);
            totalNums += leftInfo.memNum;
            leftIdx--;
            resultsTeamCnts[leftInfo.memNum] += 1;
        }
        else {
            break;
        }
    }
    while (rightIdx >= 0 && rightIdx < teamNum) {
        rightInfo = queue[rightIdx];
        if (rightInfo.score - score <= minMaxScope) {
            rightInfo.idx = rightIdx;
            results.push(rightInfo);
            totalNums += rightInfo.memNum;
            rightIdx++;
            resultsTeamCnts[rightInfo.memNum] += 1;
        }
        else {
            break;
        }
    }

    if (totalNums + info.memNum < this.matchNum * 2) {
        // 加入队列
        queue.splice(idx, 0, info);
        return false;
    }
    // 按分数接近排序
    results.sort(function (a, b) {
        // return Math.abs(a.score - score) - Math.abs(b.score - score);
        return a.score - b.score;
    });

    // 简单粗暴，直接分类讨论
    let teamResult = this._getNearestTeamCombination(results, resultsTeamCnts, info);
    // 成功匹配
    if (teamResult) {
        // 从队列移除
        let idxList = [], teamA = teamResult[0], teamB = teamResult[1];
        for (let info of teamA) {
            idxList.push(info.idx);
        }
        for (let info of teamB) {
            idxList.push(info.idx);
        }
        idxList.sort(function (a, b) {
            return b - a;
        })
        for (let idx of idxList) {
            if (idx >= 0)
                queue.splice(idx, 1);
        }
        // 进入匹配成功确认
        new PreMatchEntity(this, dgId, teamA, teamB);
        return true;
    }
    else {
        // 加入队列
        queue.splice(idx, 0, info);
        return false;
    }
};

pro._getResult = function (results, originNeeds, score, middleIdx) {
    let minMaxScope = 100;  // 最大最小分差
    let result = [], len = results.length;
    let minScore = score, maxScore = score, leftIdx = middleIdx - 1, rightIdx = middleIdx, leftInfo, rightInfo, curInfo;
    let needs = {};  // 拷贝orginNeeds
    for (let k in originNeeds) {
        needs[k] = originNeeds[k];
    }
    while (true) {
        leftInfo = null;
        rightInfo = null;
        while (leftIdx >= 0) {
            curInfo = results[leftIdx--];
            if (curInfo.memNum in needs) {
                leftInfo = curInfo;
                break;
            }
        }
        while (rightIdx >= 0 && rightIdx < len) {
            curInfo = results[rightIdx++];
            if (curInfo.memNum in needs) {
                rightInfo = curInfo;
                break;
            }
        }
        if (leftInfo && rightInfo) {
            if (minScore - leftInfo.score < rightInfo.score - maxScore) {
                curInfo = leftInfo;
                rightIdx--;
                minScore = leftInfo.score;
            }
            else {
                curInfo = rightInfo;
                leftIdx++;
                maxScore = rightInfo.score;
            }
        }
        else if (leftInfo) {
            curInfo = leftInfo;
            minScore = leftInfo.score;
        }
        else if (rightInfo) {
            curInfo = rightInfo;
            maxScore = rightInfo.score;
        }
        else {
            throw new Error('match error.' + needs);
        }
        // 判断最大最小分差
        if (maxScore - minScore > minMaxScope)
            return null;
        result.push(curInfo);
        let memNum = curInfo.memNum;
        needs[memNum] -= 1;
        if (needs[memNum] <= 0)
            delete needs[memNum];
        if (utils.isEmptyObject(needs))
            break;
    }
    return result;
};

// 以最优的方式分成两队
pro._tryDepart2Team = function (result, info) {
    let score = info.score;
    result.push(info);
    // 按人数和分数排序
    result.sort(function (a, b) {
        if (a.memNum === b.memNum) {
            return Math.abs(a.score - score) - Math.abs(b.score - score);
        }
        else {
            return b.memNum - a.memNum;
        }
    })
    let teamA = [], teamB = [], bLeft = true, leftNum = 0, rightNum = 0;
    for (let curInfo of result) {
        if (bLeft) {
            if (leftNum + curInfo.memNum <= this.matchNum) {
                teamA.push(curInfo)
                leftNum += curInfo.memNum;
                bLeft = false;
            }
            else {
                teamB.push(curInfo);
                rightNum += curInfo.memNum;
                bLeft = true;
            }
        }
        else {
            if (rightNum + curInfo.memNum <= this.matchNum) {
                teamB.push(curInfo);
                rightNum += curInfo.memNum;
                bLeft = true;
            }
            else {
                teamA.push(curInfo);
                leftNum += curInfo.memNum;
                bLeft = false;
            }
        }
    }
    return [teamA, teamB];
};

// 获取最优的队伍组合
pro._getNearestTeamCombination = function (results, resultsTeamCnts, info) {
    let score = info.score;
    let mustNum = info.memNum;
    for (var idx = 0; idx < results.length; idx++) {
        if (results[idx].score > score)
            break;
    }
    let tryList = matchHelper.PVPMatchNumToNeeds[mustNum], canTry;
    for (let needs of tryList) {
        canTry = true;
        // 先检查数量够不够
        for (let k in needs) {
            if (needs[k] > resultsTeamCnts[k]) {
                canTry = false;
                break;
            }
        }
        if (canTry) {
            // 获取最优组合
            let result = this._getResult(results, needs, score, idx);
            if (result) {
                // 分成2队
                return this._tryDepart2Team(result, info);
            }
        }
    }
    return null;
};

pro.matchConfirm = function (uid) {
    let preMatchEnt = this.uid2PreMatchEnt[uid];
    if (!preMatchEnt)
        return false;
    return preMatchEnt.confirm(uid);
};
