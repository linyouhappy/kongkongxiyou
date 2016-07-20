var chat = {};
chat.channel = {
    Total:0,
    World: 1,
    Area: 2,
    Faction: 3,
    Team: 4,
    Private: 5,
    System: 6,
    Marquee:7
};

chat.channelNames = [
    "综合", "世界", "集团", "组队", "私聊", "公告"
];

chat.colorTbl = {
    yellow: cc.color(252, 247, 46, 255),//黄色
    cyan: cc.color(0, 252, 255, 255),//蓝绿色
    blue: cc.color(92, 180, 255, 255),//蓝色
    green: cc.color(28, 247, 64, 255),//绿色
    red: cc.color(252, 10, 8, 255),//红色
    brown: cc.color(255, 168, 0, 255),//棕色
    purple: cc.color(188, 94, 247, 255),//紫色
    white: cc.color(255, 255, 255, 255)//白色
};

chat.messageHeader = ["[综合]", "[世界]", "[地区]","[集团]", "[组队]", "[私聊]", "[公告]"];

chat.qualityColor = [
    chat.colorTbl.white,
    chat.colorTbl.white,//世界
    chat.colorTbl.yellow,//地区
    chat.colorTbl.green,//公会
    chat.colorTbl.blue,//组队
    chat.colorTbl.purple,//私聊
    chat.colorTbl.red//公告
];

chat.bodyColor = [
    chat.colorTbl.white, //无
    chat.colorTbl.yellow, //世界
    chat.colorTbl.white, //地区
    chat.colorTbl.blue, //公会
    chat.colorTbl.green, //组队
    chat.colorTbl.brown, //私聊
    chat.colorTbl.purple //公告
];

chat.hrefEventId = 1;
chat.nodeId = 1;

chat.blockTypeLabel = 1;
chat.blockTypeHerfLabel = 2;
chat.blockTypeBracketHerfLabel = 3;
chat.blockTypeSprite = 4;
chat.blockTypePictureButton = 5;
chat.blockTypeTextButton = 6;
chat.blockTypeMixButton = 7;
chat.blockTypeSoundButton = 8;
chat.blockTypeAnimate = 9;

chat.kTextStyleNormal = 1;
chat.kTextStyleHerf = 2;
chat.kTextStyleBracketHerf = 3;

chat.kRichTextLoaded = 0;
chat.kRichTextTouchEvent = 1;
chat.kRichTextTouchBegan = 2;
chat.kRichTextTouchEnded = 3;

chat.MessageBlock = cc.Class.extend({
    ctor: function() {
        this.m_eventId = 0;

        chat.nodeId = chat.nodeId + 1;
        this.m_nodeId = chat.nodeId;
    },

    checkAvailable: function() {
        switch (this.m_blockType) {
            case chat.blockTypeLabel:
            case chat.blockTypeBracketHerfLabel:
            case chat.blockTypeHerfLabel:
                if (this.m_color && this.m_text && this.m_text.length > 0)
                    return true;
                break;
            case chat.blockTypeSprite:
                if (!!this.m_spriteName && this.m_spriteName.length)
                    return true;
                break;
            case chat.blockTypeAnimate:
                if (!!this.m_spriteName && this.m_spriteName.length)
                    return true;
                break;
            case chat.blockTypeSoundButton:
                return true;
        }

        cc.log("ERROR null block block.m_blockType=", chat.m_blockType);
        return false;
    }
});

