/**
 * Module dependencies
 */
var util = require('util');
var myBossDao = require('../dao/myBossDao');
var formula = require('../consts/formula');
var dataApi = require('../util/dataApi');

/**
 * MyBoss object, it is saved in database
 *
 * @param {Object} opts
 * @api public
 */
var MyBoss = function(opts) {
	this.id = opts.id;

	this.times1 = opts.times1;
	this.times2 = opts.times2;
	this.times3 = opts.times3;
	this.times4 = opts.times4;
	this.times5 = opts.times5;
};

for (var i=1;i<=5;i++) {
	var myBossData=dataApi.myboss.findById(i);
	MyBoss[myBossData.areaId]=myBossData.id;
}

module.exports = MyBoss;

MyBoss.prototype.strip = function() {
	var data = {
		times:Math.floor(Date.now()/1000),
		times1: this.times1,
		times2: this.times2,
		times3: this.times3,
		times4: this.times4,
		times5: this.times5
	};
	return data;
};


// MyBoss.prototype.checkDate=function(){
// 	var dayInt=formula.timeToDayInt();
// 	if (dayInt>this.recordTime) {
// 		this.recordTime=dayInt;
// 		// var myBossData=dataApi.myboss.findById(1);
// 		this.times1 = 2;
// 		this.times2 = 2;
// 		this.times3 = 2;
// 		this.times4 = 2;
// 		this.times5 = 2;
// 		this.save();
// 	}
// };

// MyBoss.prototype.strip = function() {
// 	var data = {
// 		times1: this.times1,
// 		times2: this.times2,
// 		times3: this.times3,
// 		times4: this.times4,
// 		times5: this.times5
// 	};
// 	return data;
// };

MyBoss.prototype.save = function() {
	myBossDao.update(this);
};

