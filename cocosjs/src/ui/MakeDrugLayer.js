
cb.MakeDrugLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
        var bgSprite=cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
        bgSprite.setContentSize(cc.size(cc.winSize.width,cc.winSize.height));
        this.addChild(bgSprite);
        bgSprite.setOpacity(150);

        var ccsNode = ccs.CSLoader.createNode("uiccs/MakeDrugLayer.csb");
        this.addChild(ccsNode);
        this._ccsNode=ccsNode;

        ccsNode.setScale(0.1);
        ccsNode.runAction(cc.ScaleTo.create(0.2,1));

        this.openBgTouch();
        this._initRefineView(ccsNode);
        this._initBagView(ccsNode);
    },

    _initRefineView:function(ccsNode){
        var closeBtn = ccsNode.getChildByName("closeBtn");
        if (closeBtn) {
            var self=this;
            var touchEvent=function(sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    layerManager.closePanel(self);
                }
            }
            closeBtn.addTouchEventListener(touchEvent, this);
            closeBtn.setPressedActionEnabled(true);
            closeBtn.setLocalZOrder(1000);
            closeBtn.setPosition(cc.winSize.width / 2 - 50, cc.winSize.height / 2 - 40);

            closeBtn.setSoundEffectFile("sound/ui/button_close.mp3");
        }

        var updateNode=ccsNode.getChildByName("updateNode");
        var refineNode=ccsNode.getChildByName("refineNode");
        refineNode.setVisible(false);

        var bottleItemBox = cb.ItemBox.create();
        bottleItemBox.setDefaultSetting();
        bottleItemBox.enableEvent(true);
        ccsNode.addChild(bottleItemBox);
        // var self = this;
        // var onItemBoxCallback = function(itemBox) {
        //     if (!self.curEquipment) return;

        //     var worldPoint = itemBox.convertToWorldSpace(cc.p(0, 0));
        //     var itemDetailLayer = new cb.ItemDetailLayer(self.curEquipment)
        //     itemDetailLayer.setPosition(worldPoint);
        // };
        // bottleItemBox.addEventListener(onItemBoxCallback);
        this.bottleIconLPoint=cc.p(165,115);
        this.bottleIconRPoint=cc.p(258,115);
        bottleItemBox.setPosition(this.bottleIconLPoint);
        this.bottleItemBox=bottleItemBox;

        this.makeBtn=ccsNode.getChildByName("makeBtn");
        this.makeBtn.addTouchEventListener(this.touchEvent,this);
        this.makeBtn.setSoundEffectFile("");

        //update
        // this.curNameText=updateNode.getChildByName("curNameText");
        this.curCountText=updateNode.getChildByName("curCountText");
        this.curSpeedText=updateNode.getChildByName("curSpeedText");
        this.nextCountText=updateNode.getChildByName("nextCountText");
        // this.nextNameText=updateNode.getChildByName("nextNameText");
        this.nextSpeedText=updateNode.getChildByName("nextSpeedText");
        this.playerLvText=updateNode.getChildByName("playerLvText");
        this.caoCoinText=updateNode.getChildByName("caoCoinText");

        //refine
        this.countSlider=refineNode.getChildByName("countSlider");
        this.lvText=refineNode.getChildByName("lvText");
        this.speedText=refineNode.getChildByName("speedText");
        this.countText=refineNode.getChildByName("countText");
        this.capacityText=refineNode.getChildByName("capacityText");

        var self=this;
        var sliderEvent=function(sender, type){
            if(type===ccui.Slider.EVENT_PERCENT_CHANGED){
                var percent = sender.getPercent();
                var itemCount=Math.ceil(self.selectItem.count*percent/100);
                self.setItemCount(itemCount);
            }else if(type===ccui.Slider.EVENT_SLIDEBALL_UP){
                var containCount=self.selectBItem.capacity-self.selectBItem.count;
                if (containCount<0) {
                    quickLogManager.pushLog("已经装满，不能再提炼！",4);
                    self.setItemCount(0);
                    return;
                }
                containCount=Math.ceil(containCount/self.selectItem.perCount);
                if (containCount<self.itemCount) {
                    self.setItemCount(containCount);
                    quickLogManager.pushLog("指定数量超过容量！",4);
                }
            }
        };
        this.countSlider.addEventListener(sliderEvent);
