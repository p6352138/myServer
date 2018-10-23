/**
 * Date: 2018/6/19
 * Author: liuguolai
 * Description: 负责component注册
 */
var LoggerComponent = _require('./entityComponent/loggerComponent');
var GMComponent = _require('./entityComponent/gmComponent');

var DungeonCtrl = _require('./avatarComponent/dungeonCtrl');
var HeroComponent = _require('./avatarComponent/heroComponent');
var MatchComponent = _require('./avatarComponent/matchComponent');
let FriendComponent = _require('./avatarComponent/friendComponent');
let TeamComponent = _require('./avatarComponent/teamComponent');
let LadderComponent = _require('./avatarComponent/ladderComponent');
let RaidComponent = _require('./avatarComponent/raidComponent');
let AvatarPropertyCtrl = _require('./avatarComponent/avatarPropertyCtrl');

var AIBehavior = _require('./combatUnitComponent/aiBehavior');
var BuffCtrl = _require('./combatUnitComponent/buffCtrl');
var CardCtrl = _require('./combatUnitComponent/cardCtrl');
var CombatCtrl = _require('./combatUnitComponent/combatCtrl');
var CombatUnitState = _require('./combatUnitComponent/combatUnitState');
var HatredComponent = _require('./combatUnitComponent/hatredComponent');
var PropertyCtrl = _require('./combatUnitComponent/propertyCtrl');
var SkillCtrl = _require('./combatUnitComponent/skillCtrl');

let summonsComponent = _require('./dungeonEntityComponent/summonsComponent');
let dpsComponent = _require('./dungeonEntityComponent/dpsComponent');

var componentClass = {
    logger: LoggerComponent,
    gm: GMComponent,

    dungeon: DungeonCtrl,
    hero: HeroComponent,
    match: MatchComponent,
    friend: FriendComponent,
    team: TeamComponent,
    ladder: LadderComponent,
    raid: RaidComponent,
    avatarProp: AvatarPropertyCtrl,

    AI: AIBehavior,
    buffCtrl: BuffCtrl,
    cardCtrl: CardCtrl,
    combat: CombatCtrl,
    state: CombatUnitState,
    hatred: HatredComponent,
    prop: PropertyCtrl,
    skillCtrl: SkillCtrl,

    summons: summonsComponent,
    dps: dpsComponent,
};

var componentRegister = module.exports;

componentRegister.getComponent = function (name) {
    return componentClass[name];
};
