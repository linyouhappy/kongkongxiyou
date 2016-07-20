#include "jsb_cocos2dx_custom_core_auto.hpp"
#include "cocos2d_specifics.hpp"
#include "GameCore.h"

template<class T>
static bool dummy_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedValue initializing(cx);
    bool isNewValid = true;
    JS::RootedObject global(cx, ScriptingCore::getInstance()->getGlobalObject());
    isNewValid = JS_GetProperty(cx, global, "initializing", &initializing) && initializing.toBoolean();
    if (isNewValid)
    {
        TypeTest<T> t;
        js_type_class_t *typeClass = nullptr;
        std::string typeName = t.s_name();
        auto typeMapIter = _js_global_type_map.find(typeName);
        CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
        typeClass = typeMapIter->second;
        CCASSERT(typeClass, "The value is null.");

        JS::RootedObject proto(cx, typeClass->proto.get());
        JS::RootedObject parent(cx, typeClass->parentProto.get());
        JS::RootedObject _tmp(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
        
        args.rval().set(OBJECT_TO_JSVAL(_tmp));
        return true;
    }

    JS_ReportError(cx, "Constructor for the requested class is not available, please refer to the API reference.");
    return false;
}

static bool empty_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
    return false;
}

static bool js_is_native_obj(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    args.rval().setBoolean(true);
    return true;    
}
JSClass  *jsb_CCRichText_class;
JSObject *jsb_CCRichText_prototype;

