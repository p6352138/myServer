/**
 * Date: 2018/9/29
 * Author: liuguolai
 * Description: 天梯系统
 */
let pomelo = require('pomelo');
let util = require('util');
let Component = _require('../component');
let consts = _require('../../public/consts');
let utils = _require('../../util/utils');
let rankTpl = _require('../../data/Rank');

let LadderComponent = function (entity) {
    Component.call(this, entity);
};

util.inherits(LadderComponent, Component);
module.exports = LadderComponent;

let pro = LadderComponent.prototype;

pro.init = function (opts) {
    this._initDbData(opts.ladder || {});

    this.checkSeason();
};

pro._initDbData = function (data) {
    this.seasonBeginTime = data.seasonBeginTime || new Date();  // 赛季开始时间
    this.singleLadderScore = data.singleLadderScore === undefined ? 1000 : data.singleLadderScore;  // 个人天梯分
    this.teamLadderScore = data.teamLadderScore === undefined ? 1000 : data.teamLadderScore;  // 组队天梯分
    this.rank = data.rank || 1; // 段位
    this.star = data.star || 0;  // 星数
};

pro.getPersistData = function () {
    return {
        singleLadderScore: this.singleLadderScore,
        teamLadderScore: this.teamLadderScore,
        rank: this.rank,
        star: this.star
    }
};

pro.getClientInfo = function () {
    return {
        rank: this.rank,
        star: this.star
    }
};

// 赛季检测
pro.checkSeason = function () {
    let dateNow = new Date(), dateSeason = new Date(this.seasonBeginTime);
    // 开启了新赛季
    if (dateNow.getFullYear() !== dateSeason.getFullYear() || dateNow.getMonth() !== dateSeason.getMonth()) {
        // todo: 结算上赛季的奖励
        this.rank = rankTpl[this.rank].getMonth;
        this.star = 1;  // 星星数统一为1
        this.entity.setWxUserStorage(consts.WxStorageKey.RANK, this.rank);
    }
};

pro.notifyLadderInfoToClient = function () {
    this.entity.sendMessage('onLadderInfoUpdate', {
        rank: this.rank,
        star: this.star
    })
};

pro.onLadderFightEnd = function (result, inTeam, deltaScore) {
    this.updateLadderScore(inTeam, deltaScore);
    if (result === consts.FightResult.WIN) {
        this.addStar();
    }
    else if (result === consts.FightResult.LOSE) {
        this.delStar();
    }
};

// 更新天梯分
pro.updateLadderScore = function (inTeam, deltaScore) {
    if (inTeam)
        this.teamLadderScore += deltaScore;
    else
        this.singleLadderScore += deltaScore;
};

pro.addStar = function () {
    this.star += 1;
    console.log(this.rank, rankTpl[this.rank]);
    if (this.star > rankTpl[this.rank].MaxStars) {
        // 进阶
        if (this.star < 1000) {
            this.rank += 1;
            this.star = 1;
            this.entity.setWxUserStorage(consts.WxStorageKey.RANK, this.rank);
        }
    }
    this.notifyLadderInfoToClient();
};

pro.delStar = function () {
    if (this.rank <= 1 && this.star <= 0)
        return;
    this.star -= 1;
    if (this.star < rankTpl[this.rank].MinStars) {
        // 掉阶
        this.rank -= 1;
        if (this.star < 0) {
            this.star = rankTpl[this.rank].MaxStars - 1;
        }
        this.entity.setWxUserStorage(consts.WxStorageKey.RANK, this.rank);
    }
    this.notifyLadderInfoToClient();
};
