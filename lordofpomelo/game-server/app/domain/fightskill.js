/**
 * Module dependencies
 */
var util = require('util');
var dataApi = require('../util/dataApi');
var formula = require('../consts/formula');
var consts = require('../consts/consts');
var buff = require('./buff');
var Persistent = require('./persistent');
var logger = require('pomelo-logger').getLogger(__filename);
var AttackResult = consts.AttackResult;
var EntityType=consts.EntityType;
/**
 * Action of attack, attacker consume mp while target reduce.
 *
 * @param {Character} attacker
 * @param {Character} target
 * @param {Object} skill
 * @return {Object}
 * @api public
 */

var attack = function(attacker, target, skill) {
	var hitRatio = Math.max(Math.min(1.2 - 0.3 * target.totalDodgeRate / attacker.totalHitRate, 1), 0.2);
	if (Math.random() > hitRatio) {
		return AttackResult.MISS;
	}
	var critRatio = 1;
	if (attacker.totalCritValue >= target.totalCritResValue) {
		critRatio = Math.min(1, Math.sqrt(0.5 * attacker.totalCritValue / target.totalCritResValue - 0.323) - 0.1) / 2;
	} else {
		critRatio = (Math.sqrt(0.167 * Math.pow(attacker.totalCritValue / target.totalCritResValue, 3) + 0.01) - 0.1) / 2;
	}
	var critHurtRatio = 1;
	skill.isOccurCrit=false;
	if (Math.random() <= critRatio) {
		skill.isOccurCrit=true;
		critHurtRatio = 1.3 + critRatio * 5;
	}
	var atk = attacker.totalAttackValue;
	var def = target.totalDefenceValue;
	// var def = Math.pow(target.totalDefenceValue,2)/attacker.totalWreckValue;
	var mul = Math.sqrt(Math.abs(atk-def))/5 + 1;
	mul = atk>def?mul:0.8/mul;
	var defence = 1/Math.pow((def+5)/5, 0.33);
	var damage = Math.ceil(atk*defence*mul*(Math.random()*0.2 + 0.9));
	damage = Math.ceil(skill.skillRatio * damage*critHurtRatio);	
	
	// var damageValue = 0;
 //    if(target.type===EntityType.PLAYER){
 //    	damageValue=attacker.totalAttackValue*attacker.totalWreckValue/(attacker.totalAttackValue+attacker.totalWreckValue+target.totalDefenceValue);
 //    }else{
 //        damageValue=0.05*Math.min(20,Math.max(20+attacker.level-target.level,4))*attacker.totalAttackValue*attacker.totalWreckValue/(attacker.totalAttackValue+attacker.totalWreckValue+target.totalDefenceValue);;
 //    }
    // damageValue=Math.ceil(skill.skillRatio*damageValue*critHurtRatio);
    skill.damageValue=damage;
	return AttackResult.SUCCESS;
};

/**
 * Add buff to Character, attacker or target
 */
var addBuff = function(attacker, target, buff) {
	if (buff.target === 'attacker' && !attacker.died) {
		buff.use(attacker);
	} else if (buff.target === 'target' && !target.died) {
		buff.use(target);
	}
	return {
		result: AttackResult.SUCCESS
	};
};

/**
 * Initialize a new 'FightSkill' with the given 'opts'.
 *
 * @param {Object} opts
 * @api public
 *
 */
var FightSkill = function(opts) {
	Persistent.call(this, opts);
	this.skillId = opts.skillId;
	// this.level = opts.level;
	this.playerId = opts.playerId;
	this.position = opts.position;

	var skillData=opts.skillData;
	this.distance=skillData.distance;
	this.sqrtDistance=skillData.distance*skillData.distance;
	this.mp=skillData.mp;
	this.cooltime=skillData.cooltime;
	this.multiAttack=skillData.multiAttack;
	this.playerLevel=skillData.playerLevel;
	this.skillData=skillData;
	this.coolDownTime = 0;

	this.setLevel(opts.level);
};

util.inherits(FightSkill, Persistent);

FightSkill.prototype.setLevel=function(level){
	this.level = level;
	this.skillRatio = this.skillData.attackParam + (this.level - 1) * this.skillData.upgradeParam;
};

