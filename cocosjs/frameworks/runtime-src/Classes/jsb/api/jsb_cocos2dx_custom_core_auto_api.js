/**
 * @module cocos2dx_custom_core
 */
var cb = cb || {};

/**
 * @class CCRichText
 */
cb.CCRichText = {

/**
 * @method setLineSpace
 * @param {int} arg0
 */
setLineSpace : function (
int 
)
{
},

/**
 * @method removeRichNode
 * @param {int} arg0
 */
removeRichNode : function (
int 
)
{
},

/**
 * @method setBlankHeight
 * @param {int} arg0
 */
setBlankHeight : function (
int 
)
{
},

/**
 * @method appendRichSprite
 * @param {char} arg0
 * @param {int} arg1
 * @param {int} arg2
 */
appendRichSprite : function (
char, 
int, 
int 
)
{
},

/**
 * @method appendRichSpriteFile
 * @param {char} arg0
 * @param {int} arg1
 * @param {int} arg2
 */
appendRichSpriteFile : function (
char, 
int, 
int 
)
{
},

/**
 * @method layoutChildren
 */
layoutChildren : function (
)
{
},

/**
 * @method appendRichAnimate
 * @param {char} arg0
 * @param {int} arg1
 * @param {int} arg2
 */
appendRichAnimate : function (
char, 
int, 
int 
)
{
},

/**
 * @method setDetailStyle
 * @param {char} arg0
 * @param {int} arg1
 * @param {color4b_object} arg2
 */
setDetailStyle : function (
char, 
int, 
color4b 
)
{
},

/**
 * @method setTouchEnabled
 * @param {bool} arg0
 */
setTouchEnabled : function (
bool 
)
{
},

/**
 * @method getMixContentWidth
 * @return {int}
 */
getMixContentWidth : function (
)
{
    return 0;
},

/**
 * @method appendRichText
 * @param {char} arg0
 * @param {kTextStyle} arg1
 * @param {int} arg2
 * @param {int} arg3
 */
appendRichText : function (
char, 
ktextstyle, 
int, 
int 
)
{
},

/**
 * @method setNodeSprite
 * @param {char} arg0
 * @param {int} arg1
 */
setNodeSprite : function (
char, 
int 
)
{
},

/**
 * @method getTouchEnabled
 * @return {bool}
 */
getTouchEnabled : function (
)
{
    return false;
},

/**
 * @method setTextColor
 * @param {color4b_object} arg0
 */
setTextColor : function (
color4b 
)
{
},

/**
 * @method showDebug
 */
showDebug : function (
)
{
},

/**
 * @method appendRichNode
 * @param {cc.Node} arg0
 * @param {int} arg1
 * @param {int} arg2
 */
appendRichNode : function (
node, 
int, 
int 
)
{
},

/**
 * @method clearAll
 */
clearAll : function (
)
{
},

/**
 * @method create
 * @param {int} arg0
 * @param {int} arg1
 * @return {CCRichText}
 */
create : function (
int, 
int 
)
{
    return CCRichText;
},

/**
 * @method CCRichText
 * @constructor
 * @param {int} arg0
 * @param {int} arg1
 */
CCRichText : function (
int, 
int 
)
{
},

};

/**
 * @class RichLabelsLayer
 */
