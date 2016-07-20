#include "base/ccConfig.h"
#ifndef __cocos2dx_custom_core_h__
#define __cocos2dx_custom_core_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_CCRichText_class;
extern JSObject *jsb_CCRichText_prototype;

bool js_cocos2dx_custom_core_CCRichText_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_CCRichText_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_CCRichText(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_CCRichText_setLineSpace(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_removeRichNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_setBlankHeight(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_appendRichSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_appendRichSpriteFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_layoutChildren(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_appendRichAnimate(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_setDetailStyle(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_setTouchEnabled(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_getMixContentWidth(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_appendRichText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_setNodeSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_getTouchEnabled(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_setTextColor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_showDebug(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_appendRichNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_clearAll(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CCRichText_CCRichText(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_RichLabelsLayer_class;
extern JSObject *jsb_RichLabelsLayer_prototype;

bool js_cocos2dx_custom_core_RichLabelsLayer_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_RichLabelsLayer_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_RichLabelsLayer(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_RichLabelsLayer_enableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_appendRichText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_removeRichLabel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_setCurRichLabel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_setLabelSpace(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_justLayout(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_clearCurRichLabel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_resetRichLabels(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_isEnableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_layoutRichLabels(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_layoutCurRichLabel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_setDivideLineColor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_appendRichAnimate(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_setDetailStyle(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_clearAllRichLabels(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_getCurRichLabelText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_setTextColor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_appendRichSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_RichLabelsLayer_RichLabelsLayer(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_ShaderEffect_class;
extern JSObject *jsb_ShaderEffect_prototype;

bool js_cocos2dx_custom_core_ShaderEffect_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_ShaderEffect_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_ShaderEffect(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_ShaderEffect_setTarget(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ShaderEffect_getGLProgramState(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ShaderEffect_createWithFragmentFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ShaderEffect_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ShaderEffect_ShaderEffect(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_EffectManager_class;
extern JSObject *jsb_EffectManager_prototype;

bool js_cocos2dx_custom_core_EffectManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_EffectManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_EffectManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_EffectManager_registerShaderEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EffectManager_getGLProgramStateByKey(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EffectManager_getShaderEffectByKey(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EffectManager_useDefaultShaderEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EffectManager_useShaderEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EffectManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EffectManager_EffectManager(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_ItemBox_class;
extern JSObject *jsb_ItemBox_prototype;

bool js_cocos2dx_custom_core_ItemBox_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_ItemBox_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_ItemBox(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_ItemBox_enableSelectSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_getItemId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setItemId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_getIconSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableJobSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setNameLabelString(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableLockSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableRightUpLabel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableColorSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_showJobId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_isEnableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_selected(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setArrowSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setIconSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_adjustIconSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableArrowSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setDefaultSetting(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableRightDownLabel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableKeepSelect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setRightDownLabelString(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setBgSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setSelectSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_clearAllSetting(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setRightUpLabelString(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setColorSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableIconSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setLockSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_enableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_unselected(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setDefaultArrowSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setDefaultSelectSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBox_setDefaultBgSprite(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_ItemBoxLayer_class;
extern JSObject *jsb_ItemBoxLayer_prototype;

bool js_cocos2dx_custom_core_ItemBoxLayer_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_ItemBoxLayer_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_ItemBoxLayer(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByPosition(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_cancelSelectEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_isEnableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setIsCanScroll(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setKeepSelectEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_enableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setScrollType(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setLimitRow(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByItemId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setLimitColumn(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setItemCount(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_setViewSizeAndItemSize(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ItemBoxLayer_create(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_CommonLib_class;
extern JSObject *jsb_CommonLib_prototype;

bool js_cocos2dx_custom_core_CommonLib_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_CommonLib_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_CommonLib(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_CommonLib_saveFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_removeRes(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createAddMpNumber(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_getServerURL(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_stopBgMusic(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_playEffectSound(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_hostToIp(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createMobHurtNumber(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_getFileMD5(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_removeAnimation(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_stopEffectSound(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_getTodayInteger(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_MessageBox(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_showResInfo(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_initCommonLib(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_currentMilliSecond(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_currentSecond(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_stopAllEffectsSound(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_isJSBScriptZipRun(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createCritHurtNumber(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_isEnableEffectSound(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_genarelAnimation(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_isEnableBgMusic(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_enableEffectSound(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_playBgMusic(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_getServerIP(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_enableBgMusic(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_md5(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createUid(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_setServerURL(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_genarelAnimate(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createNormalHurtNumber(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_RandomProbability(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createDodge(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CommonLib_createAddHpNumber(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_EntitySpriteManger_class;
extern JSObject *jsb_EntitySpriteManger_prototype;

bool js_cocos2dx_custom_core_EntitySpriteManger_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_EntitySpriteManger_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_EntitySpriteManger(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_EntitySpriteManger_createEntitySprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteByType(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_clearActionBySkinId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_getHSkillActionByActionName(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_getAnimationByActionName(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_removeResBySkinId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_loadResBySkinId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteBySkinId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_getSkillActionByActionName(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_getActionByActionName(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_deleteInstance(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySpriteManger_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_EntitySprite_class;
extern JSObject *jsb_EntitySprite_prototype;

bool js_cocos2dx_custom_core_EntitySprite_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_EntitySprite_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_EntitySprite(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_EntitySprite_reset(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_setAnchorPoint(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_setShadowSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_show(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_setWeaponId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_loadRes(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_showHitEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_setOpacity(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_createHitEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_getContentSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_showAttackEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_initWithSkinId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_singleShow(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_enableSkillEffect(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_hideShadowSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_createAutoAnimateSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_create(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_removeResById(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_loadResById(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_clearAllRes(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_createAnimateSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_EntitySprite_EntitySprite(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_MarqueeManager_class;
extern JSObject *jsb_MarqueeManager_prototype;

bool js_cocos2dx_custom_core_MarqueeManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_MarqueeManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_MarqueeManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_MarqueeManager_appendRichNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_appendRichText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_stopMarquee(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_appendRichSprite(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_startMarquee(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_setLocalZOrder(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_setInterval(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_setBgImgFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_setStartPosition(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_setDetailStyle(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_setTextColor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MarqueeManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_ScrollLogManager_class;
extern JSObject *jsb_ScrollLogManager_prototype;

bool js_cocos2dx_custom_core_ScrollLogManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_ScrollLogManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_ScrollLogManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_ScrollLogManager_pushLog(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ScrollLogManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_ColorLogManager_class;
extern JSObject *jsb_ColorLogManager_prototype;

bool js_cocos2dx_custom_core_ColorLogManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_ColorLogManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_ColorLogManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_ColorLogManager_pushNewLog(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_cancelRichLog(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setFontFamily(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setLocalZOrder(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_endRichLog(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setDefaultColorFormat(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_pushLog(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_appendNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setFontSize(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setBgImgFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setPosition(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_resetDefaultFormat(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_setFontColor(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_appendText(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_ColorLogManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_MapManager_class;
extern JSObject *jsb_MapManager_prototype;

bool js_cocos2dx_custom_core_MapManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_MapManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_MapManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_MapManager_getMapNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_getFarMapNode(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_getMapWidth(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_getCurrentResId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_clearFarMap(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_loadMap(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_getMapHeight(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_loadFarMap(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_clearMap(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_MapManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_GraphLayer_class;
extern JSObject *jsb_GraphLayer_prototype;

bool js_cocos2dx_custom_core_GraphLayer_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_GraphLayer_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_GraphLayer(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_GraphLayer_clearData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_refreshData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_addData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_setMinXString(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_enableEvent(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_setMaxXString(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_setAmountHeight(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_setPointCount(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_GraphLayer_create(JSContext *cx, uint32_t argc, jsval *vp);

extern JSClass  *jsb_SDKManager_class;
extern JSObject *jsb_SDKManager_prototype;

bool js_cocos2dx_custom_core_SDKManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_SDKManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_SDKManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_SDKManager_getPassword(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_sdkLogout(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_showRewardedAd(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_onPayCallback(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_sdkExit(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_onAdsCallback(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_submitExtendData(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_sdkInit(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_sdkPay(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_onLoginCallback(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_getChannelId(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_sdkLogin(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_showAd(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_getDeviceModel(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_getUserName(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_SDKManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __cocos2dx_custom_core_h__
