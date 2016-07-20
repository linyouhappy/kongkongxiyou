cb.SoundManager = cc.Class.extend({
    ctor: function() {

    },
    
    playerAreaMusic: function(soundId) {
    	if (soundId) {
    		var soundPath="sound/area/"+soundId+".mp3";
    		if (jsb.fileUtils.isFileExist(soundPath)) {
    			cb.CommonLib.playBgMusic(soundPath,true);
        	}
    	}
    },

    playerSkillEffect: function(soundId,isLoop) {
        if (soundId) {
            var soundPath="sound/skill/"+soundId+".mp3";
            if (jsb.fileUtils.isFileExist(soundPath)) {
                cc.log("soundPath:"+soundPath);
                cb.CommonLib.playEffectSound(soundPath,!!isLoop);
            }else{
                cc.log("no exist. soundPath:"+soundPath);
            }
        }
    },

    stopAreaMusic:function(){
    	cb.CommonLib.stopBgMusic(true);
    },

    playEffectSound:function(soundFile,isLoop){
        return cb.CommonLib.playEffectSound(soundFile,!!isLoop);
    },

    stopEffectSound:function(nSoundId){
        cb.CommonLib.stopEffectSound(nSoundId);
    },

    stopAllEffectsSound:function(){
        cb.CommonLib.stopAllEffectsSound();
    },

    enableEffectSound:function(enable){
        cb.CommonLib.enableEffectSound(enable);
    },

    enableBgMusic:function(enable){
        cb.CommonLib.enableBgMusic(enable);
    },

    isEnableEffectSound:function(){
        return cb.CommonLib.isEnableEffectSound();
    },

    isEnableBgMusic:function(){
        return cb.CommonLib.isEnableBgMusic();
    }
});



var soundManager = new cb.SoundManager();


// soundManager.playerSkillEffect();
// soundManager.playEffectSound();