cb.RichLabelsLayer = {

/**
 * @method enableEvent
 * @param {bool} arg0
 */
enableEvent : function (
bool 
)
{
},

/**
 * @method appendRichText
 * @param {char} arg0
 * @param {kTextStyle} arg1
 * @param {int} arg2
 */
appendRichText : function (
char, 
ktextstyle, 
int 
)
{
},

/**
 * @method removeRichLabel
 * @param {int} arg0
 */
removeRichLabel : function (
int 
)
{
},

/**
 * @method setCurRichLabel
 * @param {int} arg0
 */
setCurRichLabel : function (
int 
)
{
},

/**
 * @method setLabelSpace
 * @param {int} arg0
 */
setLabelSpace : function (
int 
)
{
},

/**
 * @method justLayout
 */
justLayout : function (
)
{
},

/**
 * @method addEventListener
 * @param {function} arg0
 */
addEventListener : function (
func 
)
{
},

/**
 * @method clearCurRichLabel
 */
clearCurRichLabel : function (
)
{
},

/**
 * @method resetRichLabels
 */
resetRichLabels : function (
)
{
},

/**
 * @method isEnableEvent
 * @return {bool}
 */
isEnableEvent : function (
)
{
    return false;
},

/**
 * @method layoutRichLabels
 */
layoutRichLabels : function (
)
{
},

/**
 * @method layoutCurRichLabel
 */
layoutCurRichLabel : function (
)
{
},

/**
 * @method setDivideLineColor
 * @param {color4b_object} arg0
 */
setDivideLineColor : function (
color4b 
)
{
},

/**
 * @method appendRichAnimate
 * @param {char} arg0
 * @param {int} arg1
 */
appendRichAnimate : function (
char, 
int 
)
{
},

/**
 * @method setDetailStyle
 * @param {char} arg0
 * @param {int} arg1
 * @param {color4b_object} arg2
 */
setDetailStyle : function (
char, 
int, 
color4b 
)
{
},

/**
 * @method clearAllRichLabels
 */
clearAllRichLabels : function (
)
{
},

/**
 * @method getCurRichLabelText
 * @return {CCRichText}
 */
getCurRichLabelText : function (
)
{
    return CCRichText;
},

/**
 * @method setTextColor
 * @param {color4b_object} arg0
 */
setTextColor : function (
color4b 
)
{
},

/**
 * @method appendRichSprite
 * @param {char} arg0
 * @param {int} arg1
 */
appendRichSprite : function (
char, 
int 
)
{
},

/**
 * @method create
 * @param {int} arg0
 * @param {int} arg1
 * @return {RichLabelsLayer}
 */
create : function (
int, 
int 
)
{
    return RichLabelsLayer;
},

/**
 * @method RichLabelsLayer
 * @constructor
 */
RichLabelsLayer : function (
)
{
},

};

/**
 * @class ShaderEffect
 */
cb.ShaderEffect = {

/**
 * @method setTarget
 * @param {cc.Sprite} arg0
 */
setTarget : function (
sprite 
)
{
},

/**
 * @method getGLProgramState
 * @return {cc.GLProgramState}
 */
getGLProgramState : function (
)
{
    return cc.GLProgramState;
},

/**
 * @method createWithFragmentFile
 * @param {char} arg0
 * @return {ShaderEffect}
 */
createWithFragmentFile : function (
char 
)
{
    return ShaderEffect;
},

/**
 * @method create
 * @param {char} arg0
 * @return {ShaderEffect}
 */
create : function (
char 
)
{
    return ShaderEffect;
},

/**
 * @method ShaderEffect
 * @constructor
 */
ShaderEffect : function (
)
{
},

};

/**
 * @class EffectManager
 */
cb.EffectManager = {

/**
 * @method registerShaderEffect
 * @param {char} arg0
 * @param {ShaderEffect} arg1
 */
registerShaderEffect : function (
char, 
shadereffect 
)
{
},

/**
 * @method getGLProgramStateByKey
 * @param {char} arg0
 * @return {cc.GLProgramState}
 */
getGLProgramStateByKey : function (
char 
)
{
    return cc.GLProgramState;
},

/**
 * @method getShaderEffectByKey
 * @param {char} arg0
 * @return {ShaderEffect}
 */
getShaderEffectByKey : function (
char 
)
{
    return ShaderEffect;
},

/**
 * @method useDefaultShaderEffect
 * @param {cc.Sprite} arg0
 */
useDefaultShaderEffect : function (
sprite 
)
{
},

/**
 * @method useShaderEffect
 * @param {cc.Sprite} arg0
 * @param {char} arg1
 */
useShaderEffect : function (
sprite, 
char 
)
{
},

/**
 * @method getInstance
 * @return {EffectManager}
 */
getInstance : function (
)
{
    return EffectManager;
},

/**
 * @method EffectManager
 * @constructor
 */
EffectManager : function (
)
{
},

};

/**
 * @class ItemBox
 */
