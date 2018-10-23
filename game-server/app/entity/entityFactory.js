/**
 * Date: 2018/6/13
 * Author: liuguolai
 * Description:
 */
var Avatar = _require("./avatar")
var DungeonEntity = _require('./dungeonEntity');
var Player = _require('./player');
var Monster = _require('./monster');
let TeamRaidEntity = _require('./teamRaidEntity');

var entityClasses = {
    Avatar: Avatar,
    DungeonEntity: DungeonEntity,
    Player: Player,
    Monster: Monster,
    TeamRaidEntity: TeamRaidEntity
}

var entityFactory = module.exports;

entityFactory.createEntity = function (entityType, entityid, entitycontent) {
    entitycontent = entitycontent || {}
    if (entityid)
        entitycontent["_id"] = entityid;
    var entityCreator = entityClasses[entityType];
    return new entityCreator(entitycontent);
};
