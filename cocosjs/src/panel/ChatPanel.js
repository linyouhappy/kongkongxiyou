cb.SmallChatView = cc.Layer.extend({
	ctor: function(chatNode) {
		this._containerNode=chatNode;
		// this._super();
		// this.m_width = 310;
		// this.m_height = 118;
		// this._containerNode = cc.Node.create();
		// this.addChild(this._containerNode);

		// var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("chat_panel_bg.png");
		// frameSprite.setContentSize(cc.size(this.m_width, this.m_height));
		// frameSprite.setOpacity(150);
		// this._containerNode.addChild(frameSprite);

		// this._frameSprite = frameSprite;
		this.__initEditView();
		this.notifyReceiveMsg();

		this.textField=chatNode.getChildByName("textField");
		this.sendBtn=chatNode.getChildByName("sendBtn");
		this.bgChatImg=chatNode.getChildByName("bgChatImg");

		this.setQuickChat(false);
	},

	setQuickChat:function(isEnable){
		isEnable=!!isEnable;
		this.bgChatImg.setVisible(isEnable);
		this.textField.setVisible(isEnable);
		this.sendBtn.setVisible(isEnable);
		if (isEnable) {
			this.sendBtn.addTouchEventListener(this.touchEvent, this);
			this.textField.addEventListener(this.textFieldCallback, this);

			this.m_lastSendTime=0;
		}
	},

	textFieldCallback: function(sender, type) {
		inputBoxLayer.textFieldCallback(sender, type);
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var currentTime = Date.now();
			if (currentTime < this.m_lastSendTime) {
				quickLogManager.pushLog("发送失败，发送消息过于频繁！");
				return;
			}
			this.m_lastSendTime = currentTime + 3000;

			var chatString = this.textField.getString();
			if (chatString === null || chatString.length === 0) {
				quickLogManager.pushLog("发送失败，请输入聊天内容！");
				 cc.log("发送失败，请输入聊天内容！");
				return;
			}
			var msg = {
				channel: chat.channel.Area,
				content: chatString
			};
			msg.areaId = app.areaId;
			chatManager.send(msg);
			this.textField.setString("");
		}
	},

	__initEditView: function() {
		this.scrollViewWidth = 290;
		this.scrollViewHeight = 105;
		this.scrollViewSizeWidth = 310;

		var m_richTextBox = cb.CCRichText.create(this.scrollViewWidth, 0);
		m_richTextBox.setLineSpace(2);
		m_richTextBox.setDetailStyle("Arial", 20, cc.color(255, 255, 255, 255));
		m_richTextBox.setTouchEnabled(false);
		m_richTextBox.setBlankHeight(0);
		this.m_richTextBox=m_richTextBox;

		var m_scrollView = cc.ScrollView.create();
		m_scrollView.setPosition(-this.scrollViewSizeWidth / 2, -this.scrollViewHeight / 2);
		m_scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		m_scrollView.setViewSize(cc.size(this.scrollViewSizeWidth, this.scrollViewHeight));
		m_scrollView.addChild(m_richTextBox);
		m_scrollView.setTouchEnabled(false);
		m_scrollView.setBounceable(false);
		//		m_scrollView.setClippingToBounds(false);
		//		this.addChild(m_scrollView);
		this._containerNode.addChild(m_scrollView);
		this.m_scrollView = m_scrollView;

		// var self = this;
		// var onRichTextCallback = function(richTextState, eventId, x, y) {
		// 	cc.log("SmallChatView.showChatInfo=======onRichTextCallback");
		// 	if (richTextState === chat.kRichTextLoaded) {
		// 		var richTextSizeHeight = m_richTextBox.getContentSize().height;
		// 		if (richTextSizeHeight < self.scrollViewHeight) {
		// 			self.m_scrollView.setContentSize(cc.size(self.scrollViewSizeWidth, self.scrollViewHeight));
		// 			m_richTextBox.setPosition(cc.p(10, self.scrollViewHeight - richTextSizeHeight));
		// 		} else {
		// 			self.m_scrollView.setContentSize(cc.size(self.scrollViewSizeWidth, richTextSizeHeight + 30));
		// 			m_richTextBox.setPosition(cc.p(10, -25));
		// 			// cc.log("__initEditView  richTextSizeHeight=", richTextSizeHeight, "self.scrollViewHeight=", self.scrollViewHeight)
		// 		}
		// 	}
		// }
		// m_richTextBox.addEventListener(onRichTextCallback);
	},

	showChatInfo: function(messages) {
		// cc.log("SmallChatView.showChatInfo=======>>>");
		var message,blockLists,block,m_richTextBox=this.m_richTextBox;
		for (var msgIndex = 0; msgIndex < messages.length; msgIndex++) {
			message = messages[msgIndex];
			if (message === null)
				return;

			blockLists = message.m_blockLists;
			for (var blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
				block = blockLists[blockIndex];
				if (block.m_blockType === chat.blockTypeLabel) {
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleNormal, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeBracketHerfLabel) {
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleBracketHerf, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeHerfLabel) {
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleHerf, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeSprite) {
					m_richTextBox.appendRichSprite(block.m_spriteName, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeAnimate) {
					m_richTextBox.appendRichAnimate(block.m_spriteName, block.m_nodeId, block.m_eventId);
				}
			}
		}

		m_richTextBox.layoutChildren();
		var richTextSizeHeight = m_richTextBox.getContentSize().height;
		if (richTextSizeHeight < this.scrollViewHeight) {
			this.m_scrollView.setContentSize(cc.size(this.scrollViewSizeWidth, this.scrollViewHeight));
			m_richTextBox.setPosition(cc.p(10, this.scrollViewHeight - richTextSizeHeight));
		} else {
			this.m_scrollView.setContentSize(cc.size(this.scrollViewSizeWidth, richTextSizeHeight + 30));
			m_richTextBox.setPosition(cc.p(10, -25));
		}
		
		// this._containerNode.setVisible(true);
		// this._containerNode.stopAllActions();
		// var sequence = cc.Sequence.create(cc.DelayTime.create(5), cc.Hide.create());
		// this._containerNode.runAction(sequence);
		// cc.log("SmallChatView.showChatInfo=======<<<");
	},

	notifyReceiveMsg: function() {
		var messages = chatManager.smallMsgs;
		this.m_richTextBox.clearAll();
		this.showChatInfo(messages);
	}
});