cb.ItemBox = {

/**
 * @method enableSelectSprite
 * @param {bool} arg0
 */
enableSelectSprite : function (
bool 
)
{
},

/**
 * @method getItemId
 * @return {int}
 */
getItemId : function (
)
{
    return 0;
},

/**
 * @method setItemId
 * @param {int} arg0
 */
setItemId : function (
int 
)
{
},

/**
 * @method getIconSprite
 * @return {cc.Sprite}
 */
getIconSprite : function (
)
{
    return cc.Sprite;
},

/**
 * @method enableJobSprite
 * @param {bool} arg0
 */
enableJobSprite : function (
bool 
)
{
},

/**
 * @method setNameLabelString
 * @param {char} arg0
 */
setNameLabelString : function (
char 
)
{
},

/**
 * @method enableLockSprite
 * @param {bool} arg0
 */
enableLockSprite : function (
bool 
)
{
},

/**
 * @method enableRightUpLabel
 * @param {bool} arg0
 */
enableRightUpLabel : function (
bool 
)
{
},

/**
 * @method enableColorSprite
 * @param {bool} arg0
 */
enableColorSprite : function (
bool 
)
{
},

/**
 * @method showJobId
 * @param {int} arg0
 */
showJobId : function (
int 
)
{
},

/**
 * @method isEnableEvent
 * @return {bool}
 */
isEnableEvent : function (
)
{
    return false;
},

/**
 * @method selected
 */
selected : function (
)
{
},

/**
 * @method setArrowSprite
 * @param {char} arg0
 */
setArrowSprite : function (
char 
)
{
},

/**
 * @method setIconSprite
 * @param {char} arg0
 */
setIconSprite : function (
char 
)
{
},

/**
 * @method adjustIconSprite
 */
adjustIconSprite : function (
)
{
},

/**
 * @method enableArrowSprite
 * @param {bool} arg0
 */
enableArrowSprite : function (
bool 
)
{
},

/**
 * @method setDefaultSetting
 */
setDefaultSetting : function (
)
{
},

/**
 * @method enableRightDownLabel
 * @param {bool} arg0
 */
enableRightDownLabel : function (
bool 
)
{
},

/**
 * @method enableKeepSelect
 * @param {bool} arg0
 */
enableKeepSelect : function (
bool 
)
{
},

/**
 * @method setRightDownLabelString
 * @param {char} arg0
 */
setRightDownLabelString : function (
char 
)
{
},

/**
 * @method setBgSprite
 * @param {char} arg0
 */
setBgSprite : function (
char 
)
{
},

/**
 * @method setSelectSprite
 * @param {char} arg0
 */
setSelectSprite : function (
char 
)
{
},

/**
 * @method clearAllSetting
 */
clearAllSetting : function (
)
{
},

/**
 * @method setRightUpLabelString
 * @param {char} arg0
 */
setRightUpLabelString : function (
char 
)
{
},

/**
 * @method setColorSprite
 * @param {char} arg0
 */
setColorSprite : function (
char 
)
{
},

/**
 * @method enableIconSprite
 * @param {bool} arg0
 */
enableIconSprite : function (
bool 
)
{
},

/**
 * @method setLockSprite
 * @param {char} arg0
 */
setLockSprite : function (
char 
)
{
},

/**
 * @method enableEvent
 * @param {bool} arg0
 */
enableEvent : function (
bool 
)
{
},

/**
 * @method unselected
 */
unselected : function (
)
{
},

/**
 * @method setDefaultArrowSprite
 * @param {char} arg0
 */
setDefaultArrowSprite : function (
char 
)
{
},

/**
 * @method create
 * @return {ItemBox}
 */
create : function (
)
{
    return ItemBox;
},

/**
 * @method setDefaultSelectSprite
 * @param {char} arg0
 */
setDefaultSelectSprite : function (
char 
)
{
},

/**
 * @method setDefaultBgSprite
 * @param {char} arg0
 */
setDefaultBgSprite : function (
char 
)
{
},

};

/**
 * @class ItemBoxLayer
 */