chat.BaseMessage = cc.Class.extend({
    ctor: function() {
        this.channelId = -1;
    },

    parse: function(msg_data) {

    },

    getHeader: function() {
        var messageBlock = new chat.MessageBlock();
        messageBlock.m_text = chat.messageHeader[this.channelId];
        messageBlock.m_blockType = chat.blockTypeLabel;
        messageBlock.m_color = chat.qualityColor[this.channelId];

        this.m_blockLists.push(messageBlock);
        return messageBlock;
    },

    createLabelBlock: function(_blockType, _text, _color) {
        var messageBlock = new chat.MessageBlock();
        messageBlock.m_text = _text || "";
        messageBlock.m_blockType = _blockType;
        messageBlock.m_color = _color;

        if (_color === null)
            cc.error("lua error BaseMessage.createLabelBlock ");

        this.m_blockLists.push(messageBlock);
        return messageBlock;
    },

    createHerfLabelBlock: function(_eventId, _text, _color) {
        var messageBlock = new chat.MessageBlock();
        messageBlock.m_text = _text || "";
        messageBlock.m_blockType = chat.blockTypeHerfLabel;
        messageBlock.m_color = _color;
        messageBlock.m_eventId = _eventId;

        if (_color === null)
            cc.error("lua error BaseMessage.createHerfLabelBlock ");

        this.m_blockLists.push(messageBlock);
        return messageBlock;
    },

    createSpriteBlock: function(_spriteName) {
        var messageBlock = new chat.MessageBlock();
        messageBlock.m_spriteName = _spriteName;
        messageBlock.m_blockType = chat.blockTypeSprite;

        this.m_blockLists.push(messageBlock);
        return messageBlock;
    },

    createAnimateBlock: function(_animateName) {
        var messageBlock = new chat.MessageBlock();
        messageBlock.m_spriteName = _animateName;
        messageBlock.m_blockType = chat.blockTypeAnimate;

        this.m_blockLists.push(messageBlock);
        return messageBlock;
    },

    getColorFormat: function(msg) {
        return this.createLabelBlock(chat.blockTypeLabel, msg, chat.bodyColor[this.channelId]);
    },

    getPlayerColorHrefName: function(msg, eventId) {
        var messageBlock = new chat.MessageBlock();
        messageBlock.m_text = "[" + msg + "]";
        messageBlock.m_blockType = chat.blockTypeBracketHerfLabel;
        messageBlock.m_color = chat.colorTbl.cyan;
        messageBlock.m_eventId = eventId;

        this.m_blockLists.push(messageBlock);
        return messageBlock
    },

    registerEvent: function(event) {
        chat.hrefEventId = chat.hrefEventId + 1;
        event.m_eventId = chat.hrefEventId;
        this.eventList[chat.hrefEventId] = event;
    },

    parseBroadcast:function(msg_data){
        if(msg_data.content){
            this.createLabelBlock(chat.blockTypeLabel,msg_data.content,chat.colorTbl.brown);
            cc.log("公告来袭 SystemMessage:parse===============>>>")
            return;
        }
        var broadcastData=dataApi.broadcast.findById(msg_data.broadId);
        var msgContent;
        if(!broadcastData)
        {
            msgContent = "该系统广播未找到:"+msg_data.broadId;
            this.createLabelBlock(chat.blockTypeLabel,msgContent,chat.bodyColor[this.channelId]);
            return;
        }
        else
        {
            msgContent = broadcastData.msg;
            if(!msg_data.data || msg_data.data.length===0){
                this.createLabelBlock(chat.blockTypeLabel,msgContent,chat.bodyColor[this.channelId]);
                return;
            }
        }
        // cc.log("SystemMessage:parse  msgContent=%s",msgContent);
        var searchIndex = 0;
        var startTagIndex = 1;
        var closeTagIndex = 1;
        var resultStr =null;
        var parameterIndex = 0;

        var contentData=msg_data.data;
        while(contentData.length>0){
            startTagIndex=msgContent.indexOf("<",searchIndex);
            closeTagIndex=msgContent.indexOf(">",searchIndex);

            var parameterData=contentData[parameterIndex];
            parameterIndex++;
            if(!parameterData){
                resultStr=msgContent.substring(searchIndex);
                this.createLabelBlock(chat.blockTypeLabel,resultStr,chat.bodyColor[this.channelId]);
                break;
            }
            if(startTagIndex>=0 && closeTagIndex>=0)
            {
                resultStr=msgContent.substring(searchIndex,startTagIndex);
                if(!!resultStr && resultStr.length>0){
                    this.createLabelBlock(chat.blockTypeLabel,resultStr,chat.bodyColor[this.channelId]);
                }

                resultStr=msgContent.substring(startTagIndex+1,closeTagIndex);
                var parameterType = Number(resultStr);
                if(parameterType){
                    cc.log("parseBroadcast parameterType=",parameterType,",parameterData=",JSON.stringify(parameterData));
                    switch (parameterType) {
                        //string
                        case 1:
                            if (cc.isString(parameterData)) {
                                this.createLabelBlock(chat.blockTypeLabel, parameterData, chat.colorTbl.brown);
                            }
                            break;
                            //number
                        case 2:
                            // if (cc.isNumber(parameterData)) {
                                this.createLabelBlock(chat.blockTypeLabel, parameterData+"", chat.colorTbl.brown);
                            // }
                            break;
                            //donation sum
                        case 3:
                            if (cc.isNumber(parameterData)) {
                                parameterData = formula.bigNumber2Text(parameterData)+"";
                                this.createLabelBlock(chat.blockTypeLabel, parameterData, chat.colorTbl.brown);
                            }
                            break;
                            //player name
                        case 4:
                            if (parameterData.playerId === app.curPlayerId) {
                                this.createLabelBlock(chat.blockTypeLabel, parameterData.name, chat.colorTbl.cyan);
                            } else {
                                var event = {
                                    eventType: "N",
                                    privateChatName: parameterData.name,
                                    privateChatId: parameterData.playerId
                                };
                                this.registerEvent(event);
                                this.getPlayerColorHrefName(parameterData.name, chat.hrefEventId);
                            }
                            break;
                            //place name
                        case 5:
                            var officerData = dataApi.officer.findById(parameterData);
                            if (officerData) {
                                this.createLabelBlock(chat.blockTypeLabel, officerData.name, chat.colorTbl.brown);
                            }
                            break;
                        case 6:
                            if (parameterData.guildId && parameterData.name) {
                                if (parameterData.guildId === app.getCurPlayer().guildId) {
                                    this.createLabelBlock(chat.blockTypeLabel, parameterData.name, chat.colorTbl.red);
                                } else {
                                    var event = {
                                        eventType: "F",
                                        guildId: parameterData.guildId
                                    };
                                    this.registerEvent(event);
                                    this.createHerfLabelBlock(chat.hrefEventId, parameterData.name,chat.colorTbl.cyan);
                                }
                            }
                            break;
                        case 7:
                            if (cc.isNumber(parameterData)) {
                                var event = {
                                    eventType: "A",
                                    areaId: parameterData
                                };
                                this.registerEvent(event);
                                var areaData = dataApi.area.findById(event.areaId);
                                if (areaData) {
                                    event.areaName=areaData.areaName;
                                        // createHerfLabelBlock: function(_eventId, _text, _color) {
                                    this.createHerfLabelBlock(chat.hrefEventId,areaData.areaName,chat.colorTbl.brown);
                                }
                            }
                            break;
                    }
                }
                searchIndex=closeTagIndex+1
            }
            else
            {
                resultStr=msgContent.substring(searchIndex);
                this.createLabelBlock(chat.blockTypeLabel,resultStr,chat.bodyColor[this.channelId]);
            }
        }
    }
});