cb.BigChatView = cc.Layer.extend({
	ctor: function() {
		this._super();
		this.__initEditView();
		this.notifyReceiveMsg();
	},

	__initEditView: function() {
		this.m_richTextBox = cb.CCRichText.create(800, 0);
		this.m_richTextBox.setLineSpace(2);
		this.m_richTextBox.setDetailStyle("Arial", 24, cc.color(255, 255, 255, 255));
		this.addChild(this.m_richTextBox);
	},

	showChatInfo: function(messages) {
		cc.log("BigChatView.showChatInfo=======>>>");

		var m_richTextBox=this.m_richTextBox;
		for (var msgIndex = 0; msgIndex < messages.length; msgIndex++) {
			var message = messages[msgIndex];
			if (message === null)
				return;

			var blockLists = message.m_blockLists;
			for (var blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
				var block = blockLists[blockIndex];
				if (block.m_blockType === chat.blockTypeLabel) {
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleNormal, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeBracketHerfLabel) {
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleBracketHerf, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeHerfLabel) {
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleHerf, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeSprite) {
					m_richTextBox.appendRichSprite(block.m_spriteName, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeAnimate) {
					m_richTextBox.appendRichAnimate(block.m_spriteName, block.m_nodeId, block.m_eventId);
				}
			}
		}
		cc.log("BigChatView.showChatInfo=======<<<");
	},

	notifyReceiveMsg: function() {
		var messages = chatManager.comprehensiveMsgs;
		this.m_richTextBox.clearAll();
		this.showChatInfo(messages);
	}
});


cb.PersonPanelView = cc.Layer.extend({
	ctor: function(chatPanelView) {
		this._super();
		this.m_width = 350;
		this.m_height = 470;
		this.m_chatPanelView = chatPanelView;

		this.playerId=chatPanelView.m_focusEvent.privateChatId;
		this.playerName=chatPanelView.m_focusEvent.privateChatName;

		this.__initView();
	},

	__initView: function() {
		var m_width = 280;
		var m_height = 320;

		var bgSprite = cc.Scale9Sprite.createWithSpriteFrameName("bg_underframe_2.png");
		bgSprite.setContentSize(cc.size(m_width, m_height));
		this.addChild(bgSprite);

		var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("bg_frame_2.png");
		frameSprite.setContentSize(cc.size(m_width, m_height));
		this.addChild(frameSprite);

		var menu = new cc.Menu();
		menu.setPosition(0, 0);
		this.addChild(menu);

		var labelNames = ["查看信息", "发起私聊", "加盟集团"];
		var labelName = null;
		var btnLabel = null;
		var menuItemSprite = null;
		var normalSprite = null;
		var selectedSprite = null;
		var yPosition = m_height / 2 - 80;

		for (var i = 0; i < labelNames.length; i++) {
			labelName = labelNames[i];
			btnLabel = cc.Label.createWithSystemFont(labelName, "Arial", 26);

			normalSprite = new cc.Sprite("#btn_red_long_glass.png");
			selectedSprite = new cc.Sprite("#btn_red_long_glass.png");
			effectManager.useShaderEffect(selectedSprite, "ShaderGreyScale");

			menuItemSprite = new cc.MenuItemSprite(normalSprite, selectedSprite, normalSprite, this.onMenuCallback, this);
			menuItemSprite.setTag(i);
			menu.addChild(menuItemSprite)
			menuItemSprite.setPosition(0, yPosition - 80 * i);
			menuItemSprite.addChild(btnLabel);
			btnLabel.setPosition(normalSprite.getContentSize().width / 2, normalSprite.getContentSize().height / 2);
		};

		var onTouchBegan = function(touch, event) {
			return true;
		};

		var self = this;
		var onTouchEnded = function(touch, event) {
			var location = self.convertTouchToNodeSpace(touch);
			if (location.x > -self.m_width/2 && location.x < self.m_width/2 && location.y > -self.m_height/2 && location.y < self.m_height/2) {
			}
			else
			{
				self.m_chatPanelView.destoryPersonView();
			}
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchEnded: onTouchEnded
		}, this);
	},

	onMenuCallback: function(sender) {
		switch (sender.getTag()) {
			//查看信息
			case 0:
				layerManager.pushLayer(cb.kMRolePanelId,this.playerId);
				break;
			//发起私聊
			case 1:
				this.m_chatPanelView.privateChat(this.playerId,this.playerName);
				break;
			//加盟集团
			case 2:
				break;
			// //添加好友
			// case 3:
			// 	break;
			// //删除好友
			// case 4:
			// 	break;
		}
		this.m_chatPanelView.destoryPersonView();
		// cc.log("sender tag=" + sender.getTag());
	}
});


