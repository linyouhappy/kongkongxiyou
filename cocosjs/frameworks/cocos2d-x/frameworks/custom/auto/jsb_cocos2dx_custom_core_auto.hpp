#include "base/ccConfig.h"
#ifndef __cocos2dx_custom_core_h__
#define __cocos2dx_custom_core_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_CUpdateManager_class;
extern JSObject *jsb_CUpdateManager_prototype;

bool js_cocos2dx_custom_core_CUpdateManager_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_cocos2dx_custom_core_CUpdateManager_finalize(JSContext *cx, JSObject *obj);
void js_register_cocos2dx_custom_core_CUpdateManager(JSContext *cx, JS::HandleObject global);
void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj);
bool js_cocos2dx_custom_core_CUpdateManager_startDownload(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CUpdateManager_loadResource(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CUpdateManager_prepareDownload(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CUpdateManager_checkResUpdate(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CUpdateManager_deleteInstance(JSContext *cx, uint32_t argc, jsval *vp);
bool js_cocos2dx_custom_core_CUpdateManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __cocos2dx_custom_core_h__
