/**
 * Date: 2018/7/26
 * Author: liuguolai
 * Description: 分身
 */
var fightHelper = _require('../../helper/fightHelper');

var monsterSummoned = {};

monsterSummoned.entry = function (caster, skill, data, targets) {
    var monsterID = data.monsterID;
    var num = data.num;
    var matrixType = data.matrixType;
    var time = data.time;
    var dungeonEnt = caster.owner;
    var emptyPoses = dungeonEnt.getEmptyPositions(caster.groupId);
    if (emptyPoses.length === 0)
        return;
    var poses = [];
    if (matrixType === "random") {
        if (emptyPoses.length <= num) {
            poses = emptyPoses;
        }
        else {
            fightHelper.shuffle(emptyPoses);
            poses = emptyPoses.slice(0, num);
        }
    }
    dungeonEnt.createShadowMonsters(caster, monsterID, poses, time, true);
};

module.exports = monsterSummoned;