bool js_cocos2dx_custom_core_CCRichText_setLineSpace(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_setLineSpace : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_setLineSpace : Error processing arguments");
        cobj->setLineSpace(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_setLineSpace : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_removeRichNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_removeRichNode : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_removeRichNode : Error processing arguments");
        cobj->removeRichNode(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_removeRichNode : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_setBlankHeight(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_setBlankHeight : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_setBlankHeight : Error processing arguments");
        cobj->setBlankHeight(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_setBlankHeight : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_appendRichSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichSprite : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        int arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichSprite : Error processing arguments");
        cobj->appendRichSprite(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_appendRichSprite : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_appendRichSpriteFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichSpriteFile : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        int arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichSpriteFile : Error processing arguments");
        cobj->appendRichSpriteFile(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_appendRichSpriteFile : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_layoutChildren(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_layoutChildren : Invalid Native Object");
    if (argc == 0) {
        cobj->layoutChildren();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_layoutChildren : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_appendRichAnimate(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichAnimate : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        int arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichAnimate : Error processing arguments");
        cobj->appendRichAnimate(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_appendRichAnimate : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_setDetailStyle(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_setDetailStyle : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        cocos2d::Color4B arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_cccolor4b(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_setDetailStyle : Error processing arguments");
        cobj->setDetailStyle(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_setDetailStyle : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_setTouchEnabled(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_setTouchEnabled : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_setTouchEnabled : Error processing arguments");
        cobj->setTouchEnabled(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_setTouchEnabled : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_getMixContentWidth(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_getMixContentWidth : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getMixContentWidth();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_getMixContentWidth : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_appendRichText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichText : Invalid Native Object");
    if (argc == 4) {
        const char* arg0;
        kTextStyle arg1;
        int arg2;
        int arg3;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= jsval_to_int32(cx, args.get(3), (int32_t *)&arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichText : Error processing arguments");
        cobj->appendRichText(arg0, arg1, arg2, arg3);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_appendRichText : wrong number of arguments: %d, was expecting %d", argc, 4);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_setNodeSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_setNodeSprite : Invalid Native Object");
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_setNodeSprite : Error processing arguments");
        cobj->setNodeSprite(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_setNodeSprite : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_getTouchEnabled(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_getTouchEnabled : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->getTouchEnabled();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_getTouchEnabled : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_setTextColor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_setTextColor : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Color4B arg0;
        ok &= jsval_to_cccolor4b(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_setTextColor : Error processing arguments");
        cobj->setTextColor(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_setTextColor : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_showDebug(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_showDebug : Invalid Native Object");
    if (argc == 0) {
        cobj->showDebug();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_showDebug : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_appendRichNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichNode : Invalid Native Object");
    if (argc == 3) {
        cocos2d::Node* arg0;
        int arg1;
        int arg2;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_appendRichNode : Error processing arguments");
        cobj->appendRichNode(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_appendRichNode : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_clearAll(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CCRichText_clearAll : Invalid Native Object");
    if (argc == 0) {
        cobj->clearAll();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_clearAll : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CCRichText_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        int arg0;
        int arg1;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_create : Error processing arguments");
        CCRichText* ret = CCRichText::create(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<CCRichText>(cx, (CCRichText*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CCRichText_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CCRichText_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    int arg0;
    int arg1;
    ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
    ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
    JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CCRichText_constructor : Error processing arguments");
    CCRichText* cobj = new (std::nothrow) CCRichText(arg0, arg1);
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<CCRichText> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "CCRichText");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}

extern JSObject *jsb_cocos2d_Node_prototype;

void js_CCRichText_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (CCRichText)", obj);
}
void js_register_cocos2dx_custom_core_CCRichText(JSContext *cx, JS::HandleObject global) {
    jsb_CCRichText_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_CCRichText_class->name = "CCRichText";
    jsb_CCRichText_class->addProperty = JS_PropertyStub;
    jsb_CCRichText_class->delProperty = JS_DeletePropertyStub;
    jsb_CCRichText_class->getProperty = JS_PropertyStub;
    jsb_CCRichText_class->setProperty = JS_StrictPropertyStub;
    jsb_CCRichText_class->enumerate = JS_EnumerateStub;
    jsb_CCRichText_class->resolve = JS_ResolveStub;
    jsb_CCRichText_class->convert = JS_ConvertStub;
    jsb_CCRichText_class->finalize = js_CCRichText_finalize;
    jsb_CCRichText_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("setLineSpace", js_cocos2dx_custom_core_CCRichText_setLineSpace, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeRichNode", js_cocos2dx_custom_core_CCRichText_removeRichNode, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setBlankHeight", js_cocos2dx_custom_core_CCRichText_setBlankHeight, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichSprite", js_cocos2dx_custom_core_CCRichText_appendRichSprite, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichSpriteFile", js_cocos2dx_custom_core_CCRichText_appendRichSpriteFile, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("layoutChildren", js_cocos2dx_custom_core_CCRichText_layoutChildren, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichAnimate", js_cocos2dx_custom_core_CCRichText_appendRichAnimate, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDetailStyle", js_cocos2dx_custom_core_CCRichText_setDetailStyle, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setTouchEnabled", js_cocos2dx_custom_core_CCRichText_setTouchEnabled, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getMixContentWidth", js_cocos2dx_custom_core_CCRichText_getMixContentWidth, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichText", js_cocos2dx_custom_core_CCRichText_appendRichText, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setNodeSprite", js_cocos2dx_custom_core_CCRichText_setNodeSprite, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTouchEnabled", js_cocos2dx_custom_core_CCRichText_getTouchEnabled, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setTextColor", js_cocos2dx_custom_core_CCRichText_setTextColor, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showDebug", js_cocos2dx_custom_core_CCRichText_showDebug, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichNode", js_cocos2dx_custom_core_CCRichText_appendRichNode, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearAll", js_cocos2dx_custom_core_CCRichText_clearAll, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_custom_core_CCRichText_create, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_CCRichText_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Node_prototype),
        jsb_CCRichText_class,
        js_cocos2dx_custom_core_CCRichText_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "CCRichText", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<CCRichText> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_CCRichText_class;
        p->proto = jsb_CCRichText_prototype;
        p->parentProto = jsb_cocos2d_Node_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_RichLabelsLayer_class;
JSObject *jsb_RichLabelsLayer_prototype;

bool js_cocos2dx_custom_core_RichLabelsLayer_enableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_enableEvent : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_enableEvent : Error processing arguments");
        cobj->enableEvent(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_enableEvent : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_appendRichText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichText : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        kTextStyle arg1;
        int arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichText : Error processing arguments");
        cobj->appendRichText(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichText : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_removeRichLabel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_removeRichLabel : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_removeRichLabel : Error processing arguments");
        cobj->removeRichLabel(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_removeRichLabel : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_setCurRichLabel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setCurRichLabel : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setCurRichLabel : Error processing arguments");
        cobj->setCurRichLabel(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_setCurRichLabel : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_setLabelSpace(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setLabelSpace : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setLabelSpace : Error processing arguments");
        cobj->setLabelSpace(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_setLabelSpace : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_justLayout(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_justLayout : Invalid Native Object");
    if (argc == 0) {
        cobj->justLayout();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_justLayout : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_addEventListener : Invalid Native Object");
    if (argc == 1) {
        std::function<void (int)> arg0;
        do {
		    if(JS_TypeOfValue(cx, args.get(0)) == JSTYPE_FUNCTION)
		    {
		        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, args.thisv().toObjectOrNull(), args.get(0)));
		        auto lambda = [=](int larg0) -> void {
		            JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		            jsval largv[1];
		            largv[0] = int32_to_jsval(cx, larg0);
		            JS::RootedValue rval(cx);
		            bool succeed = func->invoke(1, &largv[0], &rval);
		            if (!succeed && JS_IsExceptionPending(cx)) {
		                JS_ReportPendingException(cx);
		            }
		        };
		        arg0 = lambda;
		    }
		    else
		    {
		        arg0 = nullptr;
		    }
		} while(0)
		;
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_addEventListener : Error processing arguments");
        cobj->addEventListener(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_addEventListener : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_clearCurRichLabel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_clearCurRichLabel : Invalid Native Object");
    if (argc == 0) {
        cobj->clearCurRichLabel();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_clearCurRichLabel : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_resetRichLabels(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_resetRichLabels : Invalid Native Object");
    if (argc == 0) {
        cobj->resetRichLabels();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_resetRichLabels : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_isEnableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_isEnableEvent : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->isEnableEvent();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_isEnableEvent : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_layoutRichLabels(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_layoutRichLabels : Invalid Native Object");
    if (argc == 0) {
        cobj->layoutRichLabels();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_layoutRichLabels : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_layoutCurRichLabel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_layoutCurRichLabel : Invalid Native Object");
    if (argc == 0) {
        cobj->layoutCurRichLabel();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_layoutCurRichLabel : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_setDivideLineColor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setDivideLineColor : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Color4B arg0;
        ok &= jsval_to_cccolor4b(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setDivideLineColor : Error processing arguments");
        cobj->setDivideLineColor(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_setDivideLineColor : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_appendRichAnimate(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichAnimate : Invalid Native Object");
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichAnimate : Error processing arguments");
        cobj->appendRichAnimate(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichAnimate : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_setDetailStyle(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setDetailStyle : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        cocos2d::Color4B arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_cccolor4b(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setDetailStyle : Error processing arguments");
        cobj->setDetailStyle(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_setDetailStyle : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_clearAllRichLabels(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_clearAllRichLabels : Invalid Native Object");
    if (argc == 0) {
        cobj->clearAllRichLabels();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_clearAllRichLabels : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_getCurRichLabelText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_getCurRichLabelText : Invalid Native Object");
    if (argc == 0) {
        CCRichText* ret = cobj->getCurRichLabelText();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<CCRichText>(cx, (CCRichText*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_getCurRichLabelText : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_setTextColor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setTextColor : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Color4B arg0;
        ok &= jsval_to_cccolor4b(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_setTextColor : Error processing arguments");
        cobj->setTextColor(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_setTextColor : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_appendRichSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichSprite : Invalid Native Object");
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichSprite : Error processing arguments");
        cobj->appendRichSprite(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_appendRichSprite : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_RichLabelsLayer_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        int arg0;
        int arg1;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_RichLabelsLayer_create : Error processing arguments");
        RichLabelsLayer* ret = RichLabelsLayer::create(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<RichLabelsLayer>(cx, (RichLabelsLayer*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_RichLabelsLayer_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_RichLabelsLayer_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    RichLabelsLayer* cobj = new (std::nothrow) RichLabelsLayer();
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<RichLabelsLayer> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "RichLabelsLayer");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}

extern JSObject *jsb_cocos2d_extension_ScrollView_prototype;

void js_RichLabelsLayer_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (RichLabelsLayer)", obj);
}
void js_register_cocos2dx_custom_core_RichLabelsLayer(JSContext *cx, JS::HandleObject global) {
    jsb_RichLabelsLayer_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_RichLabelsLayer_class->name = "RichLabelsLayer";
    jsb_RichLabelsLayer_class->addProperty = JS_PropertyStub;
    jsb_RichLabelsLayer_class->delProperty = JS_DeletePropertyStub;
    jsb_RichLabelsLayer_class->getProperty = JS_PropertyStub;
    jsb_RichLabelsLayer_class->setProperty = JS_StrictPropertyStub;
    jsb_RichLabelsLayer_class->enumerate = JS_EnumerateStub;
    jsb_RichLabelsLayer_class->resolve = JS_ResolveStub;
    jsb_RichLabelsLayer_class->convert = JS_ConvertStub;
    jsb_RichLabelsLayer_class->finalize = js_RichLabelsLayer_finalize;
    jsb_RichLabelsLayer_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("enableEvent", js_cocos2dx_custom_core_RichLabelsLayer_enableEvent, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichText", js_cocos2dx_custom_core_RichLabelsLayer_appendRichText, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeRichLabel", js_cocos2dx_custom_core_RichLabelsLayer_removeRichLabel, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setCurRichLabel", js_cocos2dx_custom_core_RichLabelsLayer_setCurRichLabel, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setLabelSpace", js_cocos2dx_custom_core_RichLabelsLayer_setLabelSpace, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("justLayout", js_cocos2dx_custom_core_RichLabelsLayer_justLayout, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("addEventListener", js_cocos2dx_custom_core_RichLabelsLayer_addEventListener, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearCurRichLabel", js_cocos2dx_custom_core_RichLabelsLayer_clearCurRichLabel, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("resetRichLabels", js_cocos2dx_custom_core_RichLabelsLayer_resetRichLabels, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("isEnableEvent", js_cocos2dx_custom_core_RichLabelsLayer_isEnableEvent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("layoutRichLabels", js_cocos2dx_custom_core_RichLabelsLayer_layoutRichLabels, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("layoutCurRichLabel", js_cocos2dx_custom_core_RichLabelsLayer_layoutCurRichLabel, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDivideLineColor", js_cocos2dx_custom_core_RichLabelsLayer_setDivideLineColor, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichAnimate", js_cocos2dx_custom_core_RichLabelsLayer_appendRichAnimate, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDetailStyle", js_cocos2dx_custom_core_RichLabelsLayer_setDetailStyle, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearAllRichLabels", js_cocos2dx_custom_core_RichLabelsLayer_clearAllRichLabels, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getCurRichLabelText", js_cocos2dx_custom_core_RichLabelsLayer_getCurRichLabelText, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setTextColor", js_cocos2dx_custom_core_RichLabelsLayer_setTextColor, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichSprite", js_cocos2dx_custom_core_RichLabelsLayer_appendRichSprite, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_custom_core_RichLabelsLayer_create, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_RichLabelsLayer_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_extension_ScrollView_prototype),
        jsb_RichLabelsLayer_class,
        js_cocos2dx_custom_core_RichLabelsLayer_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "RichLabelsLayer", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<RichLabelsLayer> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_RichLabelsLayer_class;
        p->proto = jsb_RichLabelsLayer_prototype;
        p->parentProto = jsb_cocos2d_extension_ScrollView_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_ShaderEffect_class;
JSObject *jsb_ShaderEffect_prototype;

bool js_cocos2dx_custom_core_ShaderEffect_setTarget(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ShaderEffect* cobj = (ShaderEffect *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ShaderEffect_setTarget : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Sprite* arg0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Sprite*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ShaderEffect_setTarget : Error processing arguments");
        cobj->setTarget(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ShaderEffect_setTarget : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ShaderEffect_getGLProgramState(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ShaderEffect* cobj = (ShaderEffect *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ShaderEffect_getGLProgramState : Invalid Native Object");
    if (argc == 0) {
        cocos2d::GLProgramState* ret = cobj->getGLProgramState();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::GLProgramState>(cx, (cocos2d::GLProgramState*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ShaderEffect_getGLProgramState : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ShaderEffect_createWithFragmentFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ShaderEffect_createWithFragmentFile : Error processing arguments");
        ShaderEffect* ret = ShaderEffect::createWithFragmentFile(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<ShaderEffect>(cx, (ShaderEffect*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ShaderEffect_createWithFragmentFile : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_ShaderEffect_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ShaderEffect_create : Error processing arguments");
        ShaderEffect* ret = ShaderEffect::create(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<ShaderEffect>(cx, (ShaderEffect*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ShaderEffect_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_ShaderEffect_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    ShaderEffect* cobj = new (std::nothrow) ShaderEffect();
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<ShaderEffect> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "ShaderEffect");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}

void js_ShaderEffect_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (ShaderEffect)", obj);
}
void js_register_cocos2dx_custom_core_ShaderEffect(JSContext *cx, JS::HandleObject global) {
    jsb_ShaderEffect_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_ShaderEffect_class->name = "ShaderEffect";
    jsb_ShaderEffect_class->addProperty = JS_PropertyStub;
    jsb_ShaderEffect_class->delProperty = JS_DeletePropertyStub;
    jsb_ShaderEffect_class->getProperty = JS_PropertyStub;
    jsb_ShaderEffect_class->setProperty = JS_StrictPropertyStub;
    jsb_ShaderEffect_class->enumerate = JS_EnumerateStub;
    jsb_ShaderEffect_class->resolve = JS_ResolveStub;
    jsb_ShaderEffect_class->convert = JS_ConvertStub;
    jsb_ShaderEffect_class->finalize = js_ShaderEffect_finalize;
    jsb_ShaderEffect_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("setTarget", js_cocos2dx_custom_core_ShaderEffect_setTarget, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getGLProgramState", js_cocos2dx_custom_core_ShaderEffect_getGLProgramState, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("createWithFragmentFile", js_cocos2dx_custom_core_ShaderEffect_createWithFragmentFile, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("create", js_cocos2dx_custom_core_ShaderEffect_create, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_ShaderEffect_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_ShaderEffect_class,
        js_cocos2dx_custom_core_ShaderEffect_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "ShaderEffect", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<ShaderEffect> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_ShaderEffect_class;
        p->proto = jsb_ShaderEffect_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_EffectManager_class;
JSObject *jsb_EffectManager_prototype;

bool js_cocos2dx_custom_core_EffectManager_registerShaderEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EffectManager* cobj = (EffectManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EffectManager_registerShaderEffect : Invalid Native Object");
    if (argc == 2) {
        const char* arg0;
        ShaderEffect* arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        do {
            if (args.get(1).isNull()) { arg1 = nullptr; break; }
            if (!args.get(1).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(1).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg1 = (ShaderEffect*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg1, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EffectManager_registerShaderEffect : Error processing arguments");
        cobj->registerShaderEffect(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EffectManager_registerShaderEffect : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_EffectManager_getGLProgramStateByKey(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EffectManager* cobj = (EffectManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EffectManager_getGLProgramStateByKey : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EffectManager_getGLProgramStateByKey : Error processing arguments");
        cocos2d::GLProgramState* ret = cobj->getGLProgramStateByKey(arg0);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::GLProgramState>(cx, (cocos2d::GLProgramState*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EffectManager_getGLProgramStateByKey : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EffectManager_getShaderEffectByKey(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EffectManager* cobj = (EffectManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EffectManager_getShaderEffectByKey : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EffectManager_getShaderEffectByKey : Error processing arguments");
        ShaderEffect* ret = cobj->getShaderEffectByKey(arg0);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<ShaderEffect>(cx, (ShaderEffect*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EffectManager_getShaderEffectByKey : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EffectManager_useDefaultShaderEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EffectManager* cobj = (EffectManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EffectManager_useDefaultShaderEffect : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Sprite* arg0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Sprite*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EffectManager_useDefaultShaderEffect : Error processing arguments");
        cobj->useDefaultShaderEffect(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EffectManager_useDefaultShaderEffect : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EffectManager_useShaderEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EffectManager* cobj = (EffectManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EffectManager_useShaderEffect : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Sprite* arg0;
        const char* arg1;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Sprite*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EffectManager_useShaderEffect : Error processing arguments");
        cobj->useShaderEffect(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EffectManager_useShaderEffect : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_EffectManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        EffectManager* ret = EffectManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<EffectManager>(cx, (EffectManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EffectManager_getInstance : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EffectManager_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    EffectManager* cobj = new (std::nothrow) EffectManager();
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<EffectManager> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "EffectManager");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}

void js_EffectManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (EffectManager)", obj);
}
void js_register_cocos2dx_custom_core_EffectManager(JSContext *cx, JS::HandleObject global) {
    jsb_EffectManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_EffectManager_class->name = "EffectManager";
    jsb_EffectManager_class->addProperty = JS_PropertyStub;
    jsb_EffectManager_class->delProperty = JS_DeletePropertyStub;
    jsb_EffectManager_class->getProperty = JS_PropertyStub;
    jsb_EffectManager_class->setProperty = JS_StrictPropertyStub;
    jsb_EffectManager_class->enumerate = JS_EnumerateStub;
    jsb_EffectManager_class->resolve = JS_ResolveStub;
    jsb_EffectManager_class->convert = JS_ConvertStub;
    jsb_EffectManager_class->finalize = js_EffectManager_finalize;
    jsb_EffectManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("registerShaderEffect", js_cocos2dx_custom_core_EffectManager_registerShaderEffect, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getGLProgramStateByKey", js_cocos2dx_custom_core_EffectManager_getGLProgramStateByKey, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getShaderEffectByKey", js_cocos2dx_custom_core_EffectManager_getShaderEffectByKey, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("useDefaultShaderEffect", js_cocos2dx_custom_core_EffectManager_useDefaultShaderEffect, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("useShaderEffect", js_cocos2dx_custom_core_EffectManager_useShaderEffect, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getInstance", js_cocos2dx_custom_core_EffectManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_EffectManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_EffectManager_class,
        js_cocos2dx_custom_core_EffectManager_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "EffectManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<EffectManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_EffectManager_class;
        p->proto = jsb_EffectManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_ItemBox_class;
JSObject *jsb_ItemBox_prototype;

bool js_cocos2dx_custom_core_ItemBox_enableSelectSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableSelectSprite : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableSelectSprite : Error processing arguments");
        cobj->enableSelectSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableSelectSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_getItemId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_getItemId : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getItemId();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_getItemId : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setItemId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setItemId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setItemId : Error processing arguments");
        cobj->setItemId(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setItemId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_getIconSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_getIconSprite : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Sprite* ret = cobj->getIconSprite();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Sprite>(cx, (cocos2d::Sprite*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_getIconSprite : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableJobSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableJobSprite : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableJobSprite : Error processing arguments");
        cobj->enableJobSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableJobSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setNameLabelString(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setNameLabelString : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setNameLabelString : Error processing arguments");
        cobj->setNameLabelString(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setNameLabelString : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableLockSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableLockSprite : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableLockSprite : Error processing arguments");
        cobj->enableLockSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableLockSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableRightUpLabel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableRightUpLabel : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableRightUpLabel : Error processing arguments");
        cobj->enableRightUpLabel(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableRightUpLabel : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableColorSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableColorSprite : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableColorSprite : Error processing arguments");
        cobj->enableColorSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableColorSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_showJobId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_showJobId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_showJobId : Error processing arguments");
        cobj->showJobId(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_showJobId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_isEnableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_isEnableEvent : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->isEnableEvent();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_isEnableEvent : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_selected(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_selected : Invalid Native Object");
    if (argc == 0) {
        cobj->selected();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_selected : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setArrowSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setArrowSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setArrowSprite : Error processing arguments");
        cobj->setArrowSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setArrowSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setIconSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setIconSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setIconSprite : Error processing arguments");
        cobj->setIconSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setIconSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_adjustIconSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_adjustIconSprite : Invalid Native Object");
    if (argc == 0) {
        cobj->adjustIconSprite();
        args.rval().setUndefined();
        return true;
    }
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_adjustIconSprite : Error processing arguments");
        cobj->adjustIconSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_adjustIconSprite : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableArrowSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableArrowSprite : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableArrowSprite : Error processing arguments");
        cobj->enableArrowSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableArrowSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setDefaultSetting(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setDefaultSetting : Invalid Native Object");
    if (argc == 0) {
        cobj->setDefaultSetting();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setDefaultSetting : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableRightDownLabel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableRightDownLabel : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableRightDownLabel : Error processing arguments");
        cobj->enableRightDownLabel(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableRightDownLabel : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableKeepSelect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableKeepSelect : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableKeepSelect : Error processing arguments");
        cobj->enableKeepSelect(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableKeepSelect : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setRightDownLabelString(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setRightDownLabelString : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setRightDownLabelString : Error processing arguments");
        cobj->setRightDownLabelString(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setRightDownLabelString : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setBgSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setBgSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setBgSprite : Error processing arguments");
        cobj->setBgSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setBgSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setSelectSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setSelectSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setSelectSprite : Error processing arguments");
        cobj->setSelectSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setSelectSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_clearAllSetting(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_clearAllSetting : Invalid Native Object");
    if (argc == 0) {
        cobj->clearAllSetting();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_clearAllSetting : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setRightUpLabelString(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setRightUpLabelString : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setRightUpLabelString : Error processing arguments");
        cobj->setRightUpLabelString(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setRightUpLabelString : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setColorSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setColorSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setColorSprite : Error processing arguments");
        cobj->setColorSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setColorSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableIconSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableIconSprite : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableIconSprite : Error processing arguments");
        cobj->enableIconSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableIconSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setLockSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_setLockSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setLockSprite : Error processing arguments");
        cobj->setLockSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setLockSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_enableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_enableEvent : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_enableEvent : Error processing arguments");
        cobj->enableEvent(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_enableEvent : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_unselected(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBox_unselected : Invalid Native Object");
    if (argc == 0) {
        cobj->unselected();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_unselected : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBox_setDefaultArrowSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setDefaultArrowSprite : Error processing arguments");
        ItemBox::setDefaultArrowSprite(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setDefaultArrowSprite : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_ItemBox_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        ItemBox* ret = ItemBox::create();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<ItemBox>(cx, (ItemBox*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_ItemBox_setDefaultSelectSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setDefaultSelectSprite : Error processing arguments");
        ItemBox::setDefaultSelectSprite(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setDefaultSelectSprite : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_ItemBox_setDefaultBgSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBox_setDefaultBgSprite : Error processing arguments");
        ItemBox::setDefaultBgSprite(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBox_setDefaultBgSprite : wrong number of arguments");
    return false;
}


extern JSObject *jsb_cocos2d_Node_prototype;

void js_ItemBox_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (ItemBox)", obj);
}
void js_register_cocos2dx_custom_core_ItemBox(JSContext *cx, JS::HandleObject global) {
    jsb_ItemBox_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_ItemBox_class->name = "ItemBox";
    jsb_ItemBox_class->addProperty = JS_PropertyStub;
    jsb_ItemBox_class->delProperty = JS_DeletePropertyStub;
    jsb_ItemBox_class->getProperty = JS_PropertyStub;
    jsb_ItemBox_class->setProperty = JS_StrictPropertyStub;
    jsb_ItemBox_class->enumerate = JS_EnumerateStub;
    jsb_ItemBox_class->resolve = JS_ResolveStub;
    jsb_ItemBox_class->convert = JS_ConvertStub;
    jsb_ItemBox_class->finalize = js_ItemBox_finalize;
    jsb_ItemBox_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("enableSelectSprite", js_cocos2dx_custom_core_ItemBox_enableSelectSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getItemId", js_cocos2dx_custom_core_ItemBox_getItemId, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setItemId", js_cocos2dx_custom_core_ItemBox_setItemId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getIconSprite", js_cocos2dx_custom_core_ItemBox_getIconSprite, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableJobSprite", js_cocos2dx_custom_core_ItemBox_enableJobSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setNameLabelString", js_cocos2dx_custom_core_ItemBox_setNameLabelString, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableLockSprite", js_cocos2dx_custom_core_ItemBox_enableLockSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableRightUpLabel", js_cocos2dx_custom_core_ItemBox_enableRightUpLabel, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableColorSprite", js_cocos2dx_custom_core_ItemBox_enableColorSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showJobId", js_cocos2dx_custom_core_ItemBox_showJobId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("isEnableEvent", js_cocos2dx_custom_core_ItemBox_isEnableEvent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("selected", js_cocos2dx_custom_core_ItemBox_selected, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setArrowSprite", js_cocos2dx_custom_core_ItemBox_setArrowSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setIconSprite", js_cocos2dx_custom_core_ItemBox_setIconSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("adjustIconSprite", js_cocos2dx_custom_core_ItemBox_adjustIconSprite, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableArrowSprite", js_cocos2dx_custom_core_ItemBox_enableArrowSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDefaultSetting", js_cocos2dx_custom_core_ItemBox_setDefaultSetting, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableRightDownLabel", js_cocos2dx_custom_core_ItemBox_enableRightDownLabel, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableKeepSelect", js_cocos2dx_custom_core_ItemBox_enableKeepSelect, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setRightDownLabelString", js_cocos2dx_custom_core_ItemBox_setRightDownLabelString, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setBgSprite", js_cocos2dx_custom_core_ItemBox_setBgSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setSelectSprite", js_cocos2dx_custom_core_ItemBox_setSelectSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearAllSetting", js_cocos2dx_custom_core_ItemBox_clearAllSetting, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setRightUpLabelString", js_cocos2dx_custom_core_ItemBox_setRightUpLabelString, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setColorSprite", js_cocos2dx_custom_core_ItemBox_setColorSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableIconSprite", js_cocos2dx_custom_core_ItemBox_enableIconSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setLockSprite", js_cocos2dx_custom_core_ItemBox_setLockSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableEvent", js_cocos2dx_custom_core_ItemBox_enableEvent, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("unselected", js_cocos2dx_custom_core_ItemBox_unselected, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("setDefaultArrowSprite", js_cocos2dx_custom_core_ItemBox_setDefaultArrowSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("create", js_cocos2dx_custom_core_ItemBox_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDefaultSelectSprite", js_cocos2dx_custom_core_ItemBox_setDefaultSelectSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDefaultBgSprite", js_cocos2dx_custom_core_ItemBox_setDefaultBgSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_ItemBox_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Node_prototype),
        jsb_ItemBox_class,
        dummy_constructor<ItemBox>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "ItemBox", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<ItemBox> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_ItemBox_class;
        p->proto = jsb_ItemBox_prototype;
        p->parentProto = jsb_cocos2d_Node_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_ItemBoxLayer_class;
JSObject *jsb_ItemBoxLayer_prototype;

bool js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByPosition(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByPosition : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByPosition : Error processing arguments");
        ItemBox* ret = cobj->getItemBoxByPosition(arg0);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<ItemBox>(cx, (ItemBox*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByPosition : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_cancelSelectEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_cancelSelectEffect : Invalid Native Object");
    if (argc == 0) {
        cobj->cancelSelectEffect();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_cancelSelectEffect : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_isEnableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_isEnableEvent : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->isEnableEvent();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_isEnableEvent : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setIsCanScroll(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setIsCanScroll : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setIsCanScroll : Error processing arguments");
        cobj->setIsCanScroll(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setIsCanScroll : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setKeepSelectEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setKeepSelectEffect : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setKeepSelectEffect : Error processing arguments");
        cobj->setKeepSelectEffect(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setKeepSelectEffect : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_enableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_enableEvent : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_enableEvent : Error processing arguments");
        cobj->enableEvent(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_enableEvent : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setScrollType(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setScrollType : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setScrollType : Error processing arguments");
        cobj->setScrollType(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setScrollType : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setLimitRow(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setLimitRow : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setLimitRow : Error processing arguments");
        cobj->setLimitRow(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setLimitRow : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByItemId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByItemId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByItemId : Error processing arguments");
        ItemBox* ret = cobj->getItemBoxByItemId(arg0);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<ItemBox>(cx, (ItemBox*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByItemId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setLimitColumn(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setLimitColumn : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setLimitColumn : Error processing arguments");
        cobj->setLimitColumn(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setLimitColumn : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setItemCount(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setItemCount : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setItemCount : Error processing arguments");
        cobj->setItemCount(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setItemCount : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_setViewSizeAndItemSize(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setViewSizeAndItemSize : Invalid Native Object");
    if (argc == 2) {
        cocos2d::Size arg0;
        cocos2d::Size arg1;
        ok &= jsval_to_ccsize(cx, args.get(0), &arg0);
        ok &= jsval_to_ccsize(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ItemBoxLayer_setViewSizeAndItemSize : Error processing arguments");
        cobj->setViewSizeAndItemSize(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_setViewSizeAndItemSize : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_ItemBoxLayer_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        ItemBoxLayer* ret = ItemBoxLayer::create();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<ItemBoxLayer>(cx, (ItemBoxLayer*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ItemBoxLayer_create : wrong number of arguments");
    return false;
}


extern JSObject *jsb_cocos2d_Node_prototype;

void js_ItemBoxLayer_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (ItemBoxLayer)", obj);
}
void js_register_cocos2dx_custom_core_ItemBoxLayer(JSContext *cx, JS::HandleObject global) {
    jsb_ItemBoxLayer_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_ItemBoxLayer_class->name = "ItemBoxLayer";
    jsb_ItemBoxLayer_class->addProperty = JS_PropertyStub;
    jsb_ItemBoxLayer_class->delProperty = JS_DeletePropertyStub;
    jsb_ItemBoxLayer_class->getProperty = JS_PropertyStub;
    jsb_ItemBoxLayer_class->setProperty = JS_StrictPropertyStub;
    jsb_ItemBoxLayer_class->enumerate = JS_EnumerateStub;
    jsb_ItemBoxLayer_class->resolve = JS_ResolveStub;
    jsb_ItemBoxLayer_class->convert = JS_ConvertStub;
    jsb_ItemBoxLayer_class->finalize = js_ItemBoxLayer_finalize;
    jsb_ItemBoxLayer_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("getItemBoxByPosition", js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByPosition, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("cancelSelectEffect", js_cocos2dx_custom_core_ItemBoxLayer_cancelSelectEffect, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("isEnableEvent", js_cocos2dx_custom_core_ItemBoxLayer_isEnableEvent, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setIsCanScroll", js_cocos2dx_custom_core_ItemBoxLayer_setIsCanScroll, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setKeepSelectEffect", js_cocos2dx_custom_core_ItemBoxLayer_setKeepSelectEffect, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableEvent", js_cocos2dx_custom_core_ItemBoxLayer_enableEvent, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setScrollType", js_cocos2dx_custom_core_ItemBoxLayer_setScrollType, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setLimitRow", js_cocos2dx_custom_core_ItemBoxLayer_setLimitRow, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getItemBoxByItemId", js_cocos2dx_custom_core_ItemBoxLayer_getItemBoxByItemId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setLimitColumn", js_cocos2dx_custom_core_ItemBoxLayer_setLimitColumn, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setItemCount", js_cocos2dx_custom_core_ItemBoxLayer_setItemCount, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setViewSizeAndItemSize", js_cocos2dx_custom_core_ItemBoxLayer_setViewSizeAndItemSize, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_custom_core_ItemBoxLayer_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_ItemBoxLayer_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Node_prototype),
        jsb_ItemBoxLayer_class,
        dummy_constructor<ItemBoxLayer>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "ItemBoxLayer", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<ItemBoxLayer> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_ItemBoxLayer_class;
        p->proto = jsb_ItemBoxLayer_prototype;
        p->parentProto = jsb_cocos2d_Node_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_CommonLib_class;
JSObject *jsb_CommonLib_prototype;

bool js_cocos2dx_custom_core_CommonLib_saveFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 3) {
        const char* arg0;
        const char* arg1;
        unsigned long arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        ok &= jsval_to_ulong(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_saveFile : Error processing arguments");
        bool ret = CommonLib::saveFile(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_saveFile : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_removeRes(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_removeRes : Error processing arguments");
        CommonLib::removeRes(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_removeRes : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createAddMpNumber(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        unsigned int arg0;
        ok &= jsval_to_uint32(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_createAddMpNumber : Error processing arguments");
        cocos2d::Node* ret = CommonLib::createAddMpNumber(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createAddMpNumber : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_getServerURL(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        const char* ret = CommonLib::getServerURL();
        jsval jsret = JSVAL_NULL;
        jsret = c_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_getServerURL : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_stopBgMusic(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_stopBgMusic : Error processing arguments");
        CommonLib::stopBgMusic(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_stopBgMusic : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_playEffectSound(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_playEffectSound : Error processing arguments");
        unsigned int ret = CommonLib::playEffectSound(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = uint32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 2) {
        const char* arg0;
        bool arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        arg1 = JS::ToBoolean(args.get(1));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_playEffectSound : Error processing arguments");
        unsigned int ret = CommonLib::playEffectSound(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        jsret = uint32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_playEffectSound : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_hostToIp(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_hostToIp : Error processing arguments");
        const char* ret = CommonLib::hostToIp(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = c_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_hostToIp : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createMobHurtNumber(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        unsigned int arg0;
        ok &= jsval_to_uint32(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_createMobHurtNumber : Error processing arguments");
        cocos2d::Node* ret = CommonLib::createMobHurtNumber(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createMobHurtNumber : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_getFileMD5(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_getFileMD5 : Error processing arguments");
        const char* ret = CommonLib::getFileMD5(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = c_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_getFileMD5 : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_removeAnimation(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_removeAnimation : Error processing arguments");
        CommonLib::removeAnimation(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_removeAnimation : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_stopEffectSound(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        unsigned int arg0;
        ok &= jsval_to_uint32(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_stopEffectSound : Error processing arguments");
        CommonLib::stopEffectSound(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_stopEffectSound : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_getTodayInteger(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        int ret = CommonLib::getTodayInteger();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_getTodayInteger : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_MessageBox(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        const char* arg0;
        const char* arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_MessageBox : Error processing arguments");
        CommonLib::MessageBox(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_MessageBox : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_showResInfo(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        CommonLib::showResInfo();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_showResInfo : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_initCommonLib(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        CommonLib::initCommonLib();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_initCommonLib : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_currentMilliSecond(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        long ret = CommonLib::currentMilliSecond();
        jsval jsret = JSVAL_NULL;
        jsret = long_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_currentMilliSecond : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_currentSecond(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        double ret = CommonLib::currentSecond();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_currentSecond : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_stopAllEffectsSound(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        CommonLib::stopAllEffectsSound();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_stopAllEffectsSound : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_isJSBScriptZipRun(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        bool ret = CommonLib::isJSBScriptZipRun();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_isJSBScriptZipRun : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createCritHurtNumber(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        unsigned int arg0;
        ok &= jsval_to_uint32(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_createCritHurtNumber : Error processing arguments");
        cocos2d::Node* ret = CommonLib::createCritHurtNumber(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createCritHurtNumber : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_isEnableEffectSound(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        bool ret = CommonLib::isEnableEffectSound();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_isEnableEffectSound : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_genarelAnimation(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        const char* arg0;
        const char* arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_genarelAnimation : Error processing arguments");
        cocos2d::Animation* ret = CommonLib::genarelAnimation(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animation>(cx, (cocos2d::Animation*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 3) {
        const char* arg0;
        const char* arg1;
        double arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_genarelAnimation : Error processing arguments");
        cocos2d::Animation* ret = CommonLib::genarelAnimation(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animation>(cx, (cocos2d::Animation*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 4) {
        const char* arg0;
        const char* arg1;
        double arg2;
        int arg3;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        ok &= jsval_to_int32(cx, args.get(3), (int32_t *)&arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_genarelAnimation : Error processing arguments");
        cocos2d::Animation* ret = CommonLib::genarelAnimation(arg0, arg1, arg2, arg3);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animation>(cx, (cocos2d::Animation*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_genarelAnimation : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_isEnableBgMusic(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        bool ret = CommonLib::isEnableBgMusic();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_isEnableBgMusic : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_enableEffectSound(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_enableEffectSound : Error processing arguments");
        CommonLib::enableEffectSound(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_enableEffectSound : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_playBgMusic(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_playBgMusic : Error processing arguments");
        CommonLib::playBgMusic(arg0);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 2) {
        const char* arg0;
        bool arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        arg1 = JS::ToBoolean(args.get(1));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_playBgMusic : Error processing arguments");
        CommonLib::playBgMusic(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_playBgMusic : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_getServerIP(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        const char* ret = CommonLib::getServerIP();
        jsval jsret = JSVAL_NULL;
        jsret = c_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_getServerIP : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_enableBgMusic(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_enableBgMusic : Error processing arguments");
        CommonLib::enableBgMusic(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_enableBgMusic : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_md5(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_md5 : Error processing arguments");
        const char* ret = CommonLib::md5(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = c_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_md5 : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createUid(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        int ret = CommonLib::createUid();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createUid : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_setServerURL(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_setServerURL : Error processing arguments");
        CommonLib::setServerURL(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_setServerURL : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_genarelAnimate(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        const char* arg0;
        const char* arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_genarelAnimate : Error processing arguments");
        cocos2d::Animate* ret = CommonLib::genarelAnimate(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animate>(cx, (cocos2d::Animate*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 3) {
        const char* arg0;
        const char* arg1;
        double arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_genarelAnimate : Error processing arguments");
        cocos2d::Animate* ret = CommonLib::genarelAnimate(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animate>(cx, (cocos2d::Animate*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 4) {
        const char* arg0;
        const char* arg1;
        double arg2;
        int arg3;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        ok &= jsval_to_int32(cx, args.get(3), (int32_t *)&arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_genarelAnimate : Error processing arguments");
        cocos2d::Animate* ret = CommonLib::genarelAnimate(arg0, arg1, arg2, arg3);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animate>(cx, (cocos2d::Animate*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_genarelAnimate : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createNormalHurtNumber(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        unsigned int arg0;
        ok &= jsval_to_uint32(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_createNormalHurtNumber : Error processing arguments");
        cocos2d::Node* ret = CommonLib::createNormalHurtNumber(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createNormalHurtNumber : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_RandomProbability(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_RandomProbability : Error processing arguments");
        bool ret = CommonLib::RandomProbability(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_RandomProbability : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createDodge(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        cocos2d::Node* ret = CommonLib::createDodge();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createDodge : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CommonLib_createAddHpNumber(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        unsigned int arg0;
        ok &= jsval_to_uint32(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_CommonLib_createAddHpNumber : Error processing arguments");
        cocos2d::Node* ret = CommonLib::createAddHpNumber(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CommonLib_createAddHpNumber : wrong number of arguments");
    return false;
}


void js_CommonLib_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (CommonLib)", obj);
}
void js_register_cocos2dx_custom_core_CommonLib(JSContext *cx, JS::HandleObject global) {
    jsb_CommonLib_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_CommonLib_class->name = "CommonLib";
    jsb_CommonLib_class->addProperty = JS_PropertyStub;
    jsb_CommonLib_class->delProperty = JS_DeletePropertyStub;
    jsb_CommonLib_class->getProperty = JS_PropertyStub;
    jsb_CommonLib_class->setProperty = JS_StrictPropertyStub;
    jsb_CommonLib_class->enumerate = JS_EnumerateStub;
    jsb_CommonLib_class->resolve = JS_ResolveStub;
    jsb_CommonLib_class->convert = JS_ConvertStub;
    jsb_CommonLib_class->finalize = js_CommonLib_finalize;
    jsb_CommonLib_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("saveFile", js_cocos2dx_custom_core_CommonLib_saveFile, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeRes", js_cocos2dx_custom_core_CommonLib_removeRes, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createAddMpNumber", js_cocos2dx_custom_core_CommonLib_createAddMpNumber, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getServerURL", js_cocos2dx_custom_core_CommonLib_getServerURL, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("stopBgMusic", js_cocos2dx_custom_core_CommonLib_stopBgMusic, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("playEffectSound", js_cocos2dx_custom_core_CommonLib_playEffectSound, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("hostToIp", js_cocos2dx_custom_core_CommonLib_hostToIp, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createMobHurtNumber", js_cocos2dx_custom_core_CommonLib_createMobHurtNumber, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFileMD5", js_cocos2dx_custom_core_CommonLib_getFileMD5, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeAnimation", js_cocos2dx_custom_core_CommonLib_removeAnimation, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("stopEffectSound", js_cocos2dx_custom_core_CommonLib_stopEffectSound, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getTodayInteger", js_cocos2dx_custom_core_CommonLib_getTodayInteger, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("MessageBox", js_cocos2dx_custom_core_CommonLib_MessageBox, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showResInfo", js_cocos2dx_custom_core_CommonLib_showResInfo, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("initCommonLib", js_cocos2dx_custom_core_CommonLib_initCommonLib, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("currentMilliSecond", js_cocos2dx_custom_core_CommonLib_currentMilliSecond, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("currentSecond", js_cocos2dx_custom_core_CommonLib_currentSecond, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("stopAllEffectsSound", js_cocos2dx_custom_core_CommonLib_stopAllEffectsSound, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("isJSBScriptZipRun", js_cocos2dx_custom_core_CommonLib_isJSBScriptZipRun, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createCritHurtNumber", js_cocos2dx_custom_core_CommonLib_createCritHurtNumber, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("isEnableEffectSound", js_cocos2dx_custom_core_CommonLib_isEnableEffectSound, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("genarelAnimation", js_cocos2dx_custom_core_CommonLib_genarelAnimation, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("isEnableBgMusic", js_cocos2dx_custom_core_CommonLib_isEnableBgMusic, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableEffectSound", js_cocos2dx_custom_core_CommonLib_enableEffectSound, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("playBgMusic", js_cocos2dx_custom_core_CommonLib_playBgMusic, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getServerIP", js_cocos2dx_custom_core_CommonLib_getServerIP, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableBgMusic", js_cocos2dx_custom_core_CommonLib_enableBgMusic, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("md5", js_cocos2dx_custom_core_CommonLib_md5, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createUid", js_cocos2dx_custom_core_CommonLib_createUid, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setServerURL", js_cocos2dx_custom_core_CommonLib_setServerURL, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("genarelAnimate", js_cocos2dx_custom_core_CommonLib_genarelAnimate, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createNormalHurtNumber", js_cocos2dx_custom_core_CommonLib_createNormalHurtNumber, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("RandomProbability", js_cocos2dx_custom_core_CommonLib_RandomProbability, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createDodge", js_cocos2dx_custom_core_CommonLib_createDodge, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createAddHpNumber", js_cocos2dx_custom_core_CommonLib_createAddHpNumber, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_CommonLib_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_CommonLib_class,
        dummy_constructor<CommonLib>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "CommonLib", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<CommonLib> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_CommonLib_class;
        p->proto = jsb_CommonLib_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_EntitySpriteManger_class;
JSObject *jsb_EntitySpriteManger_prototype;

bool js_cocos2dx_custom_core_EntitySpriteManger_createEntitySprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_createEntitySprite : Invalid Native Object");
    if (argc == 2) {
        int arg0;
        int arg1;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_createEntitySprite : Error processing arguments");
        EntitySprite* ret = cobj->createEntitySprite(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<EntitySprite>(cx, (EntitySprite*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_createEntitySprite : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteByType(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteByType : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteByType : Error processing arguments");
        cobj->clearEntitySpriteByType(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteByType : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_clearActionBySkinId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_clearActionBySkinId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_clearActionBySkinId : Error processing arguments");
        cobj->clearActionBySkinId(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_clearActionBySkinId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_getHSkillActionByActionName(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getHSkillActionByActionName : Invalid Native Object");
    if (argc == 5) {
        int arg0;
        int arg1;
        kActionType arg2;
        double arg3;
        double arg4;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= JS::ToNumber( cx, args.get(3), &arg3) && !std::isnan(arg3);
        ok &= JS::ToNumber( cx, args.get(4), &arg4) && !std::isnan(arg4);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getHSkillActionByActionName : Error processing arguments");
        cocos2d::Action* ret = cobj->getHSkillActionByActionName(arg0, arg1, arg2, arg3, arg4);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Action>(cx, (cocos2d::Action*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_getHSkillActionByActionName : wrong number of arguments: %d, was expecting %d", argc, 5);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_getAnimationByActionName(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;

    JS::RootedObject obj(cx);
    EntitySpriteManger* cobj = NULL;
    obj = args.thisv().toObjectOrNull();
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getAnimationByActionName : Invalid Native Object");
    do {
        if (argc == 3) {
            int arg0;
            ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
            if (!ok) { ok = true; break; }
            int arg1;
            ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
            if (!ok) { ok = true; break; }
            kActionType arg2;
            ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
            if (!ok) { ok = true; break; }
            cocos2d::Animation* ret = cobj->getAnimationByActionName(arg0, arg1, arg2);
            jsval jsret = JSVAL_NULL;
            do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animation>(cx, (cocos2d::Animation*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
            args.rval().set(jsret);
            return true;
        }
    } while(0);

    do {
        if (argc == 1) {
            const char* arg0;
            std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
            if (!ok) { ok = true; break; }
            cocos2d::Animation* ret = cobj->getAnimationByActionName(arg0);
            jsval jsret = JSVAL_NULL;
            do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Animation>(cx, (cocos2d::Animation*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
            args.rval().set(jsret);
            return true;
        }
    } while(0);

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_getAnimationByActionName : wrong number of arguments");
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_removeResBySkinId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_removeResBySkinId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_removeResBySkinId : Error processing arguments");
        cobj->removeResBySkinId(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_removeResBySkinId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_loadResBySkinId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_loadResBySkinId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_loadResBySkinId : Error processing arguments");
        bool ret = cobj->loadResBySkinId(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_loadResBySkinId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteBySkinId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteBySkinId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteBySkinId : Error processing arguments");
        cobj->clearEntitySpriteBySkinId(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteBySkinId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_getSkillActionByActionName(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getSkillActionByActionName : Invalid Native Object");
    if (argc == 5) {
        int arg0;
        int arg1;
        kActionType arg2;
        double arg3;
        double arg4;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= JS::ToNumber( cx, args.get(3), &arg3) && !std::isnan(arg3);
        ok &= JS::ToNumber( cx, args.get(4), &arg4) && !std::isnan(arg4);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getSkillActionByActionName : Error processing arguments");
        cocos2d::Action* ret = cobj->getSkillActionByActionName(arg0, arg1, arg2, arg3, arg4);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Action>(cx, (cocos2d::Action*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_getSkillActionByActionName : wrong number of arguments: %d, was expecting %d", argc, 5);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_getActionByActionName(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySpriteManger* cobj = (EntitySpriteManger *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getActionByActionName : Invalid Native Object");
    if (argc == 4) {
        int arg0;
        int arg1;
        kActionType arg2;
        double arg3;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= JS::ToNumber( cx, args.get(3), &arg3) && !std::isnan(arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySpriteManger_getActionByActionName : Error processing arguments");
        cocos2d::Action* ret = cobj->getActionByActionName(arg0, arg1, arg2, arg3);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Action>(cx, (cocos2d::Action*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_getActionByActionName : wrong number of arguments: %d, was expecting %d", argc, 4);
    return false;
}
bool js_cocos2dx_custom_core_EntitySpriteManger_deleteInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        EntitySpriteManger::deleteInstance();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_deleteInstance : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySpriteManger_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        EntitySpriteManger* ret = EntitySpriteManger::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<EntitySpriteManger>(cx, (EntitySpriteManger*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySpriteManger_getInstance : wrong number of arguments");
    return false;
}


void js_EntitySpriteManger_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (EntitySpriteManger)", obj);
}
void js_register_cocos2dx_custom_core_EntitySpriteManger(JSContext *cx, JS::HandleObject global) {
    jsb_EntitySpriteManger_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_EntitySpriteManger_class->name = "EntitySpriteManger";
    jsb_EntitySpriteManger_class->addProperty = JS_PropertyStub;
    jsb_EntitySpriteManger_class->delProperty = JS_DeletePropertyStub;
    jsb_EntitySpriteManger_class->getProperty = JS_PropertyStub;
    jsb_EntitySpriteManger_class->setProperty = JS_StrictPropertyStub;
    jsb_EntitySpriteManger_class->enumerate = JS_EnumerateStub;
    jsb_EntitySpriteManger_class->resolve = JS_ResolveStub;
    jsb_EntitySpriteManger_class->convert = JS_ConvertStub;
    jsb_EntitySpriteManger_class->finalize = js_EntitySpriteManger_finalize;
    jsb_EntitySpriteManger_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("createEntitySprite", js_cocos2dx_custom_core_EntitySpriteManger_createEntitySprite, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearEntitySpriteByType", js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteByType, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearActionBySkinId", js_cocos2dx_custom_core_EntitySpriteManger_clearActionBySkinId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getHSkillActionByActionName", js_cocos2dx_custom_core_EntitySpriteManger_getHSkillActionByActionName, 5, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getAnimationByActionName", js_cocos2dx_custom_core_EntitySpriteManger_getAnimationByActionName, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeResBySkinId", js_cocos2dx_custom_core_EntitySpriteManger_removeResBySkinId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("loadResBySkinId", js_cocos2dx_custom_core_EntitySpriteManger_loadResBySkinId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearEntitySpriteBySkinId", js_cocos2dx_custom_core_EntitySpriteManger_clearEntitySpriteBySkinId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getSkillActionByActionName", js_cocos2dx_custom_core_EntitySpriteManger_getSkillActionByActionName, 5, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getActionByActionName", js_cocos2dx_custom_core_EntitySpriteManger_getActionByActionName, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("deleteInstance", js_cocos2dx_custom_core_EntitySpriteManger_deleteInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getInstance", js_cocos2dx_custom_core_EntitySpriteManger_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_EntitySpriteManger_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_EntitySpriteManger_class,
        dummy_constructor<EntitySpriteManger>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "EntitySpriteManger", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<EntitySpriteManger> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_EntitySpriteManger_class;
        p->proto = jsb_EntitySpriteManger_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_EntitySprite_class;
JSObject *jsb_EntitySprite_prototype;

bool js_cocos2dx_custom_core_EntitySprite_reset(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_reset : Invalid Native Object");
    if (argc == 0) {
        cobj->reset();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_reset : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_setAnchorPoint(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_setAnchorPoint : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Vec2 arg0;
        ok &= jsval_to_vector2(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_setAnchorPoint : Error processing arguments");
        cobj->setAnchorPoint(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_setAnchorPoint : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_setShadowSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_setShadowSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_setShadowSprite : Error processing arguments");
        cobj->setShadowSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_setShadowSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_show(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_show : Invalid Native Object");
    if (argc == 3) {
        int arg0;
        int arg1;
        kActionType arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_show : Error processing arguments");
        bool ret = cobj->show(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 4) {
        int arg0;
        int arg1;
        kActionType arg2;
        double arg3;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= JS::ToNumber( cx, args.get(3), &arg3) && !std::isnan(arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_show : Error processing arguments");
        bool ret = cobj->show(arg0, arg1, arg2, arg3);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_show : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_setWeaponId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_setWeaponId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_setWeaponId : Error processing arguments");
        cobj->setWeaponId(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_setWeaponId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_loadRes(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_loadRes : Invalid Native Object");
    if (argc == 0) {
        cobj->loadRes();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_loadRes : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_showHitEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_showHitEffect : Invalid Native Object");
    if (argc == 3) {
        int arg0;
        double arg1;
        int arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_showHitEffect : Error processing arguments");
        cobj->showHitEffect(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 4) {
        int arg0;
        double arg1;
        int arg2;
        double arg3;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= JS::ToNumber( cx, args.get(3), &arg3) && !std::isnan(arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_showHitEffect : Error processing arguments");
        cobj->showHitEffect(arg0, arg1, arg2, arg3);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_showHitEffect : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_setOpacity(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_setOpacity : Invalid Native Object");
    if (argc == 1) {
        uint16_t arg0;
        ok &= jsval_to_uint16(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_setOpacity : Error processing arguments");
        cobj->setOpacity(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_setOpacity : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_createHitEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_createHitEffect : Invalid Native Object");
    if (argc == 2) {
        int arg0;
        double arg1;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_createHitEffect : Error processing arguments");
        cocos2d::Sprite* ret = cobj->createHitEffect(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Sprite>(cx, (cocos2d::Sprite*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }
    if (argc == 3) {
        int arg0;
        double arg1;
        double arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_createHitEffect : Error processing arguments");
        cocos2d::Sprite* ret = cobj->createHitEffect(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Sprite>(cx, (cocos2d::Sprite*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_createHitEffect : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_getContentSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_getContentSprite : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Sprite* ret = cobj->getContentSprite();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Sprite>(cx, (cocos2d::Sprite*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_getContentSprite : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_showAttackEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_showAttackEffect : Invalid Native Object");
    if (argc == 3) {
        int arg0;
        double arg1;
        int arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_showAttackEffect : Error processing arguments");
        cobj->showAttackEffect(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 4) {
        int arg0;
        double arg1;
        int arg2;
        double arg3;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= JS::ToNumber( cx, args.get(3), &arg3) && !std::isnan(arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_showAttackEffect : Error processing arguments");
        cobj->showAttackEffect(arg0, arg1, arg2, arg3);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_showAttackEffect : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_initWithSkinId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_initWithSkinId : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_initWithSkinId : Error processing arguments");
        bool ret = cobj->initWithSkinId(arg0);
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_initWithSkinId : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_singleShow(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_singleShow : Invalid Native Object");
    if (argc == 0) {
        bool ret = cobj->singleShow();
        jsval jsret = JSVAL_NULL;
        jsret = BOOLEAN_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_singleShow : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_enableSkillEffect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_enableSkillEffect : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_enableSkillEffect : Error processing arguments");
        cobj->enableSkillEffect(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_enableSkillEffect : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_hideShadowSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_EntitySprite_hideShadowSprite : Invalid Native Object");
    if (argc == 0) {
        cobj->hideShadowSprite();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_hideShadowSprite : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_EntitySprite_createAutoAnimateSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 3) {
        int arg0;
        double arg1;
        double arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= JS::ToNumber( cx, args.get(1), &arg1) && !std::isnan(arg1);
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_createAutoAnimateSprite : Error processing arguments");
        cocos2d::Sprite* ret = EntitySprite::createAutoAnimateSprite(arg0, arg1, arg2);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Sprite>(cx, (cocos2d::Sprite*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_createAutoAnimateSprite : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySprite_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_create : Error processing arguments");
        EntitySprite* ret = EntitySprite::create(arg0);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<EntitySprite>(cx, (EntitySprite*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_create : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySprite_removeResById(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_removeResById : Error processing arguments");
        EntitySprite::removeResById(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_removeResById : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySprite_loadResById(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_loadResById : Error processing arguments");
        EntitySprite::loadResById(arg0);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_loadResById : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySprite_clearAllRes(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        EntitySprite::clearAllRes();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_clearAllRes : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySprite_createAnimateSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 4) {
        int arg0;
        kActionType arg1;
        double arg2;
        unsigned int arg3;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= JS::ToNumber( cx, args.get(2), &arg2) && !std::isnan(arg2);
        ok &= jsval_to_uint32(cx, args.get(3), &arg3);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_EntitySprite_createAnimateSprite : Error processing arguments");
        cocos2d::Sprite* ret = EntitySprite::createAnimateSprite(arg0, arg1, arg2, arg3);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Sprite>(cx, (cocos2d::Sprite*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_EntitySprite_createAnimateSprite : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_EntitySprite_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    EntitySprite* cobj = new (std::nothrow) EntitySprite();
    cocos2d::Ref *_ccobj = dynamic_cast<cocos2d::Ref *>(cobj);
    if (_ccobj) {
        _ccobj->autorelease();
    }
    TypeTest<EntitySprite> t;
    js_type_class_t *typeClass = nullptr;
    std::string typeName = t.s_name();
    auto typeMapIter = _js_global_type_map.find(typeName);
    CCASSERT(typeMapIter != _js_global_type_map.end(), "Can't find the class type!");
    typeClass = typeMapIter->second;
    CCASSERT(typeClass, "The value is null.");
    // JSObject *obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
    JS::RootedObject proto(cx, typeClass->proto.get());
    JS::RootedObject parent(cx, typeClass->parentProto.get());
    JS::RootedObject obj(cx, JS_NewObject(cx, typeClass->jsclass, proto, parent));
    args.rval().set(OBJECT_TO_JSVAL(obj));
    // link the native object with the javascript object
    js_proxy_t* p = jsb_new_proxy(cobj, obj);
    AddNamedObjectRoot(cx, &p->obj, "EntitySprite");
    if (JS_HasProperty(cx, obj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(obj), "_ctor", args);
    return true;
}

extern JSObject *jsb_cocos2d_Node_prototype;

void js_EntitySprite_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (EntitySprite)", obj);
}
void js_register_cocos2dx_custom_core_EntitySprite(JSContext *cx, JS::HandleObject global) {
    jsb_EntitySprite_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_EntitySprite_class->name = "EntitySprite";
    jsb_EntitySprite_class->addProperty = JS_PropertyStub;
    jsb_EntitySprite_class->delProperty = JS_DeletePropertyStub;
    jsb_EntitySprite_class->getProperty = JS_PropertyStub;
    jsb_EntitySprite_class->setProperty = JS_StrictPropertyStub;
    jsb_EntitySprite_class->enumerate = JS_EnumerateStub;
    jsb_EntitySprite_class->resolve = JS_ResolveStub;
    jsb_EntitySprite_class->convert = JS_ConvertStub;
    jsb_EntitySprite_class->finalize = js_EntitySprite_finalize;
    jsb_EntitySprite_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("reset", js_cocos2dx_custom_core_EntitySprite_reset, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setAnchorPoint", js_cocos2dx_custom_core_EntitySprite_setAnchorPoint, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setShadowSprite", js_cocos2dx_custom_core_EntitySprite_setShadowSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("show", js_cocos2dx_custom_core_EntitySprite_show, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setWeaponId", js_cocos2dx_custom_core_EntitySprite_setWeaponId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("loadRes", js_cocos2dx_custom_core_EntitySprite_loadRes, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showHitEffect", js_cocos2dx_custom_core_EntitySprite_showHitEffect, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setOpacity", js_cocos2dx_custom_core_EntitySprite_setOpacity, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createHitEffect", js_cocos2dx_custom_core_EntitySprite_createHitEffect, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getContentSprite", js_cocos2dx_custom_core_EntitySprite_getContentSprite, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showAttackEffect", js_cocos2dx_custom_core_EntitySprite_showAttackEffect, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("initWithSkinId", js_cocos2dx_custom_core_EntitySprite_initWithSkinId, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("singleShow", js_cocos2dx_custom_core_EntitySprite_singleShow, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableSkillEffect", js_cocos2dx_custom_core_EntitySprite_enableSkillEffect, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("hideShadowSprite", js_cocos2dx_custom_core_EntitySprite_hideShadowSprite, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("createAutoAnimateSprite", js_cocos2dx_custom_core_EntitySprite_createAutoAnimateSprite, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("create", js_cocos2dx_custom_core_EntitySprite_create, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("removeResById", js_cocos2dx_custom_core_EntitySprite_removeResById, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("loadResById", js_cocos2dx_custom_core_EntitySprite_loadResById, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearAllRes", js_cocos2dx_custom_core_EntitySprite_clearAllRes, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("createAnimateSprite", js_cocos2dx_custom_core_EntitySprite_createAnimateSprite, 4, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_EntitySprite_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Node_prototype),
        jsb_EntitySprite_class,
        js_cocos2dx_custom_core_EntitySprite_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "EntitySprite", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<EntitySprite> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_EntitySprite_class;
        p->proto = jsb_EntitySprite_prototype;
        p->parentProto = jsb_cocos2d_Node_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_MarqueeManager_class;
JSObject *jsb_MarqueeManager_prototype;

bool js_cocos2dx_custom_core_MarqueeManager_appendRichNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_appendRichNode : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Node* arg0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_appendRichNode : Error processing arguments");
        cobj->appendRichNode(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_appendRichNode : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_appendRichText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_appendRichText : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_appendRichText : Error processing arguments");
        cobj->appendRichText(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_appendRichText : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_stopMarquee(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_stopMarquee : Invalid Native Object");
    if (argc == 0) {
        cobj->stopMarquee();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_stopMarquee : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_appendRichSprite(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_appendRichSprite : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_appendRichSprite : Error processing arguments");
        cobj->appendRichSprite(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_appendRichSprite : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_startMarquee(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_startMarquee : Invalid Native Object");
    if (argc == 0) {
        cobj->startMarquee();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_startMarquee : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_setLocalZOrder(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setLocalZOrder : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setLocalZOrder : Error processing arguments");
        cobj->setLocalZOrder(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_setLocalZOrder : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_setInterval(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setInterval : Invalid Native Object");
    if (argc == 2) {
        int arg0;
        int arg1;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setInterval : Error processing arguments");
        cobj->setInterval(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_setInterval : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_setBgImgFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setBgImgFile : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setBgImgFile : Error processing arguments");
        cobj->setBgImgFile(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_setBgImgFile : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_setStartPosition(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setStartPosition : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Vec2 arg0;
        ok &= jsval_to_vector2(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setStartPosition : Error processing arguments");
        cobj->setStartPosition(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_setStartPosition : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_setDetailStyle(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setDetailStyle : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        cocos2d::Color4B arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_cccolor4b(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setDetailStyle : Error processing arguments");
        cobj->setDetailStyle(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_setDetailStyle : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_setTextColor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MarqueeManager* cobj = (MarqueeManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setTextColor : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Color4B arg0;
        ok &= jsval_to_cccolor4b(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MarqueeManager_setTextColor : Error processing arguments");
        cobj->setTextColor(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_setTextColor : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MarqueeManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        MarqueeManager* ret = MarqueeManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<MarqueeManager>(cx, (MarqueeManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_MarqueeManager_getInstance : wrong number of arguments");
    return false;
}


void js_MarqueeManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (MarqueeManager)", obj);
}
void js_register_cocos2dx_custom_core_MarqueeManager(JSContext *cx, JS::HandleObject global) {
    jsb_MarqueeManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_MarqueeManager_class->name = "MarqueeManager";
    jsb_MarqueeManager_class->addProperty = JS_PropertyStub;
    jsb_MarqueeManager_class->delProperty = JS_DeletePropertyStub;
    jsb_MarqueeManager_class->getProperty = JS_PropertyStub;
    jsb_MarqueeManager_class->setProperty = JS_StrictPropertyStub;
    jsb_MarqueeManager_class->enumerate = JS_EnumerateStub;
    jsb_MarqueeManager_class->resolve = JS_ResolveStub;
    jsb_MarqueeManager_class->convert = JS_ConvertStub;
    jsb_MarqueeManager_class->finalize = js_MarqueeManager_finalize;
    jsb_MarqueeManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("appendRichNode", js_cocos2dx_custom_core_MarqueeManager_appendRichNode, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichText", js_cocos2dx_custom_core_MarqueeManager_appendRichText, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("stopMarquee", js_cocos2dx_custom_core_MarqueeManager_stopMarquee, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendRichSprite", js_cocos2dx_custom_core_MarqueeManager_appendRichSprite, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("startMarquee", js_cocos2dx_custom_core_MarqueeManager_startMarquee, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setLocalZOrder", js_cocos2dx_custom_core_MarqueeManager_setLocalZOrder, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setInterval", js_cocos2dx_custom_core_MarqueeManager_setInterval, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setBgImgFile", js_cocos2dx_custom_core_MarqueeManager_setBgImgFile, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setStartPosition", js_cocos2dx_custom_core_MarqueeManager_setStartPosition, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDetailStyle", js_cocos2dx_custom_core_MarqueeManager_setDetailStyle, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setTextColor", js_cocos2dx_custom_core_MarqueeManager_setTextColor, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getInstance", js_cocos2dx_custom_core_MarqueeManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_MarqueeManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_MarqueeManager_class,
        dummy_constructor<MarqueeManager>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "MarqueeManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<MarqueeManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_MarqueeManager_class;
        p->proto = jsb_MarqueeManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_ScrollLogManager_class;
JSObject *jsb_ScrollLogManager_prototype;

bool js_cocos2dx_custom_core_ScrollLogManager_pushLog(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ScrollLogManager* cobj = (ScrollLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ScrollLogManager_pushLog : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ScrollLogManager_pushLog : Error processing arguments");
        cobj->pushLog(arg0);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ScrollLogManager_pushLog : Error processing arguments");
        cobj->pushLog(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ScrollLogManager_pushLog : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ScrollLogManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        ScrollLogManager* ret = ScrollLogManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<ScrollLogManager>(cx, (ScrollLogManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ScrollLogManager_getInstance : wrong number of arguments");
    return false;
}


void js_ScrollLogManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (ScrollLogManager)", obj);
}
void js_register_cocos2dx_custom_core_ScrollLogManager(JSContext *cx, JS::HandleObject global) {
    jsb_ScrollLogManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_ScrollLogManager_class->name = "ScrollLogManager";
    jsb_ScrollLogManager_class->addProperty = JS_PropertyStub;
    jsb_ScrollLogManager_class->delProperty = JS_DeletePropertyStub;
    jsb_ScrollLogManager_class->getProperty = JS_PropertyStub;
    jsb_ScrollLogManager_class->setProperty = JS_StrictPropertyStub;
    jsb_ScrollLogManager_class->enumerate = JS_EnumerateStub;
    jsb_ScrollLogManager_class->resolve = JS_ResolveStub;
    jsb_ScrollLogManager_class->convert = JS_ConvertStub;
    jsb_ScrollLogManager_class->finalize = js_ScrollLogManager_finalize;
    jsb_ScrollLogManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("pushLog", js_cocos2dx_custom_core_ScrollLogManager_pushLog, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getInstance", js_cocos2dx_custom_core_ScrollLogManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_ScrollLogManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_ScrollLogManager_class,
        dummy_constructor<ScrollLogManager>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "ScrollLogManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<ScrollLogManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_ScrollLogManager_class;
        p->proto = jsb_ScrollLogManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_ColorLogManager_class;
JSObject *jsb_ColorLogManager_prototype;

bool js_cocos2dx_custom_core_ColorLogManager_pushNewLog(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_pushNewLog : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        cocos2d::Color4B arg1;
        int arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_cccolor4b(cx, args.get(1), &arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_pushNewLog : Error processing arguments");
        cobj->pushNewLog(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_pushNewLog : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_cancelRichLog(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_cancelRichLog : Invalid Native Object");
    if (argc == 0) {
        cobj->cancelRichLog();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_cancelRichLog : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setFontFamily(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setFontFamily : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setFontFamily : Error processing arguments");
        cobj->setFontFamily(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setFontFamily : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame : Error processing arguments");
        cobj->appendSpriteFrame(arg0);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame : Error processing arguments");
        cobj->appendSpriteFrame(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setLocalZOrder(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setLocalZOrder : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setLocalZOrder : Error processing arguments");
        cobj->setLocalZOrder(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setLocalZOrder : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_endRichLog(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_endRichLog : Invalid Native Object");
    if (argc == 0) {
        cobj->endRichLog();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_endRichLog : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setDefaultColorFormat(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setDefaultColorFormat : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        int arg1;
        cocos2d::Color4B arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_cccolor4b(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setDefaultColorFormat : Error processing arguments");
        cobj->setDefaultColorFormat(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setDefaultColorFormat : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_pushLog(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_pushLog : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_pushLog : Error processing arguments");
        cobj->pushLog(arg0);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_pushLog : Error processing arguments");
        cobj->pushLog(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_pushLog : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_appendNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendNode : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Node* arg0;
        do {
            if (args.get(0).isNull()) { arg0 = nullptr; break; }
            if (!args.get(0).isObject()) { ok = false; break; }
            js_proxy_t *jsProxy;
            JSObject *tmpObj = args.get(0).toObjectOrNull();
            jsProxy = jsb_get_js_proxy(tmpObj);
            arg0 = (cocos2d::Node*)(jsProxy ? jsProxy->ptr : NULL);
            JSB_PRECONDITION2( arg0, cx, false, "Invalid Native Object");
        } while (0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendNode : Error processing arguments");
        cobj->appendNode(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_appendNode : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setFontSize(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setFontSize : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setFontSize : Error processing arguments");
        cobj->setFontSize(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setFontSize : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setBgImgFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setBgImgFile : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setBgImgFile : Error processing arguments");
        cobj->setBgImgFile(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setBgImgFile : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setPosition(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setPosition : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Vec2 arg0;
        ok &= jsval_to_vector2(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setPosition : Error processing arguments");
        cobj->setPosition(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setPosition : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_resetDefaultFormat(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_resetDefaultFormat : Invalid Native Object");
    if (argc == 0) {
        cobj->resetDefaultFormat();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_resetDefaultFormat : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_setFontColor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setFontColor : Invalid Native Object");
    if (argc == 1) {
        cocos2d::Color4B arg0;
        ok &= jsval_to_cccolor4b(cx, args.get(0), &arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_setFontColor : Error processing arguments");
        cobj->setFontColor(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_setFontColor : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile : Error processing arguments");
        cobj->appendSpriteFile(arg0);
        args.rval().setUndefined();
        return true;
    }
    if (argc == 2) {
        const char* arg0;
        int arg1;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile : Error processing arguments");
        cobj->appendSpriteFile(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_appendText(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ColorLogManager* cobj = (ColorLogManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendText : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_ColorLogManager_appendText : Error processing arguments");
        cobj->appendText(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_appendText : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_ColorLogManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        ColorLogManager* ret = ColorLogManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<ColorLogManager>(cx, (ColorLogManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_ColorLogManager_getInstance : wrong number of arguments");
    return false;
}


void js_ColorLogManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (ColorLogManager)", obj);
}
void js_register_cocos2dx_custom_core_ColorLogManager(JSContext *cx, JS::HandleObject global) {
    jsb_ColorLogManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_ColorLogManager_class->name = "ColorLogManager";
    jsb_ColorLogManager_class->addProperty = JS_PropertyStub;
    jsb_ColorLogManager_class->delProperty = JS_DeletePropertyStub;
    jsb_ColorLogManager_class->getProperty = JS_PropertyStub;
    jsb_ColorLogManager_class->setProperty = JS_StrictPropertyStub;
    jsb_ColorLogManager_class->enumerate = JS_EnumerateStub;
    jsb_ColorLogManager_class->resolve = JS_ResolveStub;
    jsb_ColorLogManager_class->convert = JS_ConvertStub;
    jsb_ColorLogManager_class->finalize = js_ColorLogManager_finalize;
    jsb_ColorLogManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("pushNewLog", js_cocos2dx_custom_core_ColorLogManager_pushNewLog, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("cancelRichLog", js_cocos2dx_custom_core_ColorLogManager_cancelRichLog, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setFontFamily", js_cocos2dx_custom_core_ColorLogManager_setFontFamily, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendSpriteFrame", js_cocos2dx_custom_core_ColorLogManager_appendSpriteFrame, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setLocalZOrder", js_cocos2dx_custom_core_ColorLogManager_setLocalZOrder, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("endRichLog", js_cocos2dx_custom_core_ColorLogManager_endRichLog, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setDefaultColorFormat", js_cocos2dx_custom_core_ColorLogManager_setDefaultColorFormat, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("pushLog", js_cocos2dx_custom_core_ColorLogManager_pushLog, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendNode", js_cocos2dx_custom_core_ColorLogManager_appendNode, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setFontSize", js_cocos2dx_custom_core_ColorLogManager_setFontSize, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setBgImgFile", js_cocos2dx_custom_core_ColorLogManager_setBgImgFile, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setPosition", js_cocos2dx_custom_core_ColorLogManager_setPosition, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("resetDefaultFormat", js_cocos2dx_custom_core_ColorLogManager_resetDefaultFormat, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setFontColor", js_cocos2dx_custom_core_ColorLogManager_setFontColor, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendSpriteFile", js_cocos2dx_custom_core_ColorLogManager_appendSpriteFile, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("appendText", js_cocos2dx_custom_core_ColorLogManager_appendText, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getInstance", js_cocos2dx_custom_core_ColorLogManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_ColorLogManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_ColorLogManager_class,
        dummy_constructor<ColorLogManager>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "ColorLogManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<ColorLogManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_ColorLogManager_class;
        p->proto = jsb_ColorLogManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_MapManager_class;
JSObject *jsb_MapManager_prototype;

bool js_cocos2dx_custom_core_MapManager_getMapNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_getMapNode : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Node* ret = cobj->getMapNode();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_getMapNode : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_getFarMapNode(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_getFarMapNode : Invalid Native Object");
    if (argc == 0) {
        cocos2d::Node* ret = cobj->getFarMapNode();
        jsval jsret = JSVAL_NULL;
        do {
            if (ret) {
                js_proxy_t *jsProxy = js_get_or_create_proxy<cocos2d::Node>(cx, (cocos2d::Node*)ret);
                jsret = OBJECT_TO_JSVAL(jsProxy->obj);
            } else {
                jsret = JSVAL_NULL;
            }
        } while (0);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_getFarMapNode : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_getMapWidth(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_getMapWidth : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getMapWidth();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_getMapWidth : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_getCurrentResId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_getCurrentResId : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getCurrentResId();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_getCurrentResId : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_clearFarMap(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_clearFarMap : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MapManager_clearFarMap : Error processing arguments");
        cobj->clearFarMap(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_clearFarMap : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_loadMap(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_loadMap : Invalid Native Object");
    if (argc == 3) {
        int arg0;
        int arg1;
        int arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MapManager_loadMap : Error processing arguments");
        cobj->loadMap(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_loadMap : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_getMapHeight(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_getMapHeight : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getMapHeight();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_getMapHeight : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_loadFarMap(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_loadFarMap : Invalid Native Object");
    if (argc == 3) {
        int arg0;
        int arg1;
        int arg2;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MapManager_loadFarMap : Error processing arguments");
        cobj->loadFarMap(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_loadFarMap : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_clearMap(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    MapManager* cobj = (MapManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_MapManager_clearMap : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_MapManager_clearMap : Error processing arguments");
        cobj->clearMap(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_clearMap : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_MapManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        MapManager* ret = MapManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<MapManager>(cx, (MapManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_MapManager_getInstance : wrong number of arguments");
    return false;
}


void js_MapManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (MapManager)", obj);
}
void js_register_cocos2dx_custom_core_MapManager(JSContext *cx, JS::HandleObject global) {
    jsb_MapManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_MapManager_class->name = "MapManager";
    jsb_MapManager_class->addProperty = JS_PropertyStub;
    jsb_MapManager_class->delProperty = JS_DeletePropertyStub;
    jsb_MapManager_class->getProperty = JS_PropertyStub;
    jsb_MapManager_class->setProperty = JS_StrictPropertyStub;
    jsb_MapManager_class->enumerate = JS_EnumerateStub;
    jsb_MapManager_class->resolve = JS_ResolveStub;
    jsb_MapManager_class->convert = JS_ConvertStub;
    jsb_MapManager_class->finalize = js_MapManager_finalize;
    jsb_MapManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("getMapNode", js_cocos2dx_custom_core_MapManager_getMapNode, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getFarMapNode", js_cocos2dx_custom_core_MapManager_getFarMapNode, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getMapWidth", js_cocos2dx_custom_core_MapManager_getMapWidth, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getCurrentResId", js_cocos2dx_custom_core_MapManager_getCurrentResId, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearFarMap", js_cocos2dx_custom_core_MapManager_clearFarMap, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("loadMap", js_cocos2dx_custom_core_MapManager_loadMap, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getMapHeight", js_cocos2dx_custom_core_MapManager_getMapHeight, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("loadFarMap", js_cocos2dx_custom_core_MapManager_loadFarMap, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearMap", js_cocos2dx_custom_core_MapManager_clearMap, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getInstance", js_cocos2dx_custom_core_MapManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_MapManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_MapManager_class,
        dummy_constructor<MapManager>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "MapManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<MapManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_MapManager_class;
        p->proto = jsb_MapManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_GraphLayer_class;
JSObject *jsb_GraphLayer_prototype;

bool js_cocos2dx_custom_core_GraphLayer_clearData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_clearData : Invalid Native Object");
    if (argc == 0) {
        cobj->clearData();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_clearData : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_refreshData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_refreshData : Invalid Native Object");
    if (argc == 0) {
        cobj->refreshData();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_refreshData : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_addData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_addData : Invalid Native Object");
    if (argc == 6) {
        int arg0;
        int arg1;
        int arg2;
        int arg3;
        int arg4;
        int arg5;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        ok &= jsval_to_int32(cx, args.get(3), (int32_t *)&arg3);
        ok &= jsval_to_int32(cx, args.get(4), (int32_t *)&arg4);
        ok &= jsval_to_int32(cx, args.get(5), (int32_t *)&arg5);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_addData : Error processing arguments");
        cobj->addData(arg0, arg1, arg2, arg3, arg4, arg5);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_addData : wrong number of arguments: %d, was expecting %d", argc, 6);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_setMinXString(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_setMinXString : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_setMinXString : Error processing arguments");
        cobj->setMinXString(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_setMinXString : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_enableEvent(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_enableEvent : Invalid Native Object");
    if (argc == 1) {
        bool arg0;
        arg0 = JS::ToBoolean(args.get(0));
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_enableEvent : Error processing arguments");
        cobj->enableEvent(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_enableEvent : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_addEventListener : Invalid Native Object");
    if (argc == 1) {
        std::function<void (int)> arg0;
        do {
		    if(JS_TypeOfValue(cx, args.get(0)) == JSTYPE_FUNCTION)
		    {
		        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, args.thisv().toObjectOrNull(), args.get(0)));
		        auto lambda = [=](int larg0) -> void {
		            JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
		            jsval largv[1];
		            largv[0] = int32_to_jsval(cx, larg0);
		            JS::RootedValue rval(cx);
		            bool succeed = func->invoke(1, &largv[0], &rval);
		            if (!succeed && JS_IsExceptionPending(cx)) {
		                JS_ReportPendingException(cx);
		            }
		        };
		        arg0 = lambda;
		    }
		    else
		    {
		        arg0 = nullptr;
		    }
		} while(0)
		;
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_addEventListener : Error processing arguments");
        cobj->addEventListener(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_addEventListener : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_setMaxXString(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_setMaxXString : Invalid Native Object");
    if (argc == 1) {
        const char* arg0;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_setMaxXString : Error processing arguments");
        cobj->setMaxXString(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_setMaxXString : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_setAmountHeight(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_setAmountHeight : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_setAmountHeight : Error processing arguments");
        cobj->setAmountHeight(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_setAmountHeight : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_setPointCount(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_GraphLayer_setPointCount : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_setPointCount : Error processing arguments");
        cobj->setPointCount(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_setPointCount : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_GraphLayer_create(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 2) {
        int arg0;
        int arg1;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        ok &= jsval_to_int32(cx, args.get(1), (int32_t *)&arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_GraphLayer_create : Error processing arguments");
        GraphLayer* ret = GraphLayer::create(arg0, arg1);
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<GraphLayer>(cx, (GraphLayer*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_GraphLayer_create : wrong number of arguments");
    return false;
}


extern JSObject *jsb_cocos2d_Node_prototype;

void js_GraphLayer_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (GraphLayer)", obj);
}
void js_register_cocos2dx_custom_core_GraphLayer(JSContext *cx, JS::HandleObject global) {
    jsb_GraphLayer_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_GraphLayer_class->name = "GraphLayer";
    jsb_GraphLayer_class->addProperty = JS_PropertyStub;
    jsb_GraphLayer_class->delProperty = JS_DeletePropertyStub;
    jsb_GraphLayer_class->getProperty = JS_PropertyStub;
    jsb_GraphLayer_class->setProperty = JS_StrictPropertyStub;
    jsb_GraphLayer_class->enumerate = JS_EnumerateStub;
    jsb_GraphLayer_class->resolve = JS_ResolveStub;
    jsb_GraphLayer_class->convert = JS_ConvertStub;
    jsb_GraphLayer_class->finalize = js_GraphLayer_finalize;
    jsb_GraphLayer_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("clearData", js_cocos2dx_custom_core_GraphLayer_clearData, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("refreshData", js_cocos2dx_custom_core_GraphLayer_refreshData, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("addData", js_cocos2dx_custom_core_GraphLayer_addData, 6, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setMinXString", js_cocos2dx_custom_core_GraphLayer_setMinXString, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableEvent", js_cocos2dx_custom_core_GraphLayer_enableEvent, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("addEventListener", js_cocos2dx_custom_core_GraphLayer_addEventListener, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setMaxXString", js_cocos2dx_custom_core_GraphLayer_setMaxXString, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setAmountHeight", js_cocos2dx_custom_core_GraphLayer_setAmountHeight, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("setPointCount", js_cocos2dx_custom_core_GraphLayer_setPointCount, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_cocos2dx_custom_core_GraphLayer_create, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_GraphLayer_prototype = JS_InitClass(
        cx, global,
        JS::RootedObject(cx, jsb_cocos2d_Node_prototype),
        jsb_GraphLayer_class,
        dummy_constructor<GraphLayer>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "GraphLayer", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<GraphLayer> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_GraphLayer_class;
        p->proto = jsb_GraphLayer_prototype;
        p->parentProto = jsb_cocos2d_Node_prototype;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

JSClass  *jsb_SDKManager_class;
JSObject *jsb_SDKManager_prototype;

bool js_cocos2dx_custom_core_SDKManager_getPassword(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_getPassword : Invalid Native Object");
    if (argc == 0) {
        std::string ret = cobj->getPassword();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_getPassword : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_sdkLogout(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_sdkLogout : Invalid Native Object");
    if (argc == 0) {
        cobj->sdkLogout();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_sdkLogout : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_showRewardedAd(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_showRewardedAd : Invalid Native Object");
    if (argc == 0) {
        cobj->showRewardedAd();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_showRewardedAd : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_onPayCallback(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_onPayCallback : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_SDKManager_onPayCallback : Error processing arguments");
        cobj->onPayCallback(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_onPayCallback : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_sdkExit(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_sdkExit : Invalid Native Object");
    if (argc == 0) {
        cobj->sdkExit();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_sdkExit : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_onAdsCallback(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_onAdsCallback : Invalid Native Object");
    if (argc == 0) {
        cobj->onAdsCallback();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_onAdsCallback : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_submitExtendData(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_submitExtendData : Invalid Native Object");
    if (argc == 3) {
        const char* arg0;
        const char* arg1;
        int arg2;
        std::string arg0_tmp; ok &= jsval_to_std_string(cx, args.get(0), &arg0_tmp); arg0 = arg0_tmp.c_str();
        std::string arg1_tmp; ok &= jsval_to_std_string(cx, args.get(1), &arg1_tmp); arg1 = arg1_tmp.c_str();
        ok &= jsval_to_int32(cx, args.get(2), (int32_t *)&arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_SDKManager_submitExtendData : Error processing arguments");
        cobj->submitExtendData(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_submitExtendData : wrong number of arguments: %d, was expecting %d", argc, 3);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_sdkInit(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_sdkInit : Invalid Native Object");
    if (argc == 0) {
        cobj->sdkInit();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_sdkInit : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_sdkPay(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_sdkPay : Invalid Native Object");
    if (argc == 1) {
        int arg0;
        ok &= jsval_to_int32(cx, args.get(0), (int32_t *)&arg0);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_SDKManager_sdkPay : Error processing arguments");
        cobj->sdkPay(arg0);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_sdkPay : wrong number of arguments: %d, was expecting %d", argc, 1);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_onLoginCallback(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_onLoginCallback : Invalid Native Object");
    if (argc == 2) {
        std::string arg0;
        std::string arg1;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_string(cx, args.get(1), &arg1);
        JSB_PRECONDITION2(ok, cx, false, "js_cocos2dx_custom_core_SDKManager_onLoginCallback : Error processing arguments");
        cobj->onLoginCallback(arg0, arg1);
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_onLoginCallback : wrong number of arguments: %d, was expecting %d", argc, 2);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_getChannelId(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_getChannelId : Invalid Native Object");
    if (argc == 0) {
        int ret = cobj->getChannelId();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_getChannelId : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_sdkLogin(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_sdkLogin : Invalid Native Object");
    if (argc == 0) {
        cobj->sdkLogin();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_sdkLogin : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_showAd(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_showAd : Invalid Native Object");
    if (argc == 0) {
        cobj->showAd();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_showAd : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_getDeviceModel(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_getDeviceModel : Invalid Native Object");
    if (argc == 0) {
        std::string ret = cobj->getDeviceModel();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_getDeviceModel : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_getUserName(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_SDKManager_getUserName : Invalid Native Object");
    if (argc == 0) {
        std::string ret = cobj->getUserName();
        jsval jsret = JSVAL_NULL;
        jsret = std_string_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_getUserName : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_SDKManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        SDKManager* ret = SDKManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<SDKManager>(cx, (SDKManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_SDKManager_getInstance : wrong number of arguments");
    return false;
}


void js_SDKManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (SDKManager)", obj);
}
void js_register_cocos2dx_custom_core_SDKManager(JSContext *cx, JS::HandleObject global) {
    jsb_SDKManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_SDKManager_class->name = "SDKManager";
    jsb_SDKManager_class->addProperty = JS_PropertyStub;
    jsb_SDKManager_class->delProperty = JS_DeletePropertyStub;
    jsb_SDKManager_class->getProperty = JS_PropertyStub;
    jsb_SDKManager_class->setProperty = JS_StrictPropertyStub;
    jsb_SDKManager_class->enumerate = JS_EnumerateStub;
    jsb_SDKManager_class->resolve = JS_ResolveStub;
    jsb_SDKManager_class->convert = JS_ConvertStub;
    jsb_SDKManager_class->finalize = js_SDKManager_finalize;
    jsb_SDKManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("getPassword", js_cocos2dx_custom_core_SDKManager_getPassword, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("sdkLogout", js_cocos2dx_custom_core_SDKManager_sdkLogout, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showRewardedAd", js_cocos2dx_custom_core_SDKManager_showRewardedAd, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("onPayCallback", js_cocos2dx_custom_core_SDKManager_onPayCallback, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("sdkExit", js_cocos2dx_custom_core_SDKManager_sdkExit, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("onAdsCallback", js_cocos2dx_custom_core_SDKManager_onAdsCallback, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("submitExtendData", js_cocos2dx_custom_core_SDKManager_submitExtendData, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("sdkInit", js_cocos2dx_custom_core_SDKManager_sdkInit, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("sdkPay", js_cocos2dx_custom_core_SDKManager_sdkPay, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("onLoginCallback", js_cocos2dx_custom_core_SDKManager_onLoginCallback, 2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getChannelId", js_cocos2dx_custom_core_SDKManager_getChannelId, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("sdkLogin", js_cocos2dx_custom_core_SDKManager_sdkLogin, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("showAd", js_cocos2dx_custom_core_SDKManager_showAd, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getDeviceModel", js_cocos2dx_custom_core_SDKManager_getDeviceModel, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getUserName", js_cocos2dx_custom_core_SDKManager_getUserName, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getInstance", js_cocos2dx_custom_core_SDKManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_SDKManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_SDKManager_class,
        dummy_constructor<SDKManager>, 0, // no constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "SDKManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<SDKManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_SDKManager_class;
        p->proto = jsb_SDKManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "cb", &ns);

    js_register_cocos2dx_custom_core_GraphLayer(cx, ns);
    js_register_cocos2dx_custom_core_CCRichText(cx, ns);
    js_register_cocos2dx_custom_core_ColorLogManager(cx, ns);
    js_register_cocos2dx_custom_core_CommonLib(cx, ns);
    js_register_cocos2dx_custom_core_EntitySpriteManger(cx, ns);
    js_register_cocos2dx_custom_core_ScrollLogManager(cx, ns);
    js_register_cocos2dx_custom_core_EffectManager(cx, ns);
    js_register_cocos2dx_custom_core_MapManager(cx, ns);
    js_register_cocos2dx_custom_core_SDKManager(cx, ns);
    js_register_cocos2dx_custom_core_ShaderEffect(cx, ns);
    js_register_cocos2dx_custom_core_RichLabelsLayer(cx, ns);
    js_register_cocos2dx_custom_core_MarqueeManager(cx, ns);
    js_register_cocos2dx_custom_core_ItemBox(cx, ns);
    js_register_cocos2dx_custom_core_EntitySprite(cx, ns);
    js_register_cocos2dx_custom_core_ItemBoxLayer(cx, ns);
}

