cb.ColorLogLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        this.initView();
    },

    initView: function() {
        // var frameSprite = cc.Scale9Sprite.create("update/quick_log_bg.png");
        var frameSprite = new cc.Sprite("update/quick_log_bg.png");
        // frameSprite.setContentSize(cc.size(220, 120));
        // frameSprite.setOpacity(150);
        frameSprite.setAnchorPoint(cc.p(0.5, 0));
        // frameSprite.setPosition(-110, 140);
        this.addChild(frameSprite);
        this.frameSprite = frameSprite;

        var richTextBox = cb.CCRichText.create(200, 0);
        richTextBox.setLineSpace(2);
        richTextBox.setDetailStyle("Arial", 24, cc.color(255, 255, 255, 255));
        richTextBox.setPosition(-100, 150);
        richTextBox.setBlankHeight(0);
        richTextBox.setTouchEnabled(false);
        // richTextBox.getMixContentWidth();

        this.addChild(richTextBox);
        this.richTextBox = richTextBox;

        // frameSprite.setLocalZOrder(200);
        // richTextBox.setLocalZOrder(200);
    },

    setPanelData: function(position, callback) {
        this.callback = callback;
        this.setPosition(position);
    }
});