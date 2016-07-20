cb.SkillPanel = cc.Class.extend({
	ctor: function(skillNode) {
		skillNode.setPosition(layerPositions.skillPositionS);

		var skillBtn = null;
		this._skillBtns = {};
		for (var i = 1; i <= 5; i++) {
			skillBtn = skillNode.getChildByTag(i);
			skillBtn.setPressedActionEnabled(true);
			skillBtn.setSoundEffectFile("");
			skillBtn.addTouchEventListener(this.touchEvent, this);
			if (i > 1)
				skillBtn.setVisible(false);

			this._skillBtns[i] = skillBtn;
		};

		this._skillCds = {};
		this._skillSprites = {};
		this._posToSkillId = {};
		this._skillIdPos={};
	},

	updateFightSkills:function(){
		var fightSkills = skillManager.getFightSkills();
		var fightSkill = null;
		for (var key in fightSkills) {
			fightSkill = fightSkills[key];
			this.setSkillData(fightSkill);
		}
		var mp=app.getCurPlayer().mp || 0;
		this.updateMp(mp);
	},

	equipSkill:function(skillId){
		var fightSkills = skillManager.getFightSkills();
		var fightSkill=fightSkills[skillId];

		if (fightSkill) {
			this.setSkillData(fightSkill);
		}
	},

	removeSkillData:function(skillId){
		var position=this._skillIdPos[skillId];
		if (!!position && position>1) {
			var skillBtn = this._skillBtns[position];
			skillBtn.setVisible(false);
			skillBtn.removeAllChildren();

			delete this._posToSkillId[position];
			delete this._skillCds[position];
			delete this._skillIdPos[skillId];

			delete this._skillSprites[position];
		}
	},

	setSkillData: function(fightSkill) {
		var position = fightSkill.position;
		var skillId = fightSkill.skillId;
		if(!position) {
			this.removeSkillData(skillId);
			return;
		}
		if (this._skillIdPos[skillId] 
			&& this._skillIdPos[skillId]===position) {
			return;
		}
		this.removeSkillData(skillId);

		this._posToSkillId[position] = skillId;
		this._skillIdPos[skillId]=position;

		var skillBtn = this._skillBtns[position];
		if(!skillBtn) return;

		var contentSize = skillBtn.getContentSize();
		skillBtn.setVisible(true);
		skillBtn.removeAllChildren();

		var cdSprite = cc.Sprite("#skill_icon_cd.png");
		var cdProgressTimer = cc.ProgressTimer.create(cdSprite);
		if (position > 1) {
			var skillEffect=dataApi.skill_effect.findById(skillId);
			if (skillEffect && skillEffect.iconId) {
				var contentSize = skillBtn.getContentSize();
				var skillSpriteName = "icon/skill/skill_icon_" + skillEffect.iconId + ".png";
				var skillSprite = new cc.Sprite(skillSpriteName);
				skillSprite.setPosition(contentSize.width / 2, contentSize.height / 2);
				skillSprite.setTag(1);
				skillBtn.addChild(skillSprite);
				this._skillSprites[position] = skillSprite;
			}
		} else {
			cdProgressTimer.setScale(1.8);
		}
		cdProgressTimer.setType(cc.ProgressTimer.TYPE_RADIAL);
		cdProgressTimer.setTag(0);
		cdProgressTimer.setPosition(cc.p(contentSize.width / 2, contentSize.height / 2));

		skillBtn.addChild(cdProgressTimer, 10);
		this._skillCds[position] = cdProgressTimer;
	},

	fireSkill: function(position) {
		var skillId = this._posToSkillId[position];
		if (!skillId)
			return;

		if (position>1) {
			var skillSprite = this._skillSprites[position];
			if (!skillSprite || skillSprite.getTag() !== 1)
				return;
		}
		var curPlayer = app.getCurPlayer();
		if (!curPlayer) return;

		curPlayer.buttonFire(skillId,position);
		cc.log("fireSkill===>>>position=" + position + ",skillId=" + skillId);
	},

	touchEvent: function(sender, type) {
		if (type===ccui.Widget.TOUCH_BEGAN) {
			this.fireSkill(sender.getTag());
		}
	},

	showSkillCD: function(position, cdTime) {
		var skillCD = this._skillCds[position];
		if (!skillCD || skillCD.getTag() === 1)
			return;

		var self = this;
		var onCDCompletedCallback = function() {
			var skillCD = self._skillCds[position];
			if (skillCD) {
				skillCD.setTag(0);
				if (position > 1)
					self.setHighEffect(position)
			}
		};

		skillCD.setTag(1);
		var sequence = cc.Sequence.create(
			cc.ProgressFromTo.create(cdTime, 100, 0),
			cc.CallFunc.create(onCDCompletedCallback)
		);

		skillCD.runAction(sequence);
	},

	updateMp:function(mp){
		var fightSkills = skillManager.getFightSkills();
		var fightSkill,skillSprite,skillBtn;
		for (var key in fightSkills) {
			fightSkill = fightSkills[key];
			if (fightSkill.position>1) {
				skillSprite=this._skillSprites[fightSkill.position];
				if(!skillSprite) continue;

				if (mp>=fightSkill.skillData.mp) {
					if (skillSprite.getTag()!==1) {
						skillSprite.setTag(1);
						effectManager.useDefaultShaderEffect(skillSprite);
					}
				}else{
					if (skillSprite.getTag()!==0) {
						skillSprite.setTag(0);
						effectManager.useShaderEffect(skillSprite, "ShaderGreyScale");
					}
				}
			}
		}
	},

	setHighEffect: function(position) {
		var skillBtn = this._skillBtns[position];
		var effectSprite = new cc.Sprite();
		var contentSize = skillBtn.getContentSize();
		effectSprite.setPosition(contentSize.width/2,contentSize.height/2);
		skillBtn.addChild(effectSprite, 100);

		var animate = cb.CommonLib.genarelAnimate("effect/skill_btn_effect.plist", "skill_btn_effect_");
		var sequence = cc.Sequence.create(
			animate,
			cc.RemoveSelf.create()
		);
		effectSprite.runAction(sequence);
	}

});