cb.ItemBoxLayer = {

/**
 * @method getItemBoxByPosition
 * @param {int} arg0
 * @return {ItemBox}
 */
getItemBoxByPosition : function (
int 
)
{
    return ItemBox;
},

/**
 * @method cancelSelectEffect
 */
cancelSelectEffect : function (
)
{
},

/**
 * @method isEnableEvent
 * @return {bool}
 */
isEnableEvent : function (
)
{
    return false;
},

/**
 * @method setIsCanScroll
 * @param {bool} arg0
 */
setIsCanScroll : function (
bool 
)
{
},

/**
 * @method setKeepSelectEffect
 * @param {bool} arg0
 */
setKeepSelectEffect : function (
bool 
)
{
},

/**
 * @method enableEvent
 * @param {bool} arg0
 */
enableEvent : function (
bool 
)
{
},

/**
 * @method setScrollType
 * @param {int} arg0
 */
setScrollType : function (
int 
)
{
},

/**
 * @method setLimitRow
 * @param {int} arg0
 */
setLimitRow : function (
int 
)
{
},

/**
 * @method getItemBoxByItemId
 * @param {int} arg0
 * @return {ItemBox}
 */
getItemBoxByItemId : function (
int 
)
{
    return ItemBox;
},

/**
 * @method setLimitColumn
 * @param {int} arg0
 */
setLimitColumn : function (
int 
)
{
},

/**
 * @method setItemCount
 * @param {int} arg0
 */
setItemCount : function (
int 
)
{
},

/**
 * @method setViewSizeAndItemSize
 * @param {size_object} arg0
 * @param {size_object} arg1
 */
setViewSizeAndItemSize : function (
size, 
size 
)
{
},

/**
 * @method create
 * @return {ItemBoxLayer}
 */
create : function (
)
{
    return ItemBoxLayer;
},

};

/**
 * @class CommonLib
 */
cb.CommonLib = {

/**
 * @method saveFile
 * @param {char} arg0
 * @param {char} arg1
 * @param {unsigned long} arg2
 * @return {bool}
 */
saveFile : function (
char, 
char, 
long 
)
{
    return false;
},

/**
 * @method removeRes
 * @param {char} arg0
 */
removeRes : function (
char 
)
{
},

/**
 * @method createAddMpNumber
 * @param {unsigned int} arg0
 * @return {cc.Node}
 */
createAddMpNumber : function (
int 
)
{
    return cc.Node;
},

/**
 * @method getServerURL
 * @return {char}
 */
getServerURL : function (
)
{
    return 0;
},

/**
 * @method stopBgMusic
 * @param {bool} arg0
 */
stopBgMusic : function (
bool 
)
{
},

/**
 * @method playEffectSound
 * @param {char} arg0
 * @param {bool} arg1
 * @return {unsigned int}
 */
playEffectSound : function (
char, 
bool 
)
{
    return 0;
},

/**
 * @method hostToIp
 * @param {char} arg0
 * @return {char}
 */
hostToIp : function (
char 
)
{
    return 0;
},

/**
 * @method createMobHurtNumber
 * @param {unsigned int} arg0
 * @return {cc.Node}
 */
createMobHurtNumber : function (
int 
)
{
    return cc.Node;
},

/**
 * @method getFileMD5
 * @param {char} arg0
 * @return {char}
 */
getFileMD5 : function (
char 
)
{
    return 0;
},

/**
 * @method removeAnimation
 * @param {char} arg0
 */
removeAnimation : function (
char 
)
{
},

/**
 * @method stopEffectSound
 * @param {unsigned int} arg0
 */
stopEffectSound : function (
int 
)
{
},

/**
 * @method getTodayInteger
 * @return {int}
 */
getTodayInteger : function (
)
{
    return 0;
},

/**
 * @method MessageBox
 * @param {char} arg0
 * @param {char} arg1
 */
MessageBox : function (
char, 
char 
)
{
},

/**
 * @method showResInfo
 */
showResInfo : function (
)
{
},

/**
 * @method initCommonLib
 */
initCommonLib : function (
)
{
},

/**
 * @method currentMilliSecond
 * @return {long}
 */
currentMilliSecond : function (
)
{
    return 0;
},

/**
 * @method currentSecond
 * @return {double}
 */
currentSecond : function (
)
{
    return 0;
},

/**
 * @method stopAllEffectsSound
 */
stopAllEffectsSound : function (
)
{
},

/**
 * @method isJSBScriptZipRun
 * @return {bool}
 */
isJSBScriptZipRun : function (
)
{
    return false;
},

/**
 * @method createCritHurtNumber
 * @param {unsigned int} arg0
 * @return {cc.Node}
 */
createCritHurtNumber : function (
int 
)
{
    return cc.Node;
},

/**
 * @method isEnableEffectSound
 * @return {bool}
 */
isEnableEffectSound : function (
)
{
    return false;
},

/**
 * @method genarelAnimation
 * @param {char} arg0
 * @param {char} arg1
 * @param {float} arg2
 * @param {int} arg3
 * @return {cc.Animation}
 */
genarelAnimation : function (
char, 
char, 
float, 
int 
)
{
    return cc.Animation;
},

/**
 * @method isEnableBgMusic
 * @return {bool}
 */
isEnableBgMusic : function (
)
{
    return false;
},

/**
 * @method enableEffectSound
 * @param {bool} arg0
 */
enableEffectSound : function (
bool 
)
{
},

/**
 * @method playBgMusic
 * @param {char} arg0
 * @param {bool} arg1
 */
playBgMusic : function (
char, 
bool 
)
{
},

/**
 * @method getServerIP
 * @return {char}
 */
getServerIP : function (
)
{
    return 0;
},

/**
 * @method enableBgMusic
 * @param {bool} arg0
 */
enableBgMusic : function (
bool 
)
{
},

/**
 * @method md5
 * @param {char} arg0
 * @return {char}
 */
md5 : function (
char 
)
{
    return 0;
},

/**
 * @method createUid
 * @return {int}
 */
createUid : function (
)
{
    return 0;
},

/**
 * @method setServerURL
 * @param {char} arg0
 */
setServerURL : function (
char 
)
{
},

/**
 * @method genarelAnimate
 * @param {char} arg0
 * @param {char} arg1
 * @param {float} arg2
 * @param {int} arg3
 * @return {cc.Animate}
 */
genarelAnimate : function (
char, 
char, 
float, 
int 
)
{
    return cc.Animate;
},

/**
 * @method createNormalHurtNumber
 * @param {unsigned int} arg0
 * @return {cc.Node}
 */
createNormalHurtNumber : function (
int 
)
{
    return cc.Node;
},

/**
 * @method RandomProbability
 * @param {int} arg0
 * @return {bool}
 */
RandomProbability : function (
int 
)
{
    return false;
},

/**
 * @method createDodge
 * @return {cc.Node}
 */
createDodge : function (
)
{
    return cc.Node;
},

/**
 * @method createAddHpNumber
 * @param {unsigned int} arg0
 * @return {cc.Node}
 */
createAddHpNumber : function (
int 
)
{
    return cc.Node;
},

};

