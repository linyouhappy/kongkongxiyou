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
JSClass  *jsb_CUpdateManager_class;
JSObject *jsb_CUpdateManager_prototype;

bool js_cocos2dx_custom_core_CUpdateManager_startDownload(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CUpdateManager* cobj = (CUpdateManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CUpdateManager_startDownload : Invalid Native Object");
    if (argc == 0) {
        cobj->startDownload();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CUpdateManager_startDownload : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CUpdateManager_loadResource(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CUpdateManager* cobj = (CUpdateManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CUpdateManager_loadResource : Invalid Native Object");
    if (argc == 0) {
        cobj->loadResource();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CUpdateManager_loadResource : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CUpdateManager_prepareDownload(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CUpdateManager* cobj = (CUpdateManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CUpdateManager_prepareDownload : Invalid Native Object");
    if (argc == 0) {
        cobj->prepareDownload();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CUpdateManager_prepareDownload : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CUpdateManager_checkResUpdate(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    JS::RootedObject obj(cx, args.thisv().toObjectOrNull());
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CUpdateManager* cobj = (CUpdateManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "js_cocos2dx_custom_core_CUpdateManager_checkResUpdate : Invalid Native Object");
    if (argc == 0) {
        cobj->checkResUpdate();
        args.rval().setUndefined();
        return true;
    }

    JS_ReportError(cx, "js_cocos2dx_custom_core_CUpdateManager_checkResUpdate : wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}
bool js_cocos2dx_custom_core_CUpdateManager_deleteInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        CUpdateManager::deleteInstance();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CUpdateManager_deleteInstance : wrong number of arguments");
    return false;
}

bool js_cocos2dx_custom_core_CUpdateManager_getInstance(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        CUpdateManager* ret = CUpdateManager::getInstance();
        jsval jsret = JSVAL_NULL;
        do {
        if (ret) {
            js_proxy_t *jsProxy = js_get_or_create_proxy<CUpdateManager>(cx, (CUpdateManager*)ret);
            jsret = OBJECT_TO_JSVAL(jsProxy->obj);
        } else {
            jsret = JSVAL_NULL;
        }
    } while (0);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_cocos2dx_custom_core_CUpdateManager_getInstance : wrong number of arguments");
    return false;
}


void js_CUpdateManager_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (CUpdateManager)", obj);
}
void js_register_cocos2dx_custom_core_CUpdateManager(JSContext *cx, JS::HandleObject global) {
    jsb_CUpdateManager_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_CUpdateManager_class->name = "CUpdateManager";
    jsb_CUpdateManager_class->addProperty = JS_PropertyStub;
    jsb_CUpdateManager_class->delProperty = JS_DeletePropertyStub;
    jsb_CUpdateManager_class->getProperty = JS_PropertyStub;
    jsb_CUpdateManager_class->setProperty = JS_StrictPropertyStub;
    jsb_CUpdateManager_class->enumerate = JS_EnumerateStub;
    jsb_CUpdateManager_class->resolve = JS_ResolveStub;
    jsb_CUpdateManager_class->convert = JS_ConvertStub;
    jsb_CUpdateManager_class->finalize = js_CUpdateManager_finalize;
    jsb_CUpdateManager_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PSG("__nativeObj", js_is_native_obj, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FN("startDownload", js_cocos2dx_custom_core_CUpdateManager_startDownload, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("loadResource", js_cocos2dx_custom_core_CUpdateManager_loadResource, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("prepareDownload", js_cocos2dx_custom_core_CUpdateManager_prepareDownload, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("checkResUpdate", js_cocos2dx_custom_core_CUpdateManager_checkResUpdate, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("deleteInstance", js_cocos2dx_custom_core_CUpdateManager_deleteInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getInstance", js_cocos2dx_custom_core_CUpdateManager_getInstance, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_CUpdateManager_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(), // parent proto
        jsb_CUpdateManager_class,
        empty_constructor, 0,
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);
    // make the class enumerable in the registered namespace
//  bool found;
//FIXME: Removed in Firefox v27 
//  JS_SetPropertyAttributes(cx, global, "CUpdateManager", JSPROP_ENUMERATE | JSPROP_READONLY, &found);

    // add the proto and JSClass to the type->js info hash table
    TypeTest<CUpdateManager> t;
    js_type_class_t *p;
    std::string typeName = t.s_name();
    if (_js_global_type_map.find(typeName) == _js_global_type_map.end())
    {
        p = (js_type_class_t *)malloc(sizeof(js_type_class_t));
        p->jsclass = jsb_CUpdateManager_class;
        p->proto = jsb_CUpdateManager_prototype;
        p->parentProto = NULL;
        _js_global_type_map.insert(std::make_pair(typeName, p));
    }
}

void register_all_cocos2dx_custom_core(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "cb", &ns);

    js_register_cocos2dx_custom_core_CUpdateManager(cx, ns);
}