cb.FacePanelView = cc.Layer.extend({
	ctor: function(chatPanelView) {
		this._super();
		this.m_width = 600;
		this.m_height = 480;

		this.m_chatPanelView = chatPanelView;

		this.init();
		// this.setPosition(-370, -280);
		this.setPosition(-370, -230);

		// var btnLabel = cc.Label.createWithSystemFont("+", "Arial", 34);
		// this.addChild(btnLabel);
	},
	init: function() {

		var frameSprite = cc.Scale9Sprite.createWithSpriteFrameName("chat_panel_bg.png");
		frameSprite.setContentSize(cc.size(this.m_width, this.m_height));
		frameSprite.setPosition(this.m_width / 2, this.m_height / 2);
		this.addChild(frameSprite);

		var scrollView = cc.ScrollView.create();
		scrollView.setPosition(15, 0);
		// scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		scrollView.setViewSize(cc.size(this.m_width-40, this.m_height-20));
		// scrollView.addChild(this.m_richTextBox);
		scrollView.setTouchEnabled(false);
		scrollView.setBounceable(false);
		// scrollView.setClippingToBounds(false);
		this.addChild(scrollView);

		// var btnLabel = cc.Label.createWithSystemFont("+", "Arial", 34);
		// btnLabel.setColor(cc.color(255,0,0,255));
		// this.addChild(btnLabel);

		this.maxYposition=0;
		this.minYposition=-295;
		var self = this;
		var onTouchBegan = function(touch, event) {
			self.isScrolling=false;
			return true;
		};

		var spriteBatchNode = cc.SpriteBatchNode.create("effect/char_face.png", 89);
		if (cb.FacePanelView.position) {
			spriteBatchNode.setPosition(cb.FacePanelView.position);
		}
		var onTouchMoved = function(touch, event) {
			if (self.isScrolling) {
				var delta=touch.getDelta();
                var position=spriteBatchNode.getPosition();
                position.x+=delta.x;
                    
                position.x=Math.max(position.x,self.minYposition);
                position.x=Math.min(position.x,self.maxYposition);
                spriteBatchNode.setPosition(position);

                cb.FacePanelView.position=position;
			}else{
				var curLocation=touch.getLocation();
				var startLocation=touch.getStartLocation();
				if (Math.abs(curLocation.x-startLocation.x)>20) {
					self.isScrolling=true;
				}
			}
		};

		var onTouchEnded = function(touch, event) {
			if (self.isScrolling) {
				return;
			}
			var location = self.convertTouchToNodeSpace(touch);
			if (location.x > 15 && location.x < self.m_width && location.y > 10 && location.y < self.m_height) {
				location = spriteBatchNode.convertTouchToNodeSpace(touch);

				var row = Math.floor(location.y / 65);
				row = Math.min(row, 6);
				var column = Math.floor(location.x / 65);
				column = Math.min(column, 12);
				var faceId = (6 - row) * 13 + column + 1;
				cc.log("点到我了 faceId=", faceId)

				if (faceId>89)
					return;

				var content = "<#F";
				if (faceId < 10) {
					content = content + "0" + faceId + ">";
				} else {
					content = content + faceId + ">";
				}
				self.m_chatPanelView.addEditBoxContent(content);
			}
			self.m_chatPanelView.destoryFaceView();
		};

		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
			onTouchMoved:onTouchMoved,
			onTouchEnded: onTouchEnded
		}, this);

		this.m_faceIcons = {};
		var xPosition = 15;
		var yPosition = this.m_height - 15;
		var columNum = 13;
		var index = 0;
		var spriteName = null;
		var faceIcon = null;
		for (var i = 0; i <= 88; i++) {
			index = i + 1;
			// if (index < 10) {
			spriteName = "#char_face_" + index + "_1.png";
			// } else {
			// 	spriteName = "#chat_" + index + ".png";
			// }

			faceIcon = new cc.Sprite(spriteName);
			faceIcon.setAnchorPoint(cc.p(0, 1));
			spriteBatchNode.addChild(faceIcon);
			faceIcon.setPosition(cc.p(xPosition + i % columNum * 65, yPosition - Math.floor(i / columNum) * 65));

			this.m_faceIcons[index] = faceIcon;

			// var btnLabel = cc.Label.createWithSystemFont(index+"", "Arial", 24);
			// btnLabel.setColor(cc.color(255,0,0,255));
			// btnLabel.setPosition(faceIcon.getPosition());
			// scrollView.addChild(btnLabel);
		}

		scrollView.addChild(spriteBatchNode);
	}
});