/**
 * @class EntitySpriteManger
 */
cb.EntitySpriteManger = {

/**
 * @method createEntitySprite
 * @param {int} arg0
 * @param {int} arg1
 * @return {EntitySprite}
 */
createEntitySprite : function (
int, 
int 
)
{
    return EntitySprite;
},

/**
 * @method clearEntitySpriteByType
 * @param {int} arg0
 */
clearEntitySpriteByType : function (
int 
)
{
},

/**
 * @method clearActionBySkinId
 * @param {int} arg0
 */
clearActionBySkinId : function (
int 
)
{
},

/**
 * @method getHSkillActionByActionName
 * @param {int} arg0
 * @param {int} arg1
 * @param {kActionType} arg2
 * @param {float} arg3
 * @param {float} arg4
 * @return {cc.Action}
 */
getHSkillActionByActionName : function (
int, 
int, 
kactiontype, 
float, 
float 
)
{
    return cc.Action;
},

/**
 * @method getAnimationByActionName
* @param {int|char} int
* @param {int} int
* @param {kActionType} kactiontype
* @return {cc.Animation|cc.Animation}
*/
getAnimationByActionName : function(
int,
int,
kactiontype 
)
{
    return cc.Animation;
},

/**
 * @method removeResBySkinId
 * @param {int} arg0
 */
removeResBySkinId : function (
int 
)
{
},

/**
 * @method loadResBySkinId
 * @param {int} arg0
 * @return {bool}
 */
loadResBySkinId : function (
int 
)
{
    return false;
},

/**
 * @method clearEntitySpriteBySkinId
 * @param {int} arg0
 */
clearEntitySpriteBySkinId : function (
int 
)
{
},

/**
 * @method getSkillActionByActionName
 * @param {int} arg0
 * @param {int} arg1
 * @param {kActionType} arg2
 * @param {float} arg3
 * @param {float} arg4
 * @return {cc.Action}
 */
getSkillActionByActionName : function (
int, 
int, 
kactiontype, 
float, 
float 
)
{
    return cc.Action;
},

/**
 * @method getActionByActionName
 * @param {int} arg0
 * @param {int} arg1
 * @param {kActionType} arg2
 * @param {float} arg3
 * @return {cc.Action}
 */
getActionByActionName : function (
int, 
int, 
kactiontype, 
float 
)
{
    return cc.Action;
},

/**
 * @method deleteInstance
 */
deleteInstance : function (
)
{
},

/**
 * @method getInstance
 * @return {EntitySpriteManger}
 */
getInstance : function (
)
{
    return EntitySpriteManger;
},

};

