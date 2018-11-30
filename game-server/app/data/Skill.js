//
// Auto Generated Code
//

// Generate From skill.xlsx
module.exports = {
	10000: {
		ID: 10000,
		Name: '白衣渡江',
		SkillType: '1',
		dis: 5,
		Arm: [1],
		TargetType: 1,
		TargetNum: 2,
		Action: {"duration":2,"event":[{"event":"active","target":"skillTarget","action":"NoAttack"},{"event":"skillFinish","target":"targetAll","action":"SkillDamage","value":107,"rise":10.8,"condition":1}]},
		UseNum: 1,
		Durable: 300,
		probaillity: 100,
		describe: ''
	},
	10001: {
		ID: 10001,
		Name: '文涛武略',
		SkillType: '3',
		dis: 1,
		Arm: [1,2,3],
		TargetType: 3,
		TargetNum: 1,
		Action: {"duration":0,"event":[{"event":"begin","target":"skillTarget","action":"AddAttackIntelligence","value":12,"rise":1.3}]},
		UseNum: 1,
		Durable: 100,
		probaillity: 100,
		describe: ''
	},
	10002: {
		ID: 10002,
		Name: '将倾之柱',
		SkillType: '2',
		dis: 3,
		Arm: [3],
		TargetType: 1,
		TargetNum: 2,
		Action: {"event":[{"event":"begin","target":"targetAll","action":"SkillDamage","value":42.5,"rise":4.7,"condition":1},{"event":"ReadOver","target":"self","action":"ReduceASDamage","percent":24.5,"rise":2.7,"condition":3,"duration":2}]},
		UseNum: 1,
		Durable: 300,
		probaillity: 30,
		describe: ''
	},
	10003: {
		ID: 10003,
		Name: '玄武涡流',
		SkillType: '2',
		dis: 5,
		Arm: [1],
		TargetType: 1,
		TargetNum: 3,
		Action: {"read":1,"event":[{"event":"ReadOver","target":"targetAll","action":"SkillDamage","value":75,"rise":8.3,"condition":1},{"event":"ReadOver","target":"targetAll","buff":"timidity","duration":2}]},
		UseNum: 1,
		Durable: 300,
		probaillity: 30,
		describe: ''
	},
	10004: {
		ID: 10004,
		Name: '衣带密诏',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 200,
		probaillity: 0,
		describe: '衣带密诏：使友军单体的攻击属性提高9.4（受谋略属性影响），并使其进入休整状态，每回合恢复一定兵力（恢复率40%，受谋略属性影响），持续2回合'
	},
	10005: {
		ID: 10005,
		Name: '乱政',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '乱政：在本场战斗中，使敌方群体每回合都随机获得如下10个负面效果：动摇、恐慌、火攻、妖术、混乱、犹豫、暴走、怯战、挑衅、围困，每个效果独立判定，其中动摇、恐慌、火攻和妖术效果造成的伤害无视规避'
	},
	10006: {
		ID: 10006,
		Name: '金吾飞将',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '金吾飞将：对敌军单体发动一次猛攻（伤害率137.5%），并使其陷入混乱状态，持续2回合'
	},
	10007: {
		ID: 10007,
		Name: '胡笳离愁',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '胡笳离愁：恢复友军群体较多兵力（恢复率78.5%，受谋略属性影响），并使其进入休整状态，每回合再度恢复大量兵力（恢复率103%，受谋略属性影响），持续@1回合@'
	},
	10008: {
		ID: 10008,
		Name: '闭月',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '闭月：1回合准备，使敌军群体陷入暴走状态，进行无差别攻击，并使其防御属性降低14.5（受谋略属性影响），持续3回合'
	},
	10009: {
		ID: 10009,
		Name: '四世三公',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '四世三公：使友军全体进行攻击和策略攻击时的伤害提高9%，受到攻击和策略攻击时的伤害降低9%，持续2回合'
	},
	10010: {
		ID: 10010,
		Name: '将倾之柱',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '将倾之柱：对敌军群体发动一次策略攻击（伤害率42.5%，受谋略属性影响），使自身受到攻击与策略攻击的伤害下降24.5%（受防御属性影响）持续2回合'
	},
	10011: {
		ID: 10011,
		Name: '黄天当立',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '黄天当立：1回合准备，对敌军群体发动策略攻击（伤害率88%，受谋略属性影响），并使其陷入妖术诅咒，每回合损失一定兵力（伤害率48.5%，受谋略属性影响），持续2回合'
	},
	10012: {
		ID: 10012,
		Name: '逆谋',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '逆谋：使自身受到攻击与策略攻击的伤害降低7.8%（受防御属性影响），在战斗中进行攻击时，能够借此恢复相当于伤害值15%的兵力'
	},
	10013: {
		ID: 10013,
		Name: '天下无双',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '天下无双：使自身的攻击属性提高22.5，攻击距离+2，并进入洞察状态，免疫混乱、犹豫、怯战、暴走和挑衅效果，受到普通攻击后能进行反击（伤害率100%），并挑衅敌军全体使其攻击自身，持续2回合'
	},
	10014: {
		ID: 10014,
		Name: '算无遗策',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '算无遗策：使敌军群体的攻击与谋略属性降低11（受谋略属性影响），持续2回合，在此期间，每当目标试图发动主动战法时，将陷入妖术诅咒，损失一定兵力（伤害率70%，受谋略属性影响）'
	},
	10015: {
		ID: 10015,
		Name: '血溅黄砂',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '血溅黄砂：以无法发动主动战法为代价，使自身进行攻击时的伤害提高60%'
	},
	10016: {
		ID: 10016,
		Name: '洛水佳人',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '洛水佳人：本场战斗中，使我军群体每回合都有75%的机率恢复一定兵力（恢复率42.5%，受谋略属性影响）'
	},
	10017: {
		ID: 10017,
		Name: '皇裔流离',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '皇裔流离：本场战斗中，使我军全体受到伤害时，有50%的机率能恢复一定兵力（恢复率34%，受谋略属性影响）'
	},
	10018: {
		ID: 10018,
		Name: '诸葛锦囊',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '诸葛锦囊：使我军群体受到策略攻击时的伤害降低17.5%（受谋略属性影响），并使其进行攻击和策略攻击时的伤害提高7%（受谋略属性影响），持续2回合'
	},
	10019: {
		ID: 10019,
		Name: '红颜铁骑',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '红颜铁骑：使自身每回合可以进行两次普通攻击，并使攻击属性提高15'
	},
	10020: {
		ID: 10020,
		Name: '匠心不竭',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '匠心不竭：战斗开始后，使敌军全体从第1、3、5回合开始，逐渐陷入恐慌（伤害率17%，受谋略属性影响）、火攻（伤害率20.5%，受谋略属性影响）与妖术（伤害率22%，受谋略属性影响）的状态，持续直到战斗结束，所造成的伤害无视规避'
	},
	10021: {
		ID: 10021,
		Name: '银龙冲阵',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '银龙冲阵：对敌军单体发动一次攻击（伤害率80%），并使其受到攻击和策略攻击时的伤害提高12%（受攻击属性影响），持续1回合'
	},
	10022: {
		ID: 10022,
		Name: '长坂之吼',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '长坂之吼：2回合准备，对敌军群体发动一次无视兵种相克的猛烈攻击（伤害率225%）'
	},
	10023: {
		ID: 10023,
		Name: '魏武之世',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '魏武之世：在本场战斗中，使敌军全体攻击属性、防御属性、谋略属性、速度属性下降7.5%，并使我军全体攻击距离+1'
	},
	10024: {
		ID: 10024,
		Name: '驱虎吞狼',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '驱虎吞狼：对距离内敌方全军发动策略攻击（伤害率71.5%，受谋略属性影响），并使其无法恢复兵力，持续1回合'
	},
	10025: {
		ID: 10025,
		Name: '魏武之泽',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '魏武之泽：使自身和友军单体进行攻击时的伤害提高12.5%（受谋略属性影响），每回合可以进行两次普通攻击，持续1回合'
	},
	10026: {
		ID: 10026,
		Name: '千里单骑',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '千里单骑：普通攻击后，对攻击目标再次发动攻击（伤害率90%），并借此恢复一定兵力'
	},
	10027: {
		ID: 10027,
		Name: '其疾如风',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '其疾如风：战斗开始后前3回合，使我军群体速度属性提高20.5（受谋略属性影响），并使其每回合有35%的机率可以进行两次普通攻击'
	},
	10028: {
		ID: 10028,
		Name: '世仇',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '世仇：普通攻击后，对攻击目标再次发动策略攻击（伤害率116.5%，受谋略属性影响），并使其无法急救和休整以恢复兵力，持续2回合'
	},
	10029: {
		ID: 10029,
		Name: '强势',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '强势：使敌军群体进行攻击时的伤害降低16%（受谋略属性影响），并使其陷入犹豫状态，无法发动主动战法，持续2回合'
	},
	10030: {
		ID: 10030,
		Name: '九锡黄龙',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '九锡黄龙：移除我军群体有害效果，并使其防御属性提高14.5（受谋略属性影响），持续2回合，同时进入规避状态，免疫接下来受到的1次伤害'
	},
	10031: {
		ID: 10031,
		Name: '复誓业火',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '复誓业火：使敌军群体受到策略攻击时的伤害提高10%（受谋略属性影响），并使其陷入火攻状态，每回合损失一定兵力（伤害率66.5%，受谋略属性影响），持续2回合'
	},
	20001: {
		ID: 20001,
		Name: '神兵天降',
		SkillType: '1',
		dis: 4,
		Arm: [1,2,3],
		TargetType: 1,
		TargetNum: 2,
		Action: {"duration":3,"event":[{"event":"active","target":"skillTarget","action":"AddASDamage","percent":15,"rise":1.6,"condition":1}]},
		UseNum: 1,
		Durable: 300,
		probaillity: 100,
		describe: ''
	},
	20002: {
		ID: 20002,
		Name: '火辎',
		SkillType: '2',
		dis: 4,
		Arm: [1,2,3],
		TargetType: 1,
		TargetNum: 2,
		Action: {"read":1,"event":[{"event":"ReadOver","target":"targetAll","action":"SkillDamage","value":37.5,"rise":3.75,"condition":1},{"event":"ReadOver","target":"targetAll","buff":"fire","value":37.5,"rise":3.75,"condition":1,"duration":1}]},
		UseNum: 2,
		Durable: 100,
		probaillity: 50,
		describe: ''
	},
	20003: {
		ID: 20003,
		Name: '步步为营',
		SkillType: '3',
		dis: 1,
		Arm: [1,2,3],
		TargetType: 3,
		TargetNum: 1,
		Action: {"duration":0,"event":[{"event":"active","target":"skillTarget","action":"ReduceAllDamageOverlying","percent":4.5,"rise":0.5}]},
		UseNum: 1,
		Durable: 300,
		probaillity: 100,
		describe: ''
	},
	20004: {
		ID: 20004,
		Name: '不攻',
		SkillType: '1',
		dis: 1,
		Arm: [1,2,3],
		TargetType: 3,
		TargetNum: 1,
		Action: {"duration":0,"event":[{"event":"active","target":"skillTarget","action":"NoAttack"},{"event":"active","target":"skillTarget","action":"AddSDamage","percent":12.5,"rise":1.3},{"event":"active","target":"Target","action":"SkillDamage","value":41.5,"rise":4.6,"condition":1}]},
		UseNum: 1,
		Durable: 300,
		probaillity: 100,
		describe: ''
	},
	20005: {
		ID: 20005,
		Name: '坚守兵法',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 200,
		probaillity: 0,
		describe: '坚守兵法：使自身防御属性提高14（受谋略属性影响）'
	},
	20006: {
		ID: 20006,
		Name: '浑水摸鱼',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '浑水摸鱼：1回合准备，使敌军群体陷入混乱状态，持续2回合'
	},
	20007: {
		ID: 20007,
		Name: '愈战愈勇',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '愈战愈勇：战斗开始后，使自身进行攻击的伤害提高4%，此效果每回合叠加一次'
	},
	20008: {
		ID: 20008,
		Name: '妖术',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '妖术：1回合准备，使敌军群体陷入暴走状态，进行无差别攻击，持续2回合'
	},
	20009: {
		ID: 20009,
		Name: '大赏三军',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '大赏三军：战斗开始后前3回合，使我军群体进行攻击和策略攻击时的伤害提高15%（受谋略属性影响）'
	},
	20010: {
		ID: 20010,
		Name: '反计之策',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '反计之策：战斗开始后前3回合，使敌军群体发动主动战法时造成的伤害大幅下降，并在首回合有50%的机率使其陷入犹豫状态，无法发动主动战法'
	},
	20011: {
		ID: 20011,
		Name: '先驱突击',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '先驱突击：战斗开始后前2回合，使自身优先行动，每回合可进行两次普通攻击，并使攻击属性提高15'
	},
	20012: {
		ID: 20012,
		Name: '一骑当千',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '一骑当千：1回合准备，对敌军群体发动一次猛烈攻击（伤害率140%）'
	},
	20013: {
		ID: 20013,
		Name: '怯心夺志',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '怯心夺志：普通攻击后，对攻击目标再次发动猛攻（伤害率100%），并使其无法发动主动战法，持续1回合'
	},
	20014: {
		ID: 20014,
		Name: '深谋远虑',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '深谋远虑：战斗开始后，使自身进行策略攻击的伤害提高4.5%，此效果每回合叠加一次'
	},
	20015: {
		ID: 20015,
		Name: '远攻秘策',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '远攻秘策：使自身攻击属性提高10，谋略属性提高10，攻击距离+1，同时，使友军全体在战斗开始后前3回合也获得与自身同样的增益'
	},
	20016: {
		ID: 20016,
		Name: '无心恋战',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '无心恋战：战斗开始后前3回合，使敌军群体进行攻击和策略攻击时的伤害降低15%（受谋略属性影响）'
	},
	20017: {
		ID: 20017,
		Name: '避其锋芒',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '避其锋芒：战斗开始后前3回合，使我军群体受到攻击和策略攻击时的伤害降低15%（受谋略属性影响）'
	},
	20018: {
		ID: 20018,
		Name: '空城',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '空城：战斗开始后前2回合，受到伤害时有40%的机率使自身进入规避状态，可以免疫伤害'
	},
	20019: {
		ID: 20019,
		Name: '始计',
		SkillType: '',
		dis: 0,
		Arm: [],
		TargetType: 0,
		TargetNum: 0,
		Action: {},
		UseNum: 0,
		Durable: 0,
		probaillity: 0,
		describe: '始计：战斗前3回合，自身受到攻击伤害后，于本回合内进入洞察状态，免疫混乱、犹豫、怯战、暴走和挑衅效果，并在自身行动前，对有效距离4以内的敌军单体发动一次策略攻击（伤害率0%，受谋略属性影响）'
	},
};
