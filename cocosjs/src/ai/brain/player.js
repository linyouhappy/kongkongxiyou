
var PlayerBrain = function(blackboard,brainType) {
	var pick = this.genPickAction(blackboard);
	var attack = this.genAttackAction(blackboard);
	var talkToNpc = this.genNpcAction(blackboard);

	var brainNode = new BrainNode({
		blackboard:blackboard,
		actions:[pick,attack,talkToNpc]
	});
	this.action = brainNode;
};

var pro = PlayerBrain.prototype;

pro.update = function() {
	return this.action.doAction();
};

pro.genAttackAction = function(blackboard){
	var attack = new TryAndAdjust({
		blackboard: blackboard, 
		adjustAction: new ContinueMove({
			blackboard: blackboard
		}), 
		tryAction: new TryAttack({
			blackboard: blackboard 
		})
	});

	return attack;
};

pro.genPickAction = function(blackboard) {
	//try pick and move to target action
	var pick = new TryAndAdjust({
		blackboard: blackboard, 
		adjustAction: new ContinueMove({
			blackboard: blackboard
		}), 
		tryAction: new TryPick({
			blackboard: blackboard 
		})
	});

	return pick;
};

pro.genNpcAction = function(blackboard) {
	//try talk and move to target action
	var pick = new TryAndAdjust({
		blackboard: blackboard, 
		adjustAction: new ContinueMove({
			blackboard: blackboard
		}), 
		tryAction: new TryTalkToNpc({
			blackboard: blackboard 
		})
	});
	
	return pick;
};
