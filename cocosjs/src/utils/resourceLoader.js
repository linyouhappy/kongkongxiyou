//require('src/utils/pool/objectPool.js');
//require('src/utils/pool/objectPoolFactory.js');

// var EventEmitter = window.EventEmitter;
// var pomelo = window.pomelo;
// var imgURL = 'http://pomelo.netease.com/art/';

function ResourceLoader() {
    // EventEmitter.call(this);

    this.totalCount = 0;
    this.loadedCount = 0;
}

ResourceLoader.prototype.loading = function(percent) {
    this.loadingLayer.setPercent(percent);
    this.loadingLayer.setString("加载中..." + percent + "%");
};

ResourceLoader.prototype.complete = function() {
    this.loadingLayer.setPercent(100);
    this.loadingLayer.setString("加载完成...100%");
    appHandler.resourceLoader = null;
};

ResourceLoader.prototype.loadAreaResource = function(loadingLayer) {
    var skinIds={};
    function addSkillRes(skillId){
        var skillEffect=dataApi.skill_effect.findById(skillId);
        if (skillEffect) {
            cb.EntitySprite.loadResById(skillEffect.aEffectId);
            cb.EntitySprite.loadResById(skillEffect.tEffectId);
            cb.EntitySprite.loadResById(skillEffect.bulletId);
        }
    };

    var allRoleDatas=dataApi.role.all();
    for (var key in allRoleDatas) {
        var roleData=allRoleDatas[key];
        // cb.EntitySprite.loadResById(roleData.id);
        var character = dataApi.character.findById(roleData.id);
        cb.EntitySprite.loadResById(character.skinId);
        
        addSkillRes(character.skillId);
        if (cc.isString(roleData.skillIds)) {
            roleData.skillIds = JSON.parse(roleData.skillIds)
        }
        for (var i = 0; i < roleData.skillIds.length; i++) {
            addSkillRes(roleData.skillIds[i]);
        }
    }

    var self=this;
    this.indexCount=0;
    this.isComplete=false;
    this.intervalId=setInterval(function() {
        self.indexCount++;
        if (self.indexCount>9) {
            clearInterval(self.intervalId);
            if (!self.isComplete) {
                self.isComplete=true;
                // self.complete();
                appHandler.enterScene();
            }
        }else{
            self.loading(self.indexCount*10);
        }
    },0);

    this.loadingLayer=loadingLayer;
};