/**
 * @class EntitySprite
 */
cb.EntitySprite = {

/**
 * @method reset
 */
reset : function (
)
{
},

/**
 * @method setAnchorPoint
 * @param {vec2_object} arg0
 */
setAnchorPoint : function (
vec2 
)
{
},

/**
 * @method setShadowSprite
 * @param {char} arg0
 */
setShadowSprite : function (
char 
)
{
},

/**
 * @method show
 * @param {int} arg0
 * @param {int} arg1
 * @param {kActionType} arg2
 * @param {float} arg3
 * @return {bool}
 */
show : function (
int, 
int, 
kactiontype, 
float 
)
{
    return false;
},

/**
 * @method setWeaponId
 * @param {int} arg0
 */
setWeaponId : function (
int 
)
{
},

/**
 * @method loadRes
 */
loadRes : function (
)
{
},

/**
 * @method showHitEffect
 * @param {int} arg0
 * @param {float} arg1
 * @param {int} arg2
 * @param {float} arg3
 */
showHitEffect : function (
int, 
float, 
int, 
float 
)
{
},

/**
 * @method setOpacity
 * @param {unsigned char} arg0
 */
setOpacity : function (
char 
)
{
},

/**
 * @method createHitEffect
 * @param {int} arg0
 * @param {float} arg1
 * @param {float} arg2
 * @return {cc.Sprite}
 */
createHitEffect : function (
int, 
float, 
float 
)
{
    return cc.Sprite;
},

/**
 * @method getContentSprite
 * @return {cc.Sprite}
 */
getContentSprite : function (
)
{
    return cc.Sprite;
},

/**
 * @method showAttackEffect
 * @param {int} arg0
 * @param {float} arg1
 * @param {int} arg2
 * @param {float} arg3
 */
showAttackEffect : function (
int, 
float, 
int, 
float 
)
{
},

/**
 * @method initWithSkinId
 * @param {int} arg0
 * @return {bool}
 */
initWithSkinId : function (
int 
)
{
    return false;
},

/**
 * @method singleShow
 * @return {bool}
 */
singleShow : function (
)
{
    return false;
},

/**
 * @method enableSkillEffect
 * @param {bool} arg0
 */
enableSkillEffect : function (
bool 
)
{
},

/**
 * @method hideShadowSprite
 */
hideShadowSprite : function (
)
{
},

/**
 * @method createAutoAnimateSprite
 * @param {int} arg0
 * @param {float} arg1
 * @param {float} arg2
 * @return {cc.Sprite}
 */
createAutoAnimateSprite : function (
int, 
float, 
float 
)
{
    return cc.Sprite;
},

/**
 * @method create
 * @param {int} arg0
 * @return {EntitySprite}
 */
create : function (
int 
)
{
    return EntitySprite;
},

/**
 * @method removeResById
 * @param {int} arg0
 */
removeResById : function (
int 
)
{
},

/**
 * @method loadResById
 * @param {int} arg0
 */
loadResById : function (
int 
)
{
},

/**
 * @method clearAllRes
 */
clearAllRes : function (
)
{
},

/**
 * @method createAnimateSprite
 * @param {int} arg0
 * @param {kActionType} arg1
 * @param {float} arg2
 * @param {unsigned int} arg3
 * @return {cc.Sprite}
 */
createAnimateSprite : function (
int, 
kactiontype, 
float, 
int 
)
{
    return cc.Sprite;
},

/**
 * @method EntitySprite
 * @constructor
 */
EntitySprite : function (
)
{
},

};

/**
 * @class MarqueeManager
 */