chat.ChatMessage = chat.BaseMessage.extend({
    ctor: function() {
        // this.channelId = -1;
        this.messageId = "C";
        this.eventList = {};

        this.m_blockLists = [];
    },
    parseFaceAndGoods: function(chat_msg) {
        
        var showStr = chat_msg;

        var resultStr = "";

        var goodsSearchIndex = 1;
        var faceSearchIndex = 1;
        var closeTagIndex = 1;
        var oldSearchIndex = 1;
        var focusGoodsOrFace = 0; //1:goods,2:face

        var faceTagLength = 6;
        var searchIndex = 0;
        while (!!showStr) {
            oldSearchIndex = searchIndex;
            goodsSearchIndex = showStr.indexOf("<#G", searchIndex);
            faceSearchIndex = showStr.indexOf("<#F", searchIndex);

            if (goodsSearchIndex === -1 && faceSearchIndex === -1) {
                break;
            } else if (goodsSearchIndex === -1 && faceSearchIndex >= 0) {
                focusGoodsOrFace = 2;
                searchIndex = faceSearchIndex;
            } else if (goodsSearchIndex >= 0 && faceSearchIndex === -1) {
                focusGoodsOrFace = 1;
                searchIndex = goodsSearchIndex;
            } else if (goodsSearchIndex > faceSearchIndex) {
                focusGoodsOrFace = 2;
                searchIndex = faceSearchIndex;
            } else if (goodsSearchIndex < faceSearchIndex) {
                focusGoodsOrFace = 1;
                searchIndex = goodsSearchIndex;
            }

            closeTagIndex = showStr.indexOf(">", searchIndex);
            if (closeTagIndex === -1) {
                break;
            }
            /////////////////////////////////////////////////////
            resultStr = showStr.substring(oldSearchIndex, searchIndex);
            if (!!resultStr && resultStr.length > 0) {
                this.createLabelBlock(chat.blockTypeLabel, resultStr, chat.bodyColor[this.channelId]);
            }
            /////////////////////////////////////////////////////
            if (focusGoodsOrFace === 1) {
                var itemStr = showStr.substring(searchIndex + 3, closeTagIndex);
                if (itemStr && itemStr.length>0) {
                    var infoArray=itemStr.split("|");
                    var kindId=infoArray[0];
                    if (kindId) {
                        var name,itemData;
                        if (kindId>8000) {
                            itemData=dataApi.item.findById(kindId);
                        }else{
                            itemData=dataApi.equipment.findById(kindId);
                        }
                        if (itemData) {
                            var event = {
                                eventType: "G",
                                kindId: kindId,
                                itemId: Number(infoArray[1])
                            };
                            this.registerEvent(event);

                            var totalStar=Number(infoArray[2]) || 0;
                            var level=Math.ceil(totalStar / 2);
                            var itemColor=colorTbl[level] || consts.COLOR_GRAY;
                            this.createHerfLabelBlock(chat.hrefEventId, itemData.name, itemColor);

                            searchIndex = closeTagIndex + 1;
                            continue;
                        }
                    }
                }

                /////////////////////////////////////////////////////
                resultStr = showStr.substring(searchIndex, closeTagIndex+1);
                if (!!resultStr && resultStr.length > 0) {
                    this.createLabelBlock(chat.blockTypeLabel, resultStr, chat.bodyColor[this.channelId]);
                }
                /////////////////////////////////////////////////////
                searchIndex = closeTagIndex + 1;

            } else if (focusGoodsOrFace === 2) {
                //表情
                if (closeTagIndex - searchIndex === faceTagLength - 1) {
                    var key = showStr.substring(searchIndex + 3, closeTagIndex);
                    if (!!key) {
                        /////////////////////////////////////////////////////
                        // this.createSpriteBlock("chat_" + key + ".png");
                        this.createAnimateBlock("char_face_" + Number(key));
                        /////////////////////////////////////////////////////
                        searchIndex = searchIndex + faceTagLength;
                    } else {
                        /////////////////////////////////////////////////////
                        resultStr = showStr.substring(searchIndex, searchIndex + 3);
                        if (!!resultStr && resultStr.length > 0) {
                            this.createLabelBlock(chat.blockTypeLabel, resultStr, chat.bodyColor[this.channelId]);
                        }
                        /////////////////////////////////////////////////////
                        searchIndex = searchIndex + 3;
                    }
                    //不是表情
                } else {
                    /////////////////////////////////////////////////////
                    resultStr = showStr.substring(searchIndex, searchIndex + 3);
                    if (!!resultStr && resultStr.length > 0) {
                        this.createLabelBlock(chat.blockTypeLabel, resultStr, chat.bodyColor[this.channelId]);
                    }
                    /////////////////////////////////////////////////////
                    searchIndex = searchIndex + 3;
                }
            } else {
                /////////////////////////////////////////////////////
                resultStr = showStr.substring(searchIndex, searchIndex + 3);
                if (!!resultStr && resultStr.length > 0) {
                    this.createLabelBlock(chat.blockTypeLabel, resultStr, chat.bodyColor[this.channelId]);
                }
                /////////////////////////////////////////////////////
                searchIndex = searchIndex + 3;
            }
        }

        /////////////////////////////////////////////////////
        if (!!showStr) {
            resultStr = showStr.substring(oldSearchIndex);
            if (!!resultStr && resultStr.length > 0) {
                this.createLabelBlock(chat.blockTypeLabel, resultStr, chat.bodyColor[this.channelId]);
            }
        }
        /////////////////////////////////////////////////////
    },
    parse: function(msg_data) {
        this.channelId = msg_data.channelId;
        this.senderName = msg_data.from || "";
        this.senderId = msg_data.playerId;
        this.receiverName = msg_data.toName || "";
        this.receiverId = msg_data.toPlayerId;
        //this.goodsList = msg_data.goods_msg_no;
        this.is_guide = msg_data.is_guide;
        this.vip = msg_data.vip;
        var chat_msg = msg_data.content || "";
        var maskId=msg_data.maskId;

        cc.log("this.senderName=", this.senderName);
        cc.log("this.senderId=", this.senderId);
        cc.log("this.receiverName=", this.receiverName);
        cc.log("this.receiverId=", this.receiverId);
        cc.log("this.channelId=", this.channelId);
        cc.log("maskId=", maskId);
        cc.log("chat_msg=", chat_msg);

        this.getHeader();

        if (this.channelId === chat.channel.Private) {
            if (this.senderId === app.curPlayerId) {
                this.createLabelBlock(chat.blockTypeLabel, "你", chat.colorTbl.cyan);
                this.createLabelBlock(chat.blockTypeLabel, "对", chat.bodyColor[this.channelId]);

                var event = {
                    eventType: "N",
                    privateChatName: this.receiverName,
                    privateChatId: this.receiverId
                };
                this.registerEvent(event);

                this.getPlayerColorHrefName(this.receiverName, chat.hrefEventId);
                if (!!this.vip && this.vip > 0) {
                    var vipStr = "[VIP" + this.vip + "]";
                    this.createLabelBlock(chat.blockTypeLabel, vipStr, chat.colorTbl.yellow);
                }
                
            } else {
                chat.hrefEventId = chat.hrefEventId + 1;

                var event = {
                    eventType: "N",
                    privateChatName: this.senderName,
                    privateChatId: this.senderId
                };
                this.registerEvent(event);

                this.getPlayerColorHrefName(this.senderName, chat.hrefEventId);

                if (!!this.vip && this.vip > 0) {
                    var vipStr = "[VIP" + this.vip + "]";
                    this.createLabelBlock(chat.blockTypeLabel, vipStr, chat.colorTbl.yellow);
                }

                this.createLabelBlock(chat.blockTypeLabel, "对", chat.bodyColor[this.channelId]);
                this.createLabelBlock(chat.blockTypeLabel, "你", chat.colorTbl.cyan);
            }

            this.createLabelBlock(chat.blockTypeLabel, "说:", chat.bodyColor[this.channelId]);
        } else {
            if (this.senderName) {
                if (this.senderId === app.curPlayerId || this.senderId == 0) {
                    if (this.is_guide === 1) {
                        this.createLabelBlock(chat.blockTypeLabel, "[新手指导员]", chat.colorTbl.green);
                    }

                    this.createLabelBlock(chat.blockTypeLabel, this.senderName, chat.colorTbl.cyan);
                    if (!!this.vip && this.vip > 0) {
                        var vipStr = "[VIP" + this.vip + "]";
                        this.createLabelBlock(chat.blockTypeLabel, vipStr, chat.colorTbl.yellow);
                    }
                } else {
                    if (this.is_guide === 1) {
                        this.createLabelBlock(chat.blockTypeLabel, "[新手指导员]", chat.colorTbl.green);
                    }

                    var event = {
                        eventType: "N",
                        privateChatName: this.senderName,
                        privateChatId: this.senderId
                    };
                    this.registerEvent(event);
                    this.getPlayerColorHrefName(this.senderName, chat.hrefEventId);

                    if (!!this.vip && this.vip > 0) {
                        var vipStr = "[VIP" + this.vip + "]";
                        this.createLabelBlock(chat.blockTypeLabel, vipStr, chat.colorTbl.yellow);
                    }
                }
            }
            if (msg_data.broadId) {
                if (maskId===ChatMaskId.GUILDMASK) {
                    this.createLabelBlock(chat.blockTypeLabel,"公告", chat.colorTbl.red);
                }
                
                this.createLabelBlock(chat.blockTypeLabel, ":", chat.colorTbl.cyan);
                this.parseBroadcast(msg_data);
                return;
            }

            this.createLabelBlock(chat.blockTypeLabel, ":", chat.colorTbl.cyan);
        }

        // cc.log("msg_data.team_id=" + msg_data.team_id);
        // if (msg_data.team_id === _G.Constant.CONST_CHAT_TYPE_TEAM) {

        //     // local _,_,teamId,copyId=string.find(chat_msg, "<#T(%d+)><#T(%d+)>")

        //     cc.log("chat_msg=", chat_msg, "teamId=", teamId, "copyId=", copyId);
        //     if (!teamId || !copyId) {
        //         return;
        //     }

        //     this.createLabelBlock(chat.blockTypeLabel, "邀你共战", chat.bodyColor[this.channelId]);

        //     var copy_reward = _G.GameConfig.copy_reward[Number(copyId)];
        //     var copyName = null;
        //     if (!!copy_reward) {
        //         copyName = copy_reward.copy_name;
        //     } else {
        //         cc.log("copy_reward无数据 copyId=%s", String(copyId));
        //         return
        //     }

        //     this.createLabelBlock(chat.blockTypeLabel, copyName, chat.colorTbl.red);
        //     this.createLabelBlock(chat.blockTypeLabel, "组队副本，", chat.bodyColor[this.channelId]);

        //     if (_G.g_characterProperty.m_lpMainPlay !== null && self.senderId === _G.g_characterProperty.m_lpMainPlay.uid) {
        //         this.createLabelBlock(chat.blockTypeLabel, "点击进入", chat.colorTbl.green);
        //     } else {

        //         var event = {
        //             eventType: "T",
        //             teamId: Number(teamId),
        //             copyId: copyId
        //         };
        //         this.registerEvent(event);

        //         this.createHerfLabelBlock(chat.hrefEventId, chat.blockTypeBracketHerfLabel, "[点击进入]", chat.colorTbl.green);
        //     }
        //     return;
        // } else if (msg_data.team_id == _G.Constant.CONST_CHAT_TYPE_CLAN) {
        //     var factionId, factionName = string.find(chat_msg, "<#F(%d+)><#F(.*)>");
        //     factionName = factionName || ""
        //     if (factionId === null)
        //         return;

        //     this.createLabelBlock(chat.blockTypeLabel, "诚邀各路英雄加入", chat.bodyColor[this.channelId])
        //     this.createLabelBlock(chat.blockTypeLabel, factionName, chat.colorTbl.red)
        //     this.createLabelBlock(chat.blockTypeLabel, "帮派，", chat.bodyColor[this.channelId])

        //     _G.hrefEventId = _G.hrefEventId + 1
        //     var event = {
        //         eventType: "F",
        //         factionId: Number(factionId)
        //     };
        //     this.registerEvent(event);
        //     this.createHerfLabelBlock(chat.hrefEventId, chat.blockTypeBracketHerfLabel, "[点击加入]", chat.colorTbl.green)
        //     return;
        // } else if (msg_data.team_id == _G.Constant.CONST_CHAT_TYPE_CLAN_NOTICE) {
        //     this.m_blockLists = [];
        //     var messageBlock = this.createLabelBlock(chat.blockTypeLabel, "[帮主]", chat.colorTbl.red);
        //     this.m_blockLists.push(messageBlock);
        //     chat_msg = "公告:" + chat_msg;

        //     this.createLabelBlock(chat.blockTypeLabel, chat_msg, chat.bodyColor[this.channelId]);
        //     return;
        // }

        if(!!chat_msg)
            this.parseFaceAndGoods(chat_msg);
    }
});