/**
 * Check out fightskill for attacker.
 *
 * @param {Character} attacker
 * @param {Character} target
 * @return {Object}  NOT_IN_RANGE, NOT_COOLDOWN, NO_ENOUGH_MP
 */
FightSkill.prototype.judge = function(attacker) {
	if (this.coolDownTime > Date.now()) {
		return AttackResult.NOT_COOLDOWN;
	}
	if (attacker.mp < this.mp) {
		return AttackResult.NO_ENOUGH_MP;
	}
	return AttackResult.SUCCESS;
};

FightSkill.prototype.strip = function() {
	return {
		skillId: this.skillId,
		position: this.position,
		level: this.level
	};
};

//Get upgradePlayerLevel
// FightSkill.prototype.getUpgradePlayerLevel = function() {
// 	var upgradePlayerLevel = this.skillData.upgradePlayerLevel;
// 	return (this.level - 1) * upgradePlayerLevel + this.skillData.playerLevel;
// };

//Get attackParam
// FightSkill.prototype.getAttackParam = function() {
// 	var value = this.skillData.attackParam + (this.level - 1) * this.skillData.upgradeParam;
// 	return value;
// };

var AttackSkill = function(opts) {
	FightSkill.call(this, opts);
};
util.inherits(AttackSkill, FightSkill);

// Attack
// AttackSkill.prototype.use = function(attacker, target) {
// 	var judgeResult = this.judge(attacker, target);
// 	if (judgeResult.result !== AttackResult.SUCCESS) {
// 		return judgeResult;
// 	}
// 	return attack(attacker, target, this);
// };

AttackSkill.prototype.inRange = function(attacker, target) {
	var dx = attacker.x - target.x;
	var dy = attacker.y - target.y;
	return dx * dx + dy * dy <= this.sqrtDistance;
};

AttackSkill.prototype.use = function(attacker, target) {
	// var judgeResult = this.judge(attacker, target);

	// if (!formula.inRange(attacker, target, this.distance)) {
	// 	return AttackResult.NOT_IN_RANGE;
	// }
	// if (judgeResult !== AttackResult.SUCCESS) {
	// 	return judgeResult;
	// }
	return attack(attacker, target, this);
};

var BuffSkill = function(opts) {
	FightSkill.call(this, opts);
	this.buff = opts.buff;
};

util.inherits(BuffSkill, FightSkill);

BuffSkill.prototype.use = function(attacker, target) {
	return addBuff(attacker, target, this.buff);
};

// both attack and buff
var AttackBuffSkill = function(opts) {
	FightSkill.call(this, opts);
	this.attackParam = opts.attackParam;
	this.buff = opts.buff;
};
util.inherits(AttackBuffSkill, FightSkill);

AttackBuffSkill.prototype.use = function(attacker, target) {
	var attackResult = attack(attacker, target, this);
	return attackResult;
};

// like BuffSkill, excep init on startup, and timeout is 0
var PassiveSkill = function(opts) {
	BuffSkill.call(this, opts);
};

util.inherits(PassiveSkill, BuffSkill);

var CommonAttackSkill = function(opts) {
	AttackSkill.call(this, opts);
};

util.inherits(CommonAttackSkill, AttackSkill);

/**
 * Create skill
 *
 * @param {Object}
 * @api public
 */
var create = function(skill) {
	//var curBuff = buff.create(skill);
	//skill.buff = curBuff;

	skill.skillData = dataApi.fightskill.findById(skill.skillId);
	skill.type = skill.skillData.type;
	if (skill.type === consts.SkillType.ATTACK) {
		return new AttackSkill(skill);
	} else if (skill.type === consts.SkillType.BUFF) {
		return new BuffSkill(skill);
	} else if (skill.type === consts.SkillType.ATTACKBUFF) {
		return new AttackBuffSkill(skill);
	} else if (skill.type === consts.SkillType.PASSIVE) {
		return new PassiveSkill(skill);
	}
	throw new Error('error skill type in create skill: ' + skill);
};

// SkillType:{
//     ATTACK:1,
//     BUFF:2,
//     ATTACKBUFF:3,
//     PASSIVE:4
//   },

module.exports.create = create;
module.exports.FightSkill = FightSkill;
module.exports.AttackSkill = AttackSkill;
module.exports.BuffSkill = BuffSkill;
module.exports.PassiveSkill = PassiveSkill;
module.exports.AttackBuffSkill = AttackBuffSkill;