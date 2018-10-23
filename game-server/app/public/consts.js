/**
 * Date: 2018/6/11
 * Author: liuguolai
 * Description: 常量文件
 */
module.exports = {
    ENABLE_GM: true,

    Code: {
        OK: 1,
        FAIL: 0
    },

    Login: {
        OK: 200,
        RELAY: 201,
        FAIL: 500
    },

    CheckInResult: {
        SUCCESS: 0,  // 成功
        ALREADY_ONLINE: 1,  // 已经在线
    },

    // 匹配类型
    MatchType: {
        PVE: "PVE",
        PVP: "PVP",
    },

    // 匹配错误码
    MatchCode: {
        OK: 1,
        IN_QUEUE: 2,
        IN_PUNISH: 3,  //  惩罚时间中
    },

    Match: {
        MAX_NUM: 4,  // 匹配最大人数
        PUNISH_TIME: 60,  // 惩罚时间
    },

    // 选择英雄错误码
    SelectHeroCode: {
        OK: 1,
        BE_SELECEED: 2,  // 已被选
        NOT_EXIST: 3,  // 没有该英雄
        ALREADY_CONFIRMED: 4  // 已经确认了
    },

    // 战斗常量
    Fight: {
        CARDS_IN_HAND_MAX: 8,  // 手牌上限
        MP_MAX: 10,  // 灵力上限
    },

    // 战斗错误码
    FightCode: {
        OK: 1,
        PLAY_CARD_INFO_ERR: -1,  // 卡牌信息错误
        MP_NOT_ENOUGH: -2,  // 灵力不足
        THEW_NOT_ENOUGH: -3,  // 体力不足
        ALREADY_DEAD: -4,  // 已经死亡
        USE_LIMIT: -5,  // 使用限制
        // 技能
        SKILL_NOT_FOUND: -10,  // 技能不存在
        SKILL_TARGET_ERR: -11,  // 对象错误
        SKILL_IN_PREPARE: -12,  // 吟唱和抬手准备中
    },

    // 卡牌属性定义
    CardAttri: {
        NORMAL_CARD: 1,  // 非消耗
        CONSUME_CARD: 2, // 消耗卡牌
        PERMANENT_CONSUME_CARD: 3,  // 永久消耗卡牌
        INHERENT_CARD: 4,  // 固有
    },

    // 技能常量
    Skill: {
        TYPE_All: "all",  // 全体目标
        TYPE_RANDOM: "random",  // 随机目标
        TYPE_SINGLE: "single",  // 单体
        TYPE_SELF:  "self",  // 自身
        TYPE_LOWHP: "lowHP",  // 血量最低
        TYPE_OUTSIDE_ITSELF: "outsideItself",  // 除自身外的其他单位

        TEAM_FRIEND: 0,  // 友方
        TEAM_ENEMY: 1,  // 敌方
    },

    // buff
    Buff: {
        BUFF_PERMANENT: -1,  // 永久buff的endTime
    },

    // 牌堆
    PileType: {
        CARDS: 1,  // 抽牌堆
        DISCARDS: 2,  // 弃牌堆
        EXHAUSTS: 3,  // 消耗牌堆

        MAX: 3
    },

    // 对象状态
    State: {
        ALIVE: 1,  // 存活
        DIE: 2,  // 死亡
    },

    // 战斗结果
    FightResult: {
        WIN: 1,  // 胜
        LOSE: 2,  // 负
        DRAW: 3  // 平
    },

    // 副本状态
    DungeonStatus: {
        END: 1,  // 已经完结
        IN_SELECT_HERO: 2,  // 选角中
        IN_BEFORE_LOAD_CD: 3,  // 加载前倒计时
        IN_LOAD: 4,  // 加载中
        IN_FIGHT: 5,  // 战斗中
    },

    // 好友关系（按位运算）
    FriendRelation: {
        FRIEND: 0x01,  // 好友
        BLACK: 0x02,  // 黑名单
    },

    // 好友相关错误码
    FriendCode: {
        OK: 1,
        ID_ERROR: 2,  // ID错误
        FRIEND_ALREADY: 3,  // 已经是好友
        INVITED_ALREADY: 4,  // 已经邀请了
        NO_INVITER: 5,  // 申请者不存在
        NOT_FRIEND: 6,  // 不是好友
    },

    // 用户状态
    UserState: {
        ONLINE: 101,  // 在线
        OFFLINE: 102,  // 离线
        TEAM: 103,  // 组队
        PLAYING: 104,  // 游戏中
    },

    // 微信托管数据key
    WxStorageKey: {
        STATE: "state",  // 状态
        RANK: "rank",  // 段位
        LEVEL: "level",  // 等级
    },

    // 队伍
    Team: {
        TYPE_LADDER: "LADDER",  // 天梯队伍
        TYPE_PRACTICE: "PRACTICE",  // 练习队伍
        TYPE_RAID: "RAID",  // 副本队伍

        MAX_NUM: 4,
        LADDER_NEED_LV: 0,  // 天梯需要等级
        PRACTICE_NEED_LV: 0,  // 练习需要等级
        HERO_NEED_NUM: 0,  // 需要英雄数量
    },

    // 队伍错误码
    TeamCode: {
        OK: 1,
        TYPE_ERR: 2,  // 类型错误
        IN_TEAM: 3,  // 队伍中
        NOT_IN_TEAM: 4,  // 不在队伍中（队伍解散）
        TEAM_FULL: 5, // 人满了
        IN_MY_TEAM: 6,  // 已经在自己的队伍中
        PLAYING: 7,  // 游戏中
        LEVEL_LIMIT: 8,  // 等级限制
        RAND_LIMIT: 9,  // 段位限制
        HERO_NUM_LIMIT: 10,  // 英雄数量限制
        TEAM_NOT_EXIST: 11,  // 队伍不存在
        MEMBER_NOT_EXIST: 12,  // 没有该成员
        NOT_CAPTAIN: 13,  // 不是队长
        READY_OFF_ALREADY: 14,  // 已经取消准备
        READY_ON_ALREADY: 15,  // 已经准备
        CAPTAIN_LIMIT: 16,  // 队长限制（例如准备）
        NOT_READY: 17,  // 没有准备
        MATCHING: 18,  // 匹配中
        IN_PUNISH: 19,  // 超时惩罚中
    },

    // 副本
    Raid: {
        STATE_SELECT: 1,  // 选择状态
        STATE_START: 2,  // 开始状态
        STATE_GET_CARD: 3,  // 获取卡牌状态
        STATE_FINISH: 4,  // 结束状态

        STATE_TEAM_SELECT_HERO: 1,  // 组队副本选英雄
        STATE_TEAM_SELECT_ROOM: 2,  // 组队副本选择关卡
        STATE_TEAM_IN_ROOM: 3,  // 在关卡中
        STATE_TEAM_GET_CARD: 4,  // 获取卡牌

        TYPE_DUNGEON: "dungeon",  // 副本
        TYPE_SHOP: "shop",  // 商店
        TYPE_AWARD: "award",  // 奖励
    },

    // 副本错误码
    RaidCode: {
        OK: 1,
        NOT_SINGLE_RAID: 2,  // 非单人副本
        HAD_SELECTED: 3,  // 已经选择
        LEVEL_LIMIT: 4,  // 等级不足
    }
}