// var Queue = require('pomelo-collection').queue;
var logger = require('pomelo-logger').getLogger(__filename);
var ActionType = require('../../consts/consts').ActionType;

/**
 * Action Manager, which is used to contrll all action
 */
var ActionManager = function(opts){
	this.actionMap = {};
	this.actionArray=[];
}; 

/**
 * Add action 
 * @param {Object} action  The action to add, the order will be preserved
 */
ActionManager.prototype.addAction = function(action){
	if(action.singleton) {
		this.abortAction(action.type, action.id);
	}
	var actions=this.actionMap[action.type];
	if (!actions) {
		actions={};
		this.actionMap[action.type]=actions;
	}
	actions[action.id] = action;
	this.actionArray.push(action);
	return true;
};

/**
 * abort an action, the action will be canceled and not excute
 * @param {String} type Given type of the action
 * @param {String} id The action id
 */
ActionManager.prototype.abortAction = function(type, id){
	var actions=this.actionMap[type];
	if(!actions || !actions[id]){
		return;
	}
	if(type===ActionType.MOVE){
		actions[id].stopMove();
	}
	actions[id].aborted = true;
	delete actions[id];
};

/**
 * Abort all action by given id, it will find all action type
 */
ActionManager.prototype.abortAllAction = function(id){
	var actionMap=this.actionMap;
	for(var type in actionMap){
		if(actionMap[type][id]) {
			actionMap[type][id].aborted = true;
			delete actionMap[type][id];
		}
	}
};

/**
 * Update all action
 * @api public
 */
ActionManager.prototype.update = function(currentTime){
	var action,actionArray=this.actionArray;
	var length=actionArray.length;
	for (var i = 0; i < length; i++) {
		action=actionArray.shift();
		if (!action || action.aborted) {
			continue;
		}
		action.update(currentTime);
		if(!action.finished){
			actionArray.push(action);
		}else{
			delete this.actionMap[action.type][action.id];
		}
	}
};	

module.exports = ActionManager;