var formula = module.exports;
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('./consts');
var dataApi = require('../util/dataApi');
var PlayerJob=consts.PlayerJob;

// formula.calDamage = function(attacker, target, skill) {
// 	var atk = attacker.getTotalAttack();
// 	var def = target.getTotalDefence();
// 	var mul = Math.sqrt(Math.abs(atk-def))/5 + 1;


// 	// (0.8/(Math.sqrt(Math.abs(atk-def))/5 + 1))*1/Math.pow((def+5)/5, 0.33)
	
// 	mul = atk>def?mul:0.8/mul;
// 	var defence = 1/Math.pow((def+5)/5, 0.33);
	
// 	var damage = Math.ceil(atk*defence*mul*(Math.random()*0.2 + 0.9));
// 	damage = Math.ceil(skill.getAttackParam() * damage);
// 	if (damage <= 0) {
// 		damage = 1;
// 	}
// 	if (damage > target.hp) {
// 		damage = target.hp;
// 		if(damage == 0){
// 			logger.error('attack a died mob!!! %j', target);
// 		}
		
// 	}
// 	return Math.round(damage);
// };

formula.calMobValue = function(baseValue, level, upgradeParam) {
	// baseValue = Number(baseValue);
	var value = Math.round(baseValue +  baseValue * (level - 1) * upgradeParam);
	return value;
};

/**
 * the experience gained by player when kill some mob
 */
formula.calMobExp = function(baseExp, playerLevel, mobLevel) {
	var diff = playerLevel - mobLevel;
	var mul = Math.pow(Math.abs(diff),1.5)/6 + 1;
	mul = diff < 0?mul:Math.pow(1/mul, 2);
	//Experienc add limit
	if(mul > 5){
		mul = 5;
	}
	var exp = Math.floor(baseExp * mobLevel * mul);
	if(exp < 1){
		exp = 1;
	}
	return exp;
};

formula.getPlayerJobId = function(kindId) {
	if (kindId === 10001) {
		return PlayerJob.MANJOB;
	}
	return PlayerJob.WOMANJOB;
};

formula.randomJobId=function(){
	if (Math.random()>0.5) {
		return consts.PlayerJob.MANJOB;
	}
	return consts.PlayerJob.WOMANJOB;
};

formula.taskItemToItem = function(taskItem,jobId) {
	var item = {
		kindId: taskItem[0],
		type: taskItem[1]
	};
	if (item.type === consts.EntityType.EQUIPMENT) {
		item.percent = 0;
		item.totalStar = 0;
		itemData = dataApi.equipment.findById(item.kindId);

		item.baseValue = itemData.baseValue;
		item.potential = itemData.potential;
		if (!jobId) {
			item.jobId = formula.randomJobId();
		}else{
			item.jobId = jobId;
		}
	}
	item.count = taskItem[2] || 1;
	return item;
};
/**
 * Check the distance between origin and target whether less than the range.
 *
 * @param origin {Object} origin entity
 * @param target {Object} target entity
 * @param range {Number} the range of distance
 */
formula.inRange = function(origin, target, range) {
  var dx = origin.x - target.x;
  var dy = origin.y - target.y;
  return dx * dx + dy * dy <= range * range;
};

formula.distance = function(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

formula.dropItemLv = function(mobLv, heroLv){
	var lv = Math.min(mobLv, heroLv);
	var maxLv = Math.min(25, (lv - 1));
	var limit = 4;
	var num = 3;
	var seed = Math.random()*limit;
	var dif = Math.floor(maxLv*Math.pow(num,seed)/Math.pow(num, limit));
	return lv - dif;
};

/**
 * convert the date according to format
 * @param {Object} date
 * @param {String} format
 * @param {String} 
 */
formula.timeFormat = function(date) {
	var n = date.getFullYear(); 
	var y = date.getMonth() + 1;
	var r = date.getDate(); 
	var mytime = date.toLocaleTimeString(); 
	var mytimes = n+ "-" + y + "-" + r + " " + mytime;
  return mytimes;
};

formula.timeToDayInt = function(timeStamp) {
	var myDate=new Date;
	if (timeStamp) {
		myDate.setTime(timeStamp);
	}
	return myDate.getDate()+myDate.getMonth()*100+myDate.getFullYear()*10000;
};

formula.createMob = function(kindId,level) {
	var mobData ={};
	// mobData.areaId = areaId;
	mobData.level = level;
	mobData.characterData=dataApi.character.findById(kindId);
	mobData.kindId = kindId;
	formula.refreshProperty(mobData);
	return mobData;
};

formula.refreshProperty = function(character) {
	var characterData = character.characterData;
	var ratio = (character.level - 1) * characterData.upgradeParam + 1;

	character.maxHp = Math.floor(ratio * characterData.hp);
	character.maxMp = Math.floor(ratio * characterData.mp);

	character.dodgeRate = Math.floor(ratio * characterData.dodgeRate);
	character.hitRate = Math.floor(ratio * characterData.hitRate);
	character.critValue = Math.floor(ratio * characterData.critValue);
	character.critResValue = Math.floor(ratio * characterData.critResValue);
	character.attackValue = Math.floor(ratio * characterData.attackValue);
	character.defenceValue = Math.floor(ratio * characterData.defenceValue);
	character.wreckValue = Math.floor(ratio * characterData.wreckValue);
};

formula.calItemPrice=function(bagItem){
	return bagItem.baseValue+Math.floor(bagItem.potential*bagItem.percent/100)+Math.floor(consts.recycleRatio*bagItem.potential*(100-bagItem.percent)/100);
};

formula.calItemBuild=function(item){
	return item.baseValue+Math.floor(item.potential*item.percent/100)+Math.floor(consts.recycleRatio*item.potential*(100-item.percent)/100);
};