cb.ChatPanel = cc.Layer.extend({
	ctor: function() {
		this._super();

		this.m_lastSendTime=0;
		var ccsNode = ccs.CSLoader.createNode("uiccs/ChatPanel.csb");
		this.addChild(ccsNode);
		this._ccsNode = ccsNode;
		var tabBtnNode=ccsNode.getChildByName("tabBtnNode");

		var tabBtn = null;
		this._tabBtns = {};
		for (var i = 0; i < 7; i++) {
			tabBtn = tabBtnNode.getChildByTag(i + 100);
			tabBtn.addTouchEventListener(this.touchEvent, this);
			this._tabBtns[i] = tabBtn;
		};

		var faceBtn = ccsNode.getChildByName("faceBtn");
		faceBtn.addTouchEventListener(this.touchEvent1, this);
		faceBtn.setPressedActionEnabled(true);

		var sendBtn = ccsNode.getChildByName("sendBtn");
		sendBtn.addTouchEventListener(this.touchEvent1, this);
		sendBtn.setPressedActionEnabled(true);

		var closeBtn = ccsNode.getChildByName("closeBtn");
		closeBtn.addTouchEventListener(this.touchEvent1, this);
		closeBtn.setPressedActionEnabled(true);
		closeBtn.setPosition(cc.winSize.width/2-50,cc.winSize.height/2-40);
		closeBtn.setLocalZOrder(1000);

		this.frameSprite = ccsNode.getChildByName("frameSprite");
		this.textField = ccsNode.getChildByName("textField");

		this.__initEditView();

		this.tabIndex = null;

		var onTouchBegan = function(touch, event) {
			return true;
		};
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: onTouchBegan,
		}, ccsNode);
	},

	setPanelData:function(chatData){
		if (!!chatData) {
			//私聊
			if (chatData.dataType === 1) {
				this.privateChat(chatData.chatId,chatData.chatName);

				//物品
			} else if (chatData.dataType === 2) {
				var item=chatData.item
				if (item) {
					var tempStr;
					if (!item.id || item.type!==EntityType.EQUIPMENT) {
						tempStr = "<#G"+item.kindId+">";
					}else{
						tempStr = "<#G"+item.kindId+"|" + item.id+ "|"+item.totalStar+ ">";
					}
					this.addEditBoxContent(tempStr);
				}
				this.selectTabBtn(chat.channel.Total);
			} else {
				this.selectTabBtn(chat.channel.Total);
			}
		} else {
			if (cb.ChatPanel.tabIndex) {
				this.selectTabBtn(cb.ChatPanel.tabIndex);
			}else{
				this.selectTabBtn(chat.channel.Total);
			}
		}
	},

	__initEditView: function() {
		this.scrollViewWidth = 660;
		this.scrollViewHeight = 355;

		this.scrollViewSizeWidth = this.scrollViewWidth + 100;
		this.m_richTextBox = cb.CCRichText.create(this.scrollViewWidth+50, 0);
		this.m_richTextBox.setLineSpace(4);
		this.m_richTextBox.setDetailStyle("Arial", 24, cc.color(255, 255, 255, 255));
		this.m_richTextBox.setBlankHeight(0);
		// this.m_richTextBox.showDebug();

		var m_scrollView = cc.ScrollView.create();
		m_scrollView.setPosition(-this.scrollViewWidth / 2 - 50, -this.scrollViewHeight / 2 -63);
		m_scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
		m_scrollView.setViewSize(cc.size(this.scrollViewSizeWidth, this.scrollViewHeight));
		m_scrollView.addChild(this.m_richTextBox);
		m_scrollView.setTouchEnabled(true);
		m_scrollView.setBounceable(false);
		// m_scrollView.setClippingToBounds(false);

		this._ccsNode.addChild(m_scrollView);
		this.m_scrollView = m_scrollView;

		this.richTextRect=cc.rect(0,0,this.frameSprite.getContentSize().width,this.frameSprite.getContentSize().height);

		var self = this;
		var onRichTextCallback = function(richTextState, eventId, x, y) {
			if (richTextState === chat.kRichTextTouchBegan) {
				var worldPosition = self.m_richTextBox.convertToWorldSpace(cc.p(x, y));
				var nodePosition = self.frameSprite.convertToNodeSpace(worldPosition);
				if(cc.rectContainsPoint(self.richTextRect,nodePosition)){
					return true;
				}
				return false;
			} else if (richTextState === chat.kRichTextTouchEnded) {
				cc.log("onRichTextCallback richTextState=", richTextState, "eventId=", eventId, "x=", x, "y=", y)
				var event = self.findEventByEventId(eventId);
				if (event != null) {
					var eventType=event.eventType;
					if (eventType === "N") {
                    	if (!event.privateChatName || !event.privateChatId) {
                    		quickLogManager.pushLog("该玩家信息丢失，打开个人详情失败！");
                    		return;
                    	}
						self.m_focusEvent = event
						self.createPersonView();

					// } else if (event.eventType === "S") {
					// 	var copyEvent = {
					// 		eventId: event.eventId,
					// 		yuyin_id: event.yuyin_id
					// 	};
					// 	self.pushSoundEvent(copyEvent);

					} else if (eventType=== "G") {
						//系统消息的物品 只有物品id
						var worldPoint = self.m_richTextBox.convertToWorldSpace(cc.p(x, y));
						if (event.kindId) {
							if (event.itemId) {
								chatManager.getChatItem(event.itemId,worldPoint);
							} else {
								var item = formula.kindIdToItem(event.kindId)
								item.noShare = true;
								var itemDetailLayer = new cb.ItemDetailLayer(item)
								itemDetailLayer.setPosition(worldPoint);
							}
						}else{
							quickLogManager.pushLog("不存在该物品！");
						}
					} else if (eventType === "A") {
						cc.log("event.areaId=", event.areaId);
						if (app.getCurArea().areaId!==event.areaId) {
							tipsBoxLayer.showTipsBox("是否进入["+event.areaName+"]场景？");
		                    tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
		                        if (isYesOrNo) {
		                        	npcHandler.changeArea(event.areaId);
		                        }
		                    });
						}else{
							quickLogManager.pushLog("您已处在当前场景。",2);
						}
						
					} else if (eventType == "T") {

						// if _G.g_Stage:getScenesType() ~= _G.Constant.CONST_MAP_TYPE_CITY then
						//     local command = CErrorBoxCommand( "战斗场景不能组队" )
						//     controller :sendCommand( command )
						//     return
						// end

						// if _G.isHaveJionTeam ~= nil and _G.isHaveJionTeam == 1 then
						//     local command = CErrorBoxCommand( "您已加入队伍" )
						//     controller :sendCommand( command )
						//     return
						// end

						// if event.teamId ~= nil and event.teamId > 0 then
						//     local msg = REQ_TEAM_LIVE_REQ()
						//     msg       : setArguments( event.teamId, 3)
						//     CNetwork  : send(msg)
						// end

						// cc.log("event.teamId=", event.teamId, "event.copyId=", event.copyId);

						// self.m_chatViewTeamData = {};
						// if (event.teamId !== null && event.copyId !== null) {
						// 	self.m_chatViewTeamData.teamId = event.teamId;
						// 	self.m_chatViewTeamData.copyId = event.copyId;
						// }
					} else if (eventType == "F") {
						cc.log("event.guildId=", event.guildId);
						layerManager.pushLayer(cb.kMGuildDetailPanelId,event.guildId);
					}
				}
			} else if (richTextState === chat.kRichTextLoaded) {
				var richTextSizeHeight = self.m_richTextBox.getContentSize().height;

				if (richTextSizeHeight < self.scrollViewHeight) {
					self.m_scrollView.setContentSize(cc.size(self.scrollViewSizeWidth, self.scrollViewHeight));
					self.m_richTextBox.setPosition(cc.p(0, self.scrollViewHeight - richTextSizeHeight));
				} else {
					self.m_scrollView.setContentSize(cc.size(self.scrollViewSizeWidth, richTextSizeHeight));
					self.m_richTextBox.setPosition(cc.p(0, 0));

					cc.log("__initEditView  richTextSizeHeight=", richTextSizeHeight, "self.scrollViewHeight=", self.scrollViewHeight)
				}
			}
		}
		this.m_richTextBox.addEventListener(onRichTextCallback);
	},

	selectTabBtn: function(index) {
		if (index === null) return;

		if (this.tabIndex === index)
			return;

		if (this.tabIndex !== null)
			this.unselectTabBtn(this.tabIndex);

		this.tabIndex = index;
		this.m_currentChannelId = index;
		cb.ChatPanel.tabIndex=index;
		this.notifyReceiveMsg();

		this.sendChannelId = index;
		if (index === 0)
			this.sendChannelId = chat.channel.World;

		if (index === chat.channel.Private) {
			var chatString = this.textField.getString();
			if (this.m_privateChatName && this.m_privateChatId) {
				if (chatString && chatString.length > 0) {
					this.textField.setString("/" + this.m_privateChatName + " "+chatString);
				} else {
					this.textField.setString("/" + this.m_privateChatName + " ");
				}
			}
		} else {
			if (!!this.m_privateChatName && !!this.m_privateChatId) {
				var chatString = this.textField.getString();
				var searchIndex = chatString.indexOf(this.m_privateChatName);
				//没有私聊内容
				if (searchIndex === 1) {
					var msgContent = chatString.substring(this.m_privateChatName.length + 2);
					this.textField.setString(msgContent);
				}
			}
		}

		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_ORANGEGOLD);
		tabBtn.setHighlighted(true);
	},

	unselectTabBtn: function(index) {
		var tabBtn = this._tabBtns[index];
		tabBtn.setTitleColor(consts.COLOR_WHITE);
		tabBtn.setHighlighted(false);
	},

	touchEvent1: function(sender, type) {
		var name = sender.getName();
		switch (type) {
			case ccui.Widget.TOUCH_BEGAN:
				sender.setTitleColor(consts.COLOR_ORANGEGOLD);
				break;
			case ccui.Widget.TOUCH_ENDED:
				sender.setTitleColor(consts.COLOR_WHITE);
				//表情
				if (name === "faceBtn") {
					this.createFaceView();
				} else if (name === "sendBtn") {
					this.sendMsg();
				} else if(name==="closeBtn"){
					layerManager.closePanel(this);
				}
				break;
			default:
				sender.setTitleColor(consts.COLOR_WHITE);
				break;
		}
	},

	touchEvent: function(sender, type) {
		if (type === ccui.Widget.TOUCH_ENDED) {
			var tag = sender.getTag();
			var index = tag - 100;
			if (index < 7) {
				this.selectTabBtn(index);
			} 
		}
	},

	privateChat: function(privateChatId, privateChatName) {
		this.m_privateChatName = privateChatName || "";
		this.m_privateChatId = privateChatId;

		this.sendChannelId = chat.channel.Private;
		this.tabIndex=0;
		this.selectTabBtn(chat.channel.Private);
		cc.log("ChatPanelView.privateChat  privateChatId=", privateChatId, "privateChatName=", privateChatName);
	},

	showTips: function(_tipsStr) {
		cc.log("_tipsStr=" + _tipsStr);
		quickLogManager.pushLog(_tipsStr,4);
	},

	addEditBoxContent: function(_content) {
		if (!_content || _content.length === 0)
			return;
		var originString = this.textField.getString();
		var chatString = originString + _content;
		this.textField.setString(chatString);
		var newString = this.textField.getString();
		if (newString.length !== chatString.length) {
			this.textField.setString(originString);
			quickLogManager.pushLog("输入框已满，不能再输入！", 4);
		}
	},

	sendMsg: function() {
		// if (app.getCurPlayer().level < 20) {
		// 	quickLogManager.pushLog("发送失败，聊天需要20级以上!", 4);
		// 	return;
		// }

		var currentTime = Date.now();
		if (currentTime < this.m_lastSendTime) {
			this.showTips("发送失败，发送消息过于频繁！");
			return;
		}
		this.m_lastSendTime = currentTime + 3000;

		var chatString = this.textField.getString();
		cc.log("发送频道=" + chat.messageHeader[this.sendChannelId] + "，发送内容=" + chatString);

		var msg_send = null;
		if (this.sendChannelId !== chat.channel.Private) {
			msg_send = chatString;
		} else {
			if (this.m_privateChatName === null || this.m_privateChatId === null) {
				this.showTips("发送失败，请选择私聊对象后，再发送！");
				cc.log("发送失败，请选择私聊对象后，再发送！");
				return;
			}

			var searchIndex = chatString.indexOf(this.m_privateChatName, 0);
			if (searchIndex < 0 || searchIndex !== 1) {
				this.showTips("发送失败，请选择私聊对象后，再发送！");
				cc.log("发送失败，请选择私聊对象后，再发送！");
				return;
			}
			msg_send = chatString.substring(this.m_privateChatName.length + 2);
		}

		if (msg_send === null || msg_send.length === 0) {
			this.showTips("发送失败，请输入聊天内容！");
			cc.log("发送失败，请输入聊天内容！");
			return;
		}

		if (this.sendChannelId !== chat.channel.Private) {
			// var msg = null;
			// if (this.m_isHasGoodsMsg) {
			// 	var goodsList = this.generateGoodsMsg(msg_send);
			// 	if (goodsList.length > 0) {
			// 		this.textField.setTextString("");
			// 		this.m_sendGoodsIndex = 0;
			// 		this.m_isHasGoodsMsg = null;
			// 		this.m_sendGoodsList = [];
			// 		return;
			// 	}
			// }

			var msg = {
				channel: this.sendChannelId,
				content: msg_send
			};

			if (this.sendChannelId === chat.channel.Area) {
				msg.areaId = app.areaId;
			}else if(this.sendChannelId===chat.channel.Team){
				var curPlayer=app.getCurPlayer();
				if (curPlayer.teamId===TeamConsts.TEAM_ID_NONE) {
					this.showTips("发送失败，您还没有队伍！");
					return;
				}
				msg.teamId=curPlayer.teamId;
			}
			chatManager.send(msg);
			this.textField.setString("");
		} else {
			// if (this.m_isHasGoodsMsg) {
			// 	var goodsList = this.generateGoodsMsg(msg_send);
			// 	if (goodsList.length > 0) {
			// 		this.textField.setString("/", this.m_privateChatName, " ");
			// 		this.m_sendGoodsIndex = 0
			// 		this.m_isHasGoodsMsg = null;
			// 		this.m_sendGoodsList = {}
			// 		return;
			// 	}
			// }
			var msg = {
				channel: this.sendChannelId,
				from:app.getCurPlayer().name,
				toName:this.m_privateChatName,
				toPlayerId:this.m_privateChatId,
				content: msg_send
			};
			chatManager.send(msg);
			this.textField.setString("/"+this.m_privateChatName+" ");
		}
	},
	// <#G0>[[kindId,type,count],[kindId,type,jobId,baseValue,potential,percent,totalStar]]
	// generateGoodsMsg: function() {
	// 	var item;
	// 	var items=this.m_sendGoodsList;
	// 	var msgItems=[];
	// 	for (var key in items) {
	// 		item=items[key];
	// 		if (item.type===EntityType.EQUIPMENT) {
	// 			msgItems.push([item.kindId,type,jobId,baseValue,potential,percent,totalStar]);
	// 		}else{

	// 		}
	// 	}
	// },

	showChatInfo: function(messages) {
		cc.log("ChatPanelView.showChatInfo=======>>>");
		var message,blockLists,blockIndex,block;
		var m_richTextBox=this.m_richTextBox;
		for (var msgIndex = 0; msgIndex < messages.length; msgIndex++) {
			message = messages[msgIndex];
			if (message === null)
				return;

			blockLists = message.m_blockLists;
			for (blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
				block = blockLists[blockIndex];
				// cc.log("block.m_blockType=", block.m_blockType,",block.m_nodeId=",block.m_nodeId);
				if (block.m_blockType === chat.blockTypeLabel) {
					// cc.log("block.m_text=", block.m_text);
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleNormal, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeBracketHerfLabel) {
					// cc.log("下划线显示", "block.m_text=", block.m_text);
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleBracketHerf, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeHerfLabel) {
					// cc.log("下划线显示", "block.m_text=", block.m_text);
					m_richTextBox.setTextColor(block.m_color);
					m_richTextBox.appendRichText(block.m_text, chat.kTextStyleHerf, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeSprite) {
					m_richTextBox.appendRichSprite(block.m_spriteName, block.m_nodeId, block.m_eventId);
				} else if (block.m_blockType === chat.blockTypeAnimate) {
					m_richTextBox.appendRichAnimate(block.m_spriteName, block.m_nodeId, block.m_eventId);
				}
			}
		}
		cc.log("ChatPanelView.showChatInfo=======<<<");
	},

	getChannelMessages: function() {
		var messages = null;
		if (this.m_currentChannelId === 0)
			messages = chatManager.comprehensiveMsgs;
		else if (this.m_currentChannelId === chat.channel.World)
			messages = chatManager.worldMsgs;
		else if (this.m_currentChannelId === chat.channel.Area)
			messages = chatManager.areaMsgs;
		else if (this.m_currentChannelId === chat.channel.Faction)
			messages = chatManager.fractionMsgs;
		else if (this.m_currentChannelId === chat.channel.Team)
			messages = chatManager.teamMsgs;
		else if (this.m_currentChannelId === chat.channel.Private)
			messages = chatManager.privateMsgs;
		else if (this.m_currentChannelId === chat.channel.System)
			messages = chatManager.systemMsgs;

		return messages;
	},

	notifyReceiveMsg: function() {
		cc.log("ChatPanelView.notifyReceiveMsg=======>>>");
		var richText = this.m_richTextBox;
		if (richText === null) {
			cc.log("ChatPanelView.notifyReceiveMsg===  richText==nil ====>>>");
			return;
		}
		richText.clearAll();
		var messages = this.getChannelMessages();
		if (messages !== null) {
			this.showChatInfo(messages);
		}
		cc.log("ChatPanelView.notifyReceiveMsg=======<<<");
	},

	findEventByEventId: function(eventId) {
		var messages = this.getChannelMessages();
		var message,event;
		if (!!messages) {
			for (var key in messages) {
				message = messages[key];
				if (!!message && !!message.eventList) {
					event=message.eventList[eventId];
					if(!!event) return event;
				}
			}
		}
		return null;
	},

	createFaceView: function() {
		this.destoryFaceView();

		var facePanelView = new cb.FacePanelView(this);
		this._ccsNode.addChild(facePanelView);
		this.facePanelView = facePanelView;
	},

	destoryFaceView: function() {
		if (!!this.facePanelView)
			this._ccsNode.removeChild(this.facePanelView);

		this.facePanelView = null;
	},

	createPersonView: function() {
		this.destoryPersonView();

		var personPanelView = new cb.PersonPanelView(this);
		this._ccsNode.addChild(personPanelView);
		this.personPanelView = personPanelView;
	},

	destoryPersonView: function() {
		if (!!this.personPanelView)
			this._ccsNode.removeChild(this.personPanelView);

		this.personPanelView = null;
	}

});