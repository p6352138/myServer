//
// Auto Generated Code
//

// Generate From building.xlsx
module.exports = {
	1000: {
		ID: 1000,
		Name: 'Santo',
		Product: [5,5.5,6,6.5,7,7.5,8,8.5],
		Time: [5,30,300,3600,14400,36000,86400,108000],
		Enable: {"id":0},
		NameCN: '城主府'
	},
	1001: {
		ID: 1001,
		Name: 'Residential',
		Product: [150,300,450,600,750,900,1050,1200,1350,1500,1650,1800,1950,2100,2250,2400,2550,2700,2850,300],
		Time: [5,10,15,30,45,60,120,300,600,1200,2400,3600,7200,14400,28800,43200,64800,86400,108000,136800],
		Enable: {"id":1000,"lv":1},
		NameCN: '民居'
	},
	1002: {
		ID: 1002,
		Name: 'Champ',
		Product: [1,2,3,4,5],
		Time: [600,7200,28800,64800,108000],
		Enable: {"id":1000,"lv":1},
		NameCN: '校场'
	},
};