cb.MarqueeManager = {

/**
 * @method appendRichNode
 * @param {cc.Node} arg0
 */
appendRichNode : function (
node 
)
{
},

/**
 * @method appendRichText
 * @param {char} arg0
 */
appendRichText : function (
char 
)
{
},

/**
 * @method stopMarquee
 */
stopMarquee : function (
)
{
},

/**
 * @method appendRichSprite
 * @param {char} arg0
 */
appendRichSprite : function (
char 
)
{
},

/**
 * @method startMarquee
 */
startMarquee : function (
)
{
},

/**
 * @method setLocalZOrder
 * @param {int} arg0
 */
setLocalZOrder : function (
int 
)
{
},

/**
 * @method setInterval
 * @param {int} arg0
 * @param {int} arg1
 */
setInterval : function (
int, 
int 
)
{
},

/**
 * @method setBgImgFile
 * @param {char} arg0
 */
setBgImgFile : function (
char 
)
{
},

/**
 * @method setStartPosition
 * @param {vec2_object} arg0
 */
setStartPosition : function (
vec2 
)
{
},

/**
 * @method setDetailStyle
 * @param {char} arg0
 * @param {int} arg1
 * @param {color4b_object} arg2
 */
setDetailStyle : function (
char, 
int, 
color4b 
)
{
},

/**
 * @method setTextColor
 * @param {color4b_object} arg0
 */
setTextColor : function (
color4b 
)
{
},

/**
 * @method getInstance
 * @return {MarqueeManager}
 */
getInstance : function (
)
{
    return MarqueeManager;
},

};

/**
 * @class ScrollLogManager
 */
cb.ScrollLogManager = {

/**
 * @method pushLog
 * @param {char} arg0
 * @param {int} arg1
 */
pushLog : function (
char, 
int 
)
{
},

/**
 * @method getInstance
 * @return {ScrollLogManager}
 */
getInstance : function (
)
{
    return ScrollLogManager;
},

};

/**
 * @class ColorLogManager
 */
cb.ColorLogManager = {

/**
 * @method pushNewLog
 * @param {char} arg0
 * @param {color4b_object} arg1
 * @param {int} arg2
 */
pushNewLog : function (
char, 
color4b, 
int 
)
{
},

/**
 * @method cancelRichLog
 */
cancelRichLog : function (
)
{
},

/**
 * @method setFontFamily
 * @param {char} arg0
 */
setFontFamily : function (
char 
)
{
},

/**
 * @method appendSpriteFrame
 * @param {char} arg0
 * @param {int} arg1
 */
appendSpriteFrame : function (
char, 
int 
)
{
},

/**
 * @method setLocalZOrder
 * @param {int} arg0
 */
setLocalZOrder : function (
int 
)
{
},

/**
 * @method endRichLog
 */
endRichLog : function (
)
{
},

/**
 * @method setDefaultColorFormat
 * @param {char} arg0
 * @param {int} arg1
 * @param {color4b_object} arg2
 */
setDefaultColorFormat : function (
char, 
int, 
color4b 
)
{
},

/**
 * @method pushLog
 * @param {char} arg0
 * @param {int} arg1
 */
pushLog : function (
char, 
int 
)
{
},

/**
 * @method appendNode
 * @param {cc.Node} arg0
 */
appendNode : function (
node 
)
{
},

/**
 * @method setFontSize
 * @param {int} arg0
 */
setFontSize : function (
int 
)
{
},

/**
 * @method setBgImgFile
 * @param {char} arg0
 */
setBgImgFile : function (
char 
)
{
},

/**
 * @method setPosition
 * @param {vec2_object} arg0
 */
setPosition : function (
vec2 
)
{
},

/**
 * @method resetDefaultFormat
 */
resetDefaultFormat : function (
)
{
},

/**
 * @method setFontColor
 * @param {color4b_object} arg0
 */
setFontColor : function (
color4b 
)
{
},

/**
 * @method appendSpriteFile
 * @param {char} arg0
 * @param {int} arg1
 */
appendSpriteFile : function (
char, 
int 
)
{
},

/**
 * @method appendText
 * @param {char} arg0
 */
appendText : function (
char 
)
{
},

/**
 * @method getInstance
 * @return {ColorLogManager}
 */
getInstance : function (
)
{
    return ColorLogManager;
},

};

/**
 * @class MapManager
 */
