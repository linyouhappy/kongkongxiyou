cb.ItemDetailLayer = cc.Class.extend({
    ctor: function(item) {
        if (!item.id) {
            item.id=item.itemId;
        }
        var ccsNode = null;
        this.type = item.type;
        this.item = item;
        if (this.type === EntityType.EQUIPMENT) {
            ccsNode = ccs.CSLoader.createNode("uiccs/EquipmentLayer.csb");
        } else {
            ccsNode = ccs.CSLoader.createNode("uiccs/ItemLayer.csb");
        }
        // var colorSprite = ccsNode.getChildByName("colorSprite");
        var iconSprite = ccsNode.getChildByName("iconSprite");
        var itemNameText = ccsNode.getChildByName("itemNameText");
        var needLevelText = ccsNode.getChildByName("needLevelText");
        var shareBtn=ccsNode.getChildByName("shareBtn");
        if (item.noShare) {
            shareBtn.removeFromParent();
        } else {
            shareBtn.setPressedActionEnabled(true);
            var touchEvent = function(sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    var chatData = {
                        dataType: 2,
                        item: item
                    };
                    layerManager.openPanel(cb.kMChatPanelId, chatData);
                    this.closeLayer();
                }
            }
            shareBtn.addTouchEventListener(touchEvent, this);
        }

        this.ccsNode = ccsNode;
        this.m_width = 400;

        var itemData = item.itemData;
        if(!itemData){
            if (item.type === EntityType.EQUIPMENT) {
                itemData = dataApi.equipment.findById(item.kindId);
            }else{
                itemData=dataApi.item.findById(item.kindId);
            }
        }
        imgPath = "icon/item/item_" + itemData.skinId + ".png";
        iconSprite.setTexture(imgPath);
        iconSprite.setScale(70/iconSprite.getContentSize().width);

        itemNameText.setString(itemData.name);
        needLevelText.setString("等级" + itemData.heroLevel);

        var curPlayer = app.getCurPlayer();
        if(itemData.heroLevel>curPlayer.level){
            needLevelText.setTextColor(cc.color(255,0,0,255));
        }

        if (this.type === EntityType.EQUIPMENT) {
            var totalText = ccsNode.getChildByName("totalText");
            var baseText = ccsNode.getChildByName("baseText");
            var activeText = ccsNode.getChildByName("activeText");
            var percentText = ccsNode.getChildByName("percentText");
            var potentialText = ccsNode.getChildByName("potentialText");
            var priceText=ccsNode.getChildByName("priceText");
            var jobSprite=ccsNode.getChildByName("jobSprite");
            if (!item.jobId) {
                jobSprite.removeFromParent();
            }else{
                if (item.jobId===2) {
                    jobSprite.setSpriteFrame("icon_job_2.png");
                }
            }
            if (item.bind) {
                var bindText=ccsNode.getChildByName("bindText");
                bindText.setVisible(true);
                var contentSize=itemNameText.getContentSize();
                var position=itemNameText.getPosition();
                bindText.setPositionX(position.x+contentSize.width+5);
            }

            var activeValue = Math.floor(item.potential * item.percent / 100);
            var totalValue = item.baseValue + activeValue;
            var propertyName = PropertyNames[itemData.kind];
            // var totalPrice=totalValue+Math.floor(consts.recycleRatio*item.potential * (100-item.percent) / 100);
            var totalPrice=formula.calItemPrice(item);
            priceText.setString(totalPrice);

            var level=Math.ceil(item.totalStar / 2);
            totalText.setTextColor(colorTbl[level]);
            baseText.setTextColor(colorTbl[level]);
            activeText.setTextColor(colorTbl[level]);
            percentText.setTextColor(colorTbl[level]);
            potentialText.setTextColor(colorTbl[level]);

            //总属性
            var showString = propertyName + " +" + totalValue;
            totalText.setString(showString);
            //基础属性
            showString = propertyName + " +" + item.baseValue;
            baseText.setString(showString);
            //激活属性
            showString = propertyName + " +" + activeValue;
            activeText.setString(showString);
            //潜能激活
            showString = item.percent + "%";
            percentText.setString(showString);
            //总潜能
            showString = propertyName + " " + item.potential;
            potentialText.setString(showString);

            var totalStar = item.totalStar;
            var starCount = Math.floor(totalStar / 2);
            var starSprite;
            for (var i = 1; i <= starCount && i <= 6; i++) {
                starSprite = ccsNode.getChildByTag(1000 + i);
                starSprite.setSpriteFrame("star_gold.png");
            }
            if (totalStar % 2 === 1) {
                starCount++;
                starSprite = ccsNode.getChildByTag(1000 + starCount);
                starSprite.setSpriteFrame("star_half_gold.png");
            }
        } else {
            var priceText= ccsNode.getChildByName("priceText");
            priceText.setString(itemData.price);

            var descText= ccsNode.getChildByName("descText");
            descText.setContentSize(cc.size(320,100));
            descText.setString(itemData.desc);
        }

        this.openBgTouch();
        if (!mainPanel)
            return;
        var areaScene = mainPanel;
        this.ccsNode.setLocalZOrder(250);
        areaScene.addChild(this.ccsNode);
    },

    closeLayer: function() {
        this.ccsNode.removeFromParent();
        if (this.otherItemDetailLayer) {
            this.otherItemDetailLayer.otherItemDetailLayer = null;
            this.otherItemDetailLayer.closeLayer();
        }
    },

    openBgTouch: function() {
        var self = this;
        var onTouchBegan = function(touch, event) {
            if (self.otherItemDetailLayer) {
                var location = self.otherItemDetailLayer.ccsNode.convertTouchToNodeSpace(touch);
                if (location.x >= 0 && location.x <= self.m_width && location.y >= -self.m_height && location.y <= 0) {
                    // self.ccsNode.removeFromParent();
                    return false;
                }
            }
            return true;
        };

        var onTouchEnded = function(touch, event) {
            var location = self.ccsNode.convertTouchToNodeSpace(touch);
            if (!(location.x >= 0 && location.x <= self.m_width && location.y >= -self.m_height && location.y <= 0)) {
                // self.ccsNode.removeFromParent();
                self.closeLayer();
            }
        };

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this.ccsNode);
    },

    enableBg: function() {
        if (this.bgSprite) return;

        var bgSprite = cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
        bgSprite.setContentSize(cc.size(cc.winSize.width * 2, cc.winSize.height * 2));
        this.ccsNode.addChild(bgSprite);
        bgSprite.setLocalZOrder(-1);
        bgSprite.setOpacity(150);
        this.bgSprite = bgSprite;
    },

    operateCmd: function(cmdId) {
        switch (cmdId) {
            //丢弃
            case 10001:
                tipsBoxLayer.showTipsBox("确定要丢弃该物品？不可撤销。");
                var kindId=this.item.kindId;
                tipsBoxLayer.enableDoubleBtn(function(isYesOrNo) {
                    if (isYesOrNo) {
                        equipHandler.dropItem(kindId);
                    }
                });
                break;
                //穿上
            case 10002:
                equipHandler.equip(this.item.id);
                break;
                //脱下
            case 10003:
                equipHandler.unEquip(this.item.itemData.kind);
                break;
                //使用
            case 10004:
                var itemType=this.item.itemData.kind;
                if (itemType===ItemType.ItemHP 
                    ||itemType===ItemType.ItemMP) {
                    layerManager.openPanel(cb.kMMakeDrugPanelId);
                } else if (itemType===ItemType.ItemStone) {
                    layerManager.openPanel(cb.kMBuildPanelId);
                }else{
                    equipHandler.useItem(this.item.kindId);
                }
                break;
                //出售
            case 10005:
                equipHandler.sellItem(this.item.id);
                break;
            case 10006:
                guildManager.requestPlayerItem(this.item);
                break;
        }
        this.closeLayer();
    },

    touchEvent: function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            this.operateCmd(sender.getTag());
        }
    },

    setBagPosition: function(isSetGrayBg) {
        var ccsNode = this.ccsNode;
        var leftBtn = ccsNode.getChildByName("leftBtn");
        var rightBtn = ccsNode.getChildByName("rightBtn");

        leftBtn.addTouchEventListener(this.touchEvent, this);
        rightBtn.addTouchEventListener(this.touchEvent, this);

        if (this.type === EntityType.EQUIPMENT) {
            leftBtn.setTag(10002);
            rightBtn.setTag(10005);
            rightBtn.setTitleText("出  售");
            this.m_height = 420;
        } else {
            leftBtn.setTag(10004);
            rightBtn.setTag(10001);
            this.m_height = 340;
        }
        var bgImage = ccsNode.getChildByName("bgImage");
        var frameImage = ccsNode.getChildByName("frameImage");
        var contentSize = cc.size(this.m_width, this.m_height);
        bgImage.setContentSize(contentSize);
        frameImage.setContentSize(contentSize);

        var x = cc.winSize.width / 2 + 15;
        var y = cc.winSize.height / 2 + this.m_height / 2;
        ccsNode.setPosition(x, y);

        if (isSetGrayBg)
            this.enableBg();
    },

    setEquipPosition: function(isSetGrayBg) {
        var ccsNode = this.ccsNode;
        if (this.type === EntityType.EQUIPMENT) {
            this.m_height = 420;

            var leftBtn = ccsNode.getChildByName("leftBtn");
            var rightBtn = ccsNode.getChildByName("rightBtn");
            rightBtn.removeFromParent();

            leftBtn.setTitleText("脱  下");
            leftBtn.setPosition(200, leftBtn.getPositionY());
            leftBtn.addTouchEventListener(this.touchEvent, this);
            leftBtn.setTag(10003);
        }
        var x = cc.winSize.width / 2 - 15 - this.m_width;
        var y = cc.winSize.height / 2 + this.m_height / 2;
        ccsNode.setPosition(x, y);

        if (isSetGrayBg)
            this.enableBg();
    },

    setGuildPosition: function(worldPoint) {
        var ccsNode = this.ccsNode;
        if (this.type === EntityType.EQUIPMENT) {
            this.m_height = 420;

            var leftBtn = ccsNode.getChildByName("leftBtn");
            var rightBtn = ccsNode.getChildByName("rightBtn");
            rightBtn.removeFromParent();

            leftBtn.setTitleText("兑换装备");
            leftBtn.setPosition(200, leftBtn.getPositionY());
            leftBtn.addTouchEventListener(this.touchEvent, this);
            leftBtn.setTag(10006);

            var priceText=ccsNode.getChildByName("priceText");
            var totalPrice=formula.calItemPrice(this.item)*2;
            priceText.setString(totalPrice);

            var priceNameText=ccsNode.getChildByName("priceNameText");
            priceNameText.setString("兑换积分:");
        }
        if (!worldPoint) {
            worldPoint=cc.p(cc.winSize.width/2,cc.winSize.height/2);
        }

        if (worldPoint.y - this.m_height - 5 < 0)
            worldPoint.y = this.m_height + 5;

        if (worldPoint.x > cc.winSize.width / 2)
            worldPoint.x = worldPoint.x - this.m_width;

        ccsNode.setPosition(worldPoint);
    },

    setPosition: function(worldPoint, isSetGrayBg) {
        var ccsNode = this.ccsNode;
        var leftBtn = ccsNode.getChildByName("leftBtn");
        var rightBtn = ccsNode.getChildByName("rightBtn");
        leftBtn.removeFromParent();
        rightBtn.removeFromParent();
        if (this.type === EntityType.EQUIPMENT) {
            this.m_height = 360;

            var bgImage = ccsNode.getChildByName("bgImage");
            var frameImage = ccsNode.getChildByName("frameImage");
            var contentSize = cc.size(this.m_width, this.m_height);
            bgImage.setContentSize(contentSize);
            frameImage.setContentSize(contentSize);
        } else {
            this.m_height = 340;
        }
        
        if (!worldPoint) {
            worldPoint=cc.p(cc.winSize.width/2,cc.winSize.height/2);
        }

        if (worldPoint.y - this.m_height - 5 < 0)
            worldPoint.y = this.m_height + 5;

        if (worldPoint.x > cc.winSize.width / 2)
            worldPoint.x = worldPoint.x - this.m_width;

        ccsNode.setPosition(worldPoint);

        if (isSetGrayBg)
            this.enableBg();
    }
});