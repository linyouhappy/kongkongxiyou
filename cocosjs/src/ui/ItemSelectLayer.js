
cb.ItemSelectLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
        var bgSprite=cc.Scale9Sprite.createWithSpriteFrameName("color_black.png");
        bgSprite.setContentSize(cc.size(cc.winSize.width,cc.winSize.height));
        this.addChild(bgSprite);
        bgSprite.setOpacity(150);

        var ccsNode = ccs.CSLoader.createNode("uiccs/ItemSelectLayer.csb");
        this.addChild(ccsNode);
        this._ccsNode=ccsNode;

        this.openBgTouch();

        var container=ccsNode.getChildByName("container");
        var contentSize = container.getContentSize();

        var itemBoxLayer = cb.ItemBoxLayer.create();
        itemBoxLayer.setLimitColumn(6);
        itemBoxLayer.setViewSizeAndItemSize(contentSize, cc.size(93, 90));
        itemBoxLayer.enableEvent(true);
        container.addChild(itemBoxLayer);

        var self = this;
        var onItemBoxLayerCallback = function(position, itemBox) {
            // var itemId = itemBox.getItemId();
            // if (itemId <= 0) return;

            var item=self.items[position-1];
            if (item && self.callback) {
                self.callback(item);
            }
            self.removeFromParent();
        };
        itemBoxLayer.addEventListener(onItemBoxLayerCallback);
        this.itemBoxLayer = itemBoxLayer;

        itemBoxLayer.setItemCount(25);
    },

    setItemCallback:function(callback){
        this.callback=callback;

        var items=[];
        var tmpItems=bagManager.items;
        var itemDatas = dataApi.item.all();
        var marketData = dataApi.market.findById(1);
        if (cc.isString(marketData.tradeItem)) {
            marketData.tradeItem=JSON.parse(marketData.tradeItem);
        }
        var kindId,kindIds=marketData.tradeItem;
        var itemBox,item, imgPath;
        for (var key in kindIds) {
            kindId=kindIds[key];
            item = tmpItems[kindId];
            if (item) {
                items.push(item);
            }else{
                items.push({
                    count:0,
                    kindId:kindId,
                    itemData:dataApi.item.findById(kindId)
                });
            }
        }
        this.setItems(items);
    },

    setEquipmentCallback:function(callback){
        this.callback=callback;

        var items=[];
        var tmpItems=bagManager.bagItems;
        var item;
        for (var key in tmpItems) {
            item=tmpItems[key];
            if (item) {
                items.push(item);
            }
        }
        this.setItems(items);
    },

    setItems:function(items){
        this.items=items;
        var itemCount=items.length+10;
        itemCount=Math.max(itemCount,15);
        var itemBoxLayer=this.itemBoxLayer;
        itemBoxLayer.setItemCount(itemCount);
        var item,itemBox,itemColorName;
        for (var i = 0; i < items.length; i++) {
            item = items[i];
            itemBox = itemBoxLayer.getItemBoxByPosition(i+1);
            if(!itemBox)
                continue;

            if (item.itemData) {
                imgPath=formula.skinIdToIconImg(item.itemData.skinId);
                itemBox.setIconSprite(imgPath);
                itemBox.adjustIconSprite();
            }
            if (item.type===EntityType.EQUIPMENT) {
                itemColorName =formula.starToColorImg(item.totalStar);
                itemBox.setColorSprite(itemColorName);
            }else{
                itemBox.setRightDownLabelString(formula.bigNumber2Text(item.count));
            }
        }
    },

    openBgTouch:function(){
        var bgImage=this._ccsNode.getChildByName("bgImage");
        var onTouchBegan = function(touch, event) {
            return true;
        };

        var m_width=bgImage.getContentSize().width;
        var m_height=bgImage.getContentSize().height;
        var self = this;
        var onTouchEnded = function(touch, event) {
            var location = self.convertTouchToNodeSpace(touch);
            if (!(location.x > -m_width/2 
                && location.x < m_width/2 
                && location.y > -m_height/2 
                && location.y < m_height/2)) {
                self.removeFromParent();
            }
        };

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: onTouchBegan,
            onTouchEnded: onTouchEnded
        }, this);
    }

});