/**
 * Date: 2018/7/12
 * Author: liuguolai
 * Description:
 */
var skillTpl = _require('../../data/Skill');
var consts = _require('../../public/consts');

var spawnSummoned = {}

var _getArea = function (area) {
    if (area === "random") {
        // return Math.floor(Math.random() * 3) + 1;
        return area;
    }
    return Number(area);
};

var _getSummonNumByType = function (numType, skill) {
    if (numType === "hit") {
        return skill.getHitNum();
    }
    else
        throw new Error(skill.id + " skill unknow spawnSummon type: " + numType);
};

spawnSummoned.entry = function (caster, skill, data, targets) {
    var sid = skill.sid;
    if (data.hasOwnProperty("team"))
        var team = data.team;
    else
        var team = skillTpl[sid][1].Target.team;
    var isEnemy = team === consts.Skill.TEAM_ENEMY ? true : false;
    var type = data.type;
    var area = _getArea(data.area);
    var num = 0;
    var numType = data.numType;
    if (numType)
        num = _getSummonNumByType(numType, skill);
    else
        num = data.num;
    caster.owner.summons.addSpawnSummon(caster.groupId, isEnemy, type, area, num);
};

module.exports = spawnSummoned;
