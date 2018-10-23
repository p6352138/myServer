/**
 * Date: 2018/7/6
 * Author: liuguolai
 * Description: 技能
 */
var skillTpl = _require('../data/Skill');
var ObjectId = _require('mongoose').Types.ObjectId;
var consts = _require('../public/consts');
var skillAction = _require('../combat/skillAction');
var fightHelper = _require('../helper/fightHelper');

var Skill = function (owner, sid, slv, tid) {
    this.id = ObjectId();
    this.owner = owner;
    this.sid = sid;
    this.slv = slv || 1;
    this.tid = tid;

    this.hitNum = 0;  // 击中次数，召唤用

    Object.defineProperty(this, 'entity', {
        get: function () {
            return this.owner.entity;
        }
    });

    this._data = skillTpl[sid];
    this._prepareTimer = null;
    this._effectTimer = null;

    this._targets = {};
    this._targetIds = {};
};

module.exports = Skill;

var pro = Skill.prototype;

pro.getEntsByTeam = function (team, filter) {
    if (team === consts.Skill.TEAM_FRIEND)
        return this.entity.getAllFriends(filter);
    else
        return this.entity.getAllEnemies(filter);
};

// 获取技能对象列表
pro.getTargets = function (targetConfig) {
    if (!targetConfig)
        return [];
    var type = targetConfig.type;
    var dungeonEnt = this.entity.owner;
    if (type === consts.Skill.TYPE_SINGLE) {
        var target = dungeonEnt.getMember(this.tid);
        return [target];
    }
    var team = targetConfig.team;
    var needDead = targetConfig.dead;
    var filter = needDead ? fightHelper.filterDead : fightHelper.filterAlive;
    var ents = this.getEntsByTeam(team, filter);
    if (ents.length === 0)
        return [];
    if (type === consts.Skill.TYPE_RANDOM) {
        var target = ents[Math.floor(Math.random() * ents.length)];
        return [target];
    }
    else if (type == consts.Skill.TYPE_All) {
        return ents;
    }
    else if (type === consts.Skill.TYPE_LOWHP) {
        var target = ents[0];
        var lowHp = target.hp;
        for (var i = 1; i < ents.length; i++) {
            var ent = ents[i];
            if (ent.hp < lowHp) {
                target = ent;
                lowHp = ent.hp;
            }
        }
        return [target];
    }
    else if (type === consts.Skill.TYPE_SELF) {
        return [this.entity];
    }
    else if (type === consts.Skill.TYPE_OUTSIDE_ITSELF) {
        var res = [];
        for (var ent of ents) {
            if (ent.id === this.entity.id)
                continue
            res.push(ent)
        }
        return res;
    }

    return [];
};

// 确定目标
pro._initTargets = function () {
    var idx = 1;
    while (true) {
        var config = this._data[idx];
        if (!config)
            break;
        var targets = this.getTargets(config.Target);
        this._targets[idx] = targets;
        this._targetIds[idx] = targets.map(function (tar) {
            return tar.id;
        })
        idx ++;
    }
};

pro._broadcastToClient = function () {
    var dungeonEnt = this.entity.owner;
    dungeonEnt.broadcast('onUseSkill', {
        caster: this.entity.id,
        sid: this.sid,
        slv: this.slv,
        targets: this._targetIds
    });
};

pro.entry = function () {
    // 起手确定目标
    this._initTargets();
    // to client
    this._broadcastToClient();
    var prepareTime = (this._data[1].Target.singing || 0) * 1000;
    prepareTime += this._data[1].CriticalTime;
    if (prepareTime > 0) {
        this._prepareTimer = setTimeout(this.tryDoEffect.bind(this), prepareTime);
        this.owner.setPrepareSkill(this);
        return;
    }
    // 不用准备，起手完毕
    this.tryDoEffect();
};

pro.tryDoEffect = function () {
    // 准备完毕，重置
    this.owner.setPrepareSkill(null);
    this._prepareTimer = null;
    var time = this._data[1].EffectiveTime;
    if (time > 0) {
        this._effectTimer = setTimeout(this.doEffect.bind(this), time);
        return;
    }
    // 直接结算
    this.doEffect();
};

pro.doEffect = function () {
    this._effectTimer = null;
    var caster = this.entity;
    for (var idx in this._targets) {
        var config = this._data[idx];
        var targets = this._targets[idx];
        var actions = config.Actions;
        let num = config.ActionCount || 1;  // 次数，少用
        for (let i = 0; i < num; i++) {
            for (var func in actions) {
                var action = skillAction.getAction(func);
                action.entry(caster, this, actions[func], targets.filter(fightHelper.filterNotDestroyed));
            }
        }
    }
    this.owner.removeSkill(this.id);
    // 技能生效
    caster.broadcast('onSkillEffective', {
        casterID: caster.id,
        sid: this.sid
    });
};

pro.destroy = function () {
    if (this._prepareTimer) {
        clearTimeout(this._prepareTimer);
        this._prepareTimer = null;
    }
    if (this._effectTimer) {
        clearTimeout(this._effectTimer);
        this._effectTimer = null;
    }
    this._targets = null;
    this._targetIds = null;
};

pro.getHitNum = function () {
    return this.hitNum;
};

pro.addHitNum = function () {
    this.hitNum ++;
};
