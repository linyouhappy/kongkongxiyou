/**
 * Module dependencies
 */
var util = require('util');
var playerBankDao = require('../dao/playerBankDao');

/**
 * PlayerBank object, it is saved in database
 *
 * @param {Object} opts
 * @api public
 */
var PlayerBank = function(opts) {
	this.id = opts.id;
	this.playerId = opts.playerId;
	this.inCaoCoin = opts.inCaoCoin || 0;
  	this.outCaoCoin = opts.outCaoCoin || 0;
  	this.caoCoin = opts.caoCoin || 0;

  	this.maskId=1;
};

module.exports = PlayerBank;

PlayerBank.prototype.strip=function(){
	var data={
		maskId:this.maskId,
		// inCaoCoin:this.inCaoCoin,
		// outCaoCoin:this.outCaoCoin,
		caoCoin:this.caoCoin
	};
	var tmpValue = this.marketItemsStrip();
    if (tmpValue) {
      data.marketItems = tmpValue;
    }
    var tmpValue = this.buyItemsStrip();
    if (tmpValue) {
      data.buyItems = tmpValue;
    }
    var tmpValue = this.sellItemsStrip();
    if (tmpValue) {
      data.sellItems = tmpValue;
    }
	return data;
};

PlayerBank.prototype.marketItemsStrip=function(){
	if (!this.marketItems) {
		return null;
	}

	var marketItems=[];
	var marketItem;
	for (var key in this.marketItems) {
		marketItem=this.marketItems[key];
		marketItems.push({
			kindId:marketItem.kindId,
			count:marketItem.count
		});
	}
	return marketItems;
}

PlayerBank.prototype.buyItemsStrip=function(){
	if (!this.buyItems) {
		return null;
	}
	var buyItems=[];
	var buyItem;
	for (var key in this.buyItems) {
		buyItem=this.buyItems[key];
		buyItems.push({
			id:buyItem.id,
			kindId:buyItem.kindId,
			price:buyItem.price,
			count:buyItem.buyCount
		});
	}
	return buyItems;
}

PlayerBank.prototype.sellItemsStrip=function(){
	if (!this.sellItems) {
		return null;
	}

	var sellItems=[];
	var sellItem;
	for (var key in this.sellItems) {
		sellItem=this.sellItems[key];
		sellItems.push({
			id:sellItem.id,
			kindId:sellItem.kindId,
			price:sellItem.price,
			count:sellItem.count
		});
	}
	return sellItems;
}

PlayerBank.prototype.save = function(cb) {
	if (this.isDirty) {
		this.isDirty=false;
		this.maskId++;
		playerBankDao.update(this,cb);
	}
};