//
        var iconItemBox = cb.ItemBox.create();
        iconItemBox.setDefaultSetting();
        iconItemBox.enableEvent(true);
        refineNode.addChild(iconItemBox);
        iconItemBox.setPosition(70,322);
        this.iconItemBox=iconItemBox;

        this.updateNode=updateNode;
        this.refineNode=refineNode;
        this.modeType=1;
    },

    setItemCount:function(itemCount){
        this.itemCount=itemCount;
        var countText=formula.bigNumber2Text(itemCount);
        this.iconItemBox.setRightDownLabelString(countText);

        countText=formula.bigNumber2Text(itemCount*this.selectItem.perCount);
        this.bottleItemBox.setRightDownLabelString(countText);

        var percent=Math.floor(itemCount*100/this.selectItem.count);
        this.countSlider.setPercent(percent);
    },

    makeDrug: function() {
        var containCount = this.selectBItem.capacity - this.selectBItem.count;
        if (containCount < 0) {
            quickLogManager.pushLog("已经装满，不能再提炼！", 4);
            return;
        }
        if (!this.itemCount) {
            quickLogManager.pushLog("请先指定需要提炼的数量！", 4);
            return;
        }
        var item = this.selectItem;
        equipHandler.refineHpMp(item.kind, item.kindId, this.itemCount);

        this.makeDrugEffect();
        soundManager.playEffectSound("sound/ui/make_drug.mp3");
    },

    makeDrugEffect: function() {
        var selectSprite = new cc.Sprite();
        var clickEfectAnim = cb.CommonLib.genarelAnimation("effect/effect_strength.plist", "effect_strength_");
        sequence = cc.Sequence.create(
            cc.Animate.create(clickEfectAnim),
            cc.RemoveSelf.create()
        );
        selectSprite.runAction(sequence);
        selectSprite.setPosition(73,115);
        this._ccsNode.addChild(selectSprite);
    },

    upgradeDev: function() {
        var item = this.selectBottleItem;
        if (!item.nextCapacity) {
            quickLogManager.pushLog("已升级完毕！", 4);
            return;
        }
        var curPlayer = app.getCurPlayer();
        if (item.playerLv > curPlayer.level) {
            quickLogManager.pushLog("玩家等级不够，无法升级！", 4);
            return;
        }
        if (item.caoCoin > curPlayer.caoCoin) {
            quickLogManager.pushLog("炒币不足，无法升级！", 4);
            return;
        }
        equipHandler.upgradeHpMp(item.kind);
        soundManager.playEffectSound("sound/ui/skill_upgrade.mp3");
    },

    touchEvent:function(sender, type) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            if (this.modeType===1) {
                this.upgradeDev();
                // soundManager.playEffectSound("sound/ui/select_role_2"+index+".mp3");
            }else{
                this.makeDrug();
            }
        }
    },

    _initBagView:function(ccsNode){
        var container=ccsNode.getChildByName("container");
        var contentSize = container.getContentSize();

        var itemBoxLayer = cb.ItemBoxLayer.create();
        itemBoxLayer.setLimitColumn(3);
        itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(93, 90));
        itemBoxLayer.enableEvent(true);
        container.addChild(itemBoxLayer);

        var self = this;
        var onItemBoxLayerCallback = function(position, itemBox) {
            var item=self.items[position-1];
            if (position<3) {
                self.setSelectBottleItem(item);
            }else{
                
                self.setSelectItem(item);
            }
        };
        itemBoxLayer.addEventListener(onItemBoxLayerCallback);
        this.itemBoxLayer = itemBoxLayer;

        itemBoxLayer.setItemCount(12);

        this.hpBottleItem={
            itemData:{
                skinId:10001,
                kind:1
            },
            count:9999
        };

        this.mpBottleItem={
            itemData:{
                skinId:10002,
                kind:2
            },
            count:9999
        };
        this.updateData();

        this.setSelectBottleItem(this.mpBottleItem);
    },

    setModeType:function(modeType){
        this.makeBtn.setEnabled(true);
        if(this.modeType===modeType)
            return;
        this.modeType=modeType;
        this.refineNode.stopAllActions();
        this.updateNode.stopAllActions();
        var sequence;
        if (modeType===1) {
            sequence = cc.Sequence.create(
                cc.FadeOut.create(0.5),
                cc.Hide.create()
            );
            this.refineNode.runAction(sequence);
            this.bottleItemBox.runAction(cc.MoveTo.create(0.5,this.bottleIconLPoint));
            sequence = cc.Sequence.create(
                cc.DelayTime.create(0.5),
                cc.Show.create(),
                cc.FadeIn.create(0.5)
            );
            this.updateNode.runAction(sequence);
        }else{
            sequence = cc.Sequence.create(
                cc.FadeOut.create(0.5),
                cc.Hide.create()
            );
            this.updateNode.runAction(sequence);
            this.bottleItemBox.runAction(cc.MoveTo.create(0.5,this.bottleIconRPoint));
            sequence = cc.Sequence.create(
                cc.DelayTime.create(0.5),
                cc.Show.create(),
                cc.FadeIn.create(0.5)
            );
            this.refineNode.runAction(sequence);
            this.makeBtn.setTitleText("提  炼");
        }
    },

    setSelectBottleItem:function(item){
        this.selectBottleItem=item;
        this.setModeType(1);
        var imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
        this.bottleItemBox.setIconSprite(imgPath);
        this.bottleItemBox.adjustIconSprite(55);
        this.bottleItemBox.setRightDownLabelString("Lv."+item.level);

        if (item.kind === ItemType.ItemHP) {
            this.bottleItemBox.setColorSprite("item_color_5.png");
        } else {
            this.bottleItemBox.setColorSprite("item_color_3.png");
        }

        this.curCountText.setString(item.capacity);
        this.curSpeedText.setString(item.speed+"/次");

        if (item.nextCapacity) {
            this.nextCountText.setString(item.nextCapacity);
            this.nextSpeedText.setString(item.nextSpeed+"/次");
            this.playerLvText.setString(item.playerLv+"级");
            this.caoCoinText.setString(item.caoCoin);

            var curPlayer = app.getCurPlayer();
            if (item.playerLv<=curPlayer.level) {
                this.playerLvText.setTextColor(cc.color(255,255,0,255));
            }else{
                this.playerLvText.setTextColor(cc.color(255,0,0,255));
            }

            if (item.caoCoin<=curPlayer.caoCoin) {
                this.caoCoinText.setTextColor(cc.color(255,255,0,255));
            }else{
                this.caoCoinText.setTextColor(cc.color(255,0,0,255));
            }
            this.makeBtn.setTitleText("升  级");
        }else{
            this.nextCountText.setString(item.capacity);
            this.nextSpeedText.setString(item.speed+"/次");
            this.playerLvText.setString("0级");
            this.caoCoinText.setString("0");
            this.playerLvText.setTextColor(cc.color(255,255,0,255));
            this.caoCoinText.setTextColor(cc.color(255,255,0,255));
            this.makeBtn.setEnabled(false);
            this.makeBtn.setTitleText("升级完成");
        }
    },

    setSelectItem:function(item){
        if(!item) return;

        this.selectItem=item;
        this.itemCount=0;

        this.setModeType(2);
        var imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
        this.iconItemBox.setIconSprite(imgPath);
        this.iconItemBox.adjustIconSprite();
        this.iconItemBox.setRightDownLabelString("0");

        if (item.kind === ItemType.ItemHP) {
            this.iconItemBox.setColorSprite("item_color_5.png");
            this.bottleItemBox.setColorSprite("item_color_5.png");
        } else {
            this.iconItemBox.setColorSprite("item_color_3.png");
            this.bottleItemBox.setColorSprite("item_color_3.png");
        }

        if (item.kind===1) {
            item.perCount=item.itemData.hp;
            this.selectBItem=this.hpBottleItem;
        }else if (item.kind===2){
            item.perCount=item.itemData.mp;
            this.selectBItem=this.mpBottleItem;
        }
        var bottleItem=this.selectBItem;

        this.lvText.setString(bottleItem.level);
        this.speedText.setString(bottleItem.speed+"/次");
        this.countText.setString(bottleItem.count);
        this.capacityText.setString(bottleItem.capacity);

        if (bottleItem.count>=bottleItem.capacity) {
            this.countText.setTextColor(cc.color(255,0,0,255));
        }else{
            this.countText.setTextColor(cc.color(255,255,0,255));
        }

        this.countSlider.setPercent(0);

        imgPath = "icon/item/item_" + bottleItem.itemData.skinId + ".png";
        this.bottleItemBox.setIconSprite(imgPath);
        this.bottleItemBox.setRightDownLabelString("0");
        this.bottleItemBox.adjustIconSprite(55);

        this.setModeType(2);
    },

    setPanelData:function(){

    },

    updatePanel:function(data){
        if (data===1) {
            this.updateBottleData();
            this.setSelectBottleItem(this.selectBottleItem);
        }else{
            this.updateData();
            this.setSelectItem(this.selectItem);
        }
    },

    updateBottleData:function(){
        var curPlayer = app.getCurPlayer();
        var hpBottleItem=this.hpBottleItem;
        var mpBottleItem=this.mpBottleItem;

        hpBottleItem.count=curPlayer.hpCount;
        hpBottleItem.level=curPlayer.hpLevel;
        hpBottleItem.speed = curPlayer.hpSpeed;
        hpBottleItem.capacity = curPlayer.hpCapacity;
        hpBottleItem.kind=1;

        var hpmpData = dataApi.hpmp.findById(curPlayer.hpLevel+1);
        if (hpmpData) {
            hpBottleItem.nextSpeed = hpmpData.hpSpeed;
            hpBottleItem.nextCapacity = hpmpData.hpCapacity;
            hpBottleItem.playerLv=hpmpData.playerLv;
            hpBottleItem.caoCoin=hpmpData.caoCoin;
        }else{
            hpBottleItem.nextSpeed = null;
            hpBottleItem.nextCapacity = null;
        }

        mpBottleItem.count=curPlayer.mpCount;
        mpBottleItem.level=curPlayer.mpLevel;
        mpBottleItem.speed = curPlayer.mpSpeed;
        mpBottleItem.capacity = curPlayer.mpCapacity;
        mpBottleItem.kind=2;

        hpmpData = dataApi.hpmp.findById(curPlayer.mpLevel+1);
        if (hpmpData) {
            mpBottleItem.nextSpeed = hpmpData.mpSpeed;
            mpBottleItem.nextCapacity = hpmpData.mpCapacity;
            mpBottleItem.playerLv=hpmpData.playerLv;
            mpBottleItem.caoCoin=hpmpData.caoCoin;
        }else{
            mpBottleItem.nextSpeed = null;
            mpBottleItem.nextCapacity = null;
        }
    },

    updateData:function(){
        this.updateBottleData();

        var hpBottleItem=this.hpBottleItem;
        var mpBottleItem=this.mpBottleItem;

        var itemBox,item, imgPath;
        var items=[];
        items.push(hpBottleItem);
        items.push(mpBottleItem);

        var tmpItems=bagManager.items;
        for (var key in tmpItems) {
            item=tmpItems[key];
            if (item.kind===ItemType.ItemHP
                ||item.kind===ItemType.ItemMP) {
                items.push(item);
            }
        }

        this.items=items;

        var itemCount=items.length+4;
        itemCount=Math.max(itemCount,15);
        this.itemBoxLayer.setItemCount(itemCount);
        
        for (var i = 0; i < items.length; i++) {
            item = items[i];

            itemBox = this.itemBoxLayer.getItemBoxByPosition(i+1);
            if(!itemBox)
                continue;

            if (item.kind===ItemType.ItemHP){
                itemBox.setColorSprite("item_color_5.png");
            }else{
                itemBox.setColorSprite("item_color_3.png");
            }

            // itemBox.setItemId(item.id);
            if (item.itemData) {
                imgPath = "icon/item/item_" + item.itemData.skinId + ".png";
                itemBox.setIconSprite(imgPath);
                if (i<3) {
                    itemBox.adjustIconSprite(55);
                }else{
                    itemBox.adjustIconSprite();
                }
            }
            itemBox.setRightDownLabelString(formula.bigNumber2Text(item.count));
        }

    },

    openBgTouch:function(){
        var bgImage=this._ccsNode.getChildByName("bgImage");
        var onTouchBegan = function(touch, event) {
            return true;
        };

        // var m_width=bgImage.getContentSize().width;
        // var m_height=bgImage.getContentSize().height;
        // var self = this;
        // var onTouchEnded = function(touch, event) {
        //     var location = self.convertTouchToNodeSpace(touch);
        //     if (!(location.x > -m_width/2 
        //         && location.x < m_width/2 
        //         && location.y > -m_height/2 
        //         && location.y < m_height/2)) {
        //         layerManager.closePanel(self);
        //     }
        // };

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan
            // onTouchEnded: onTouchEnded
        }, this);
    },

    setTutorial:function(){
        var item=this.items[2];
        this.setSelectItem(item);
        this.setItemCount(10);
    }

});