chat.SystemMessage = chat.BaseMessage.extend({
    ctor: function() {
        this.messageId = "S";
        this.eventList = {};

        this.m_blockLists = [];
        this.m_priorityLevel=5;
    },

    parse:function(msg_data){
        this.channelId=msg_data.channelId;
        this.getHeader();
        this.createLabelBlock(chat.blockTypeLabel,":",chat.bodyColor[this.channelId]);
        this.parseBroadcast(msg_data);
    }
});

chat.TextMessage = chat.BaseMessage.extend({
    ctor: function() {
        this.m_blockLists = [];
    },
    parse: function(msg_data) {
        this.createLabelBlock(chat.blockTypeLabel, msg_data, chat.colorTbl.yellow);
    }
});


chat.MessageParser = cc.Class.extend({
    ctor: function() {},
    generateMessage: function(messageId) {
        var newMessage = null;
        if (messageId === "C") {
            newMessage = new chat.ChatMessage();
        } else if (messageId === "S") {
            newMessage = new chat.SystemMessage();
        } else if (messageId === "M") {
            // newMessage = new chat.MarqueeMessage();
            newMessage = new chat.SystemMessage();
        }
        return newMessage;
    },
    parse: function(msg_data) {
        var newMessage = this.generateMessage(msg_data.messageId);
        newMessage.parse(msg_data);

        var newBlockLists = [];
        var blockLists = newMessage.m_blockLists;
        for (var blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
            var block = blockLists[blockIndex]
            if (!!block && block.checkAvailable()) {
                newBlockLists.push(block);
            } else {
                cc.log("ERROR: nil block block.m_blockType=" + block.m_blockType + ",block.m_text=" + block.m_text);
            }
        }
        newMessage.m_blockLists = newBlockLists;
        newMessage.createLabelBlock(chat.blockTypeLabel, "\n", chat.bodyColor[newMessage.channelId]);
        return newMessage;
    }

});

