chat.MailMessage = chat.BaseMessage.extend({
    ctor: function() {
        this.eventList = {};
        this.m_blockLists = [];
    },

    parse:function(mail){
    	this.mailId=mail.id;
    	this.items=mail.items;

		if (this.items) {
			var item,itemData;
			for (var i = 0; i < this.items.length; i++) {
				item = this.items[i];
				if (item.type === EntityType.ITEM) {
					item.itemData = dataApi.item.findById(item.kindId);
				} else if (item.type === EntityType.EQUIPMENT) {
					item.kind = item.count;
					itemData = dataApi.equipment.findById(item.kindId);
					item.baseValue = itemData.baseValue;
					item.potential = itemData.potential;
					item.itemData = itemData;
					item.totalStar=0;
					item.percent=0;
					item.jobId=app.getCurPlayer().jobId
				} else {
					cc.log("ERROR:addItem item type is invalid. item:" + JSON.stringify(item));
				}
			}
		}

        this.channelId=chat.channel.Area;
        this.parseBroadcast(mail);
        delete this["eventList"];

        var newBlockLists = [];
        var blockLists = this.m_blockLists;
        for (var blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
            var block = blockLists[blockIndex]
            if (!!block && block.checkAvailable()) {
                newBlockLists.push(block);
            } else {
                cc.log("ERROR: nil block block.m_blockType=" + block.m_blockType + ",block.m_text=" + block.m_text);
            }
        }
        this.m_blockLists = newBlockLists;
    }
});


cb.MailManager = cc.Class.extend({
	ctor: function() {
		this.mailsQueue=[];
	},

	requestReadMail:function(mailId){
		chatHandler.readMail(mailId);
	},

	addMail: function(mail) {
		var mailMessage=new chat.MailMessage();
		mailMessage.parse(mail);
		this.mailsQueue.push(mailMessage);
		this.pushTips();
	},

	pushTips: function() {
		if (this.mailsQueue.length > 0) {
			var tips = {
				data: this,
				type: TipsType.EMAIL
			};
			tipsManager.pushTips(tips);
		}
	},

	isHasMail:function(){
		return this.mailsQueue.length>0;
	},

	popMail:function(){
		if (this.mailsQueue.length===0){
			return
		}
		return this.mailsQueue.shift();
	},

	topMail:function(){
		if (this.mailsQueue.length===0){
			return
		}
		return this.mailsQueue[0];
	}

});

var mailManager = new cb.MailManager();

