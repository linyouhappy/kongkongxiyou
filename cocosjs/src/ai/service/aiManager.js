require('src/ai/bt/bt.js');
require('src/ai/meta/blackboard.js');
require('src/ai/node/tryAndAdjust.js');
require('src/ai/node/brainNode.js');
require('src/ai/action/findNearbyPlayer.js');
require('src/ai/action/moveToTarget.js');
require('src/ai/action/patrol.js');
require('src/ai/action/tryAttack.js');
require('src/ai/action/tryPick.js');
require('src/ai/action/tryTalkToNpc.js');
require('src/ai/action/cancelAI.js');
require('src/ai/action/findTarget.js');
require('src/ai/action/chooseTarget.js');
require('src/ai/action/chooseSkill.js');
require('src/ai/action/continueAttack.js');
require('src/ai/action/continueMove.js');
require('src/ai/action/haveTarget.js');
require('src/ai/brain/player.js');

var AiManager = function(opts) {
	// this.brainService = opts.brainService;
	this.area = opts.area;
	// this.players = {};
	// this.mobs = {};
};

var pro = AiManager.prototype;
// pro.start = function() {
// 	this.started = true;
// };

// pro.stop = function() {
// 	this.started = false;
// };

/**
 * Add a character into ai manager.
 * Add a brain to the character if the type is mob.
 * Start the tick if it has not started yet.
 */
pro.setCharacter = function(character) {
	if(!character){
		this.playerBrain=null;
		return;
	}
	// if(!this.started) {
	// 	return;
	// }
	// if(this.players[character.entityId]) {
	// 	return;
	// }
	var blackBoard=new Blackboard({
				manager: this,
				area: this.area,
				curCharacter: character
			});
	var brain=new PlayerBrain(blackBoard);
	this.playerBrain=brain;
	// this.players[character.entityId] = brain;
};

/**
 * remove a character by id from ai manager
 */
// pro.removeCharacter = function(id) {
// 	if(!this.started || this.closed) {
// 		return;
// 	}

// 	delete this.players[id];
// 	// delete this.mobs[id];
// };

/**
 * Update all the managed characters.
 * Stop the tick if there is no ai mobs.
 */
pro.update = function() {
	if(this.playerBrain){
		this.playerBrain.update();
	}

// 	if(!this.started) {
// 		return;
// 	}
// 	for(var id in this.players) {
// //		if(typeof this.players[id].update === 'function') {
// 			this.players[id].update();
// //		}
// 	}
	// for(id in this.mobs) {
	// 	if(typeof this.mobs[id].update === 'function') {
	// 		this.mobs[id].update();
	// 	}
	// }
};