cb.ChatManager = cc.Class.extend({
    ctor: function() {

        this.maxMsgCount = 30;

        this.comprehensiveMsgs = [];
        this.worldMsgs = [];
        this.areaMsgs = [];
        this.fractionMsgs = [];
        this.teamMsgs = [];
        this.loudspeakerMsgs = [];
        this.privateMsgs = [];
        this.smallMsgs = [];
        this.systemMsgs = [];

        this.messageParser = new chat.MessageParser();
        this.marqueeManager=cb.MarqueeManager.getInstance();

        this.chatItems={};
    },

    send: function(msg) {
        chatHandler.send(msg);
    },

    addMsg: function(msgsArray, msg) {
        while (msgsArray.length > this.maxMsgCount) {
            msgsArray.shift();
        }
        msgsArray.push(msg);
    },

    addComprehensiveMsg: function(msg) {
        while (this.comprehensiveMsgs.length > this.maxMsgCount) {
            this.comprehensiveMsgs.shift();
        }
        this.comprehensiveMsgs.push(msg);
        this.addSmallMsg(msg)
    },

    addSmallMsg: function(msg) {
        while (this.smallMsgs.length >= 4) {
            this.smallMsgs.shift();
        }
        this.smallMsgs.push(msg);
    },

    processUserMsg: function(msg_data) {
        var channel=chat.channel;
        if (msg_data.channelId===channel.System) {
            msg_data.messageId = "S";
        }else if(msg_data.channelId===channel.Marquee) {
            msg_data.channelId=channel.System;
            msg_data.messageId = "M";
        }else{
            msg_data.messageId = "C";
        }
                
        var newMessage = this.messageParser.parse(msg_data);
        //综合频道
        if (msg_data.channelId === 0) {
            cc.log("普通频道收到消息======================");
            return;
        }

        this.addComprehensiveMsg(newMessage);
        switch (msg_data.channelId) {
            //世界频道
            case channel.World:
                cc.log("世界频道收到消息======================");
                this.addMsg(this.worldMsgs, newMessage);
                break;
                //地区频道
            case channel.Area:
                cc.log("地区频道收到消息======================");
                this.addMsg(this.areaMsgs, newMessage);
                break;
                //公会频道
            case channel.Faction:
                cc.log("公会频道收到消息======================");
                this.addMsg(this.fractionMsgs, newMessage);
                break;
                //组队频道
            case channel.Team:
                cc.log("组队频道收到消息======================");
                this.addMsg(this.teamMsgs, newMessage);
                break;
                //私聊频道
            case channel.Private:
                cc.log("私聊频道收到消息======================");
                this.addMsg(this.privateMsgs, newMessage);
                break;
                //系统频道
            case channel.System:
                cc.log("系统频道收到消息======================");
                this.addMsg(this.systemMsgs, newMessage);
                if (msg_data.messageId === "M") {
                    this.showMarqueeInfo(newMessage);
                }
                // this.showMarqueeInfo(newMessage);
                break;
            //     //喇叭频道
            // case chat.channel.Marquee:
            //     cc.log("喇叭频道收到消息======================");
            //     this.addMsg(this.systemMsgs, newMessage);
            //     this.showMarqueeInfo(newMessage);
            //     break;
        }

        if(layerManager.isRunPanel(cb.kMChatPanelId))
        {
            var curPanel=layerManager.curPanel;
            curPanel.notifyReceiveMsg();
        }

        if(!!mainPanel)
        {
            mainPanel.notifyReceiveMsg();
        }

        // cc.log("senderId="+newMessage.senderId);
        if (newMessage.senderId) {
            while(true){
                var area=app.getCurArea();
                if(!area) break;
                var player=area.getPlayer(newMessage.senderId);
                if (!player) break;
                player.pushMessage(newMessage);
                break;
            }
        }
        // app.curPlayer.notifyReceiveMsg();
        return newMessage;
    },

    processSystemMsg: function(msg_data) {
        cc.log("processSystemMsg==============>>");
        if (!msg_data.channelId) {
            msg_data.channelId = chat.channel.System;
        }
        // msg_data.messageId = "S";
        this.processUserMsg(msg_data);
        cc.log("processSystemMsg====================<<");
    },

    showMarqueeInfo: function(message) {
        cc.log("showMarqueeInfo=======>>>");
        var blockLists = message.m_blockLists;
        var marqueeManager=this.marqueeManager;
        for (var blockIndex = 0; blockIndex < blockLists.length; blockIndex++) {
            var block = blockLists[blockIndex];
            if (block.m_blockType === chat.blockTypeLabel 
                || block.m_blockType === chat.blockTypeBracketHerfLabel
                || block.m_blockType === chat.blockTypeHerfLabel
                ) {
                if(block.m_text!=="\n" 
                    && block.m_text!=="[公告]"
                    && block.m_text!==":"
                    ){
                    marqueeManager.setTextColor(block.m_color);
                    marqueeManager.appendRichText(block.m_text);
                }
            } else if (block.m_blockType === chat.blockTypeSprite) {
                marqueeManager.appendRichSprite(block.m_spriteName);
            }
        }
        marqueeManager.startMarquee();
        cc.log("showMarqueeInfo=======<<<");
    },

    addChatItem:function(chatItem){
        this.chatItems[chatItem.id]=chatItem;
    },

    getChatItem: function(itemId, worldPoint) {
        var chatItem=this.chatItems[itemId];
        if (chatItem) {
            var itemDetailLayer = new cb.ItemDetailLayer(chatItem)
            itemDetailLayer.setPosition(worldPoint);
            return;
        }

        var self = this;
        chatHandler.getChatItem(itemId, function(data) {
            if (data.id) {
                var chatItem = data;
                chatItem.type = EntityType.EQUIPMENT;
                chatItem.noShare = true;
                self.addChatItem(chatItem);
                var itemDetailLayer = new cb.ItemDetailLayer(chatItem)
                itemDetailLayer.setPosition(worldPoint);
            } else {
                quickLogManager.pushLog("很抱歉，物品信息已丢失。", 4);
            }
        });
    }
});

var chatManager = new cb.ChatManager()