cb.MapManager = {

/**
 * @method getMapNode
 * @return {cc.Node}
 */
getMapNode : function (
)
{
    return cc.Node;
},

/**
 * @method getFarMapNode
 * @return {cc.Node}
 */
getFarMapNode : function (
)
{
    return cc.Node;
},

/**
 * @method getMapWidth
 * @return {int}
 */
getMapWidth : function (
)
{
    return 0;
},

/**
 * @method getCurrentResId
 * @return {int}
 */
getCurrentResId : function (
)
{
    return 0;
},

/**
 * @method clearFarMap
 * @param {int} arg0
 */
clearFarMap : function (
int 
)
{
},

/**
 * @method loadMap
 * @param {int} arg0
 * @param {int} arg1
 * @param {int} arg2
 */
loadMap : function (
int, 
int, 
int 
)
{
},

/**
 * @method getMapHeight
 * @return {int}
 */
getMapHeight : function (
)
{
    return 0;
},

/**
 * @method loadFarMap
 * @param {int} arg0
 * @param {int} arg1
 * @param {int} arg2
 */
loadFarMap : function (
int, 
int, 
int 
)
{
},

/**
 * @method clearMap
 * @param {int} arg0
 */
clearMap : function (
int 
)
{
},

/**
 * @method getInstance
 * @return {MapManager}
 */
getInstance : function (
)
{
    return map_object;
},

};

/**
 * @class GraphLayer
 */
cb.GraphLayer = {

/**
 * @method clearData
 */
clearData : function (
)
{
},

/**
 * @method refreshData
 */
refreshData : function (
)
{
},

/**
 * @method addData
 * @param {int} arg0
 * @param {int} arg1
 * @param {int} arg2
 * @param {int} arg3
 * @param {int} arg4
 * @param {int} arg5
 */
addData : function (
int, 
int, 
int, 
int, 
int, 
int 
)
{
},

/**
 * @method setMinXString
 * @param {char} arg0
 */
setMinXString : function (
char 
)
{
},

/**
 * @method enableEvent
 * @param {bool} arg0
 */
enableEvent : function (
bool 
)
{
},

/**
 * @method addEventListener
 * @param {function} arg0
 */
addEventListener : function (
func 
)
{
},

/**
 * @method setMaxXString
 * @param {char} arg0
 */
setMaxXString : function (
char 
)
{
},

/**
 * @method setAmountHeight
 * @param {int} arg0
 */
setAmountHeight : function (
int 
)
{
},

/**
 * @method setPointCount
 * @param {int} arg0
 */
setPointCount : function (
int 
)
{
},

/**
 * @method create
 * @param {int} arg0
 * @param {int} arg1
 * @return {GraphLayer}
 */
create : function (
int, 
int 
)
{
    return GraphLayer;
},

};

/**
 * @class SDKManager
 */
cb.SDKManager = {

/**
 * @method getPassword
 * @return {String}
 */
getPassword : function (
)
{
    return ;
},

/**
 * @method sdkLogout
 */
sdkLogout : function (
)
{
},

/**
 * @method showRewardedAd
 */
showRewardedAd : function (
)
{
},

/**
 * @method onPayCallback
 * @param {int} arg0
 */
onPayCallback : function (
int 
)
{
},

/**
 * @method sdkExit
 */
sdkExit : function (
)
{
},

/**
 * @method onAdsCallback
 */
onAdsCallback : function (
)
{
},

/**
 * @method submitExtendData
 * @param {char} arg0
 * @param {char} arg1
 * @param {int} arg2
 */
submitExtendData : function (
char, 
char, 
int 
)
{
},

/**
 * @method sdkInit
 */
sdkInit : function (
)
{
},

/**
 * @method sdkPay
 * @param {int} arg0
 */
sdkPay : function (
int 
)
{
},

/**
 * @method onLoginCallback
 * @param {String} arg0
 * @param {String} arg1
 */
onLoginCallback : function (
str, 
str 
)
{
},

/**
 * @method getChannelId
 * @return {int}
 */
getChannelId : function (
)
{
    return 0;
},

/**
 * @method sdkLogin
 */
sdkLogin : function (
)
{
},

/**
 * @method showAd
 */
showAd : function (
)
{
},

/**
 * @method getDeviceModel
 * @return {String}
 */
getDeviceModel : function (
)
{
    return ;
},

/**
 * @method getUserName
 * @return {String}
 */
getUserName : function (
)
{
    return ;
},

/**
 * @method getInstance
 * @return {SDKManager}
 */
getInstance : function (
)
{
    return SDKManager;
},

};
