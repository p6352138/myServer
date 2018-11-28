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
		probaillity: 100
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
		probaillity: 100
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
		probaillity: 30
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
		probaillity: 30
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
		probaillity: 100
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
		probaillity: 50
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
		probaillity: 100
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
		probaillity: 100
	},
};
