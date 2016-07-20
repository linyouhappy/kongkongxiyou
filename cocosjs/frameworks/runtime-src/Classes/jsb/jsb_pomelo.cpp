//
//  jsb_pomelo.cpp
//  cocosjs
//
//  Created by linyou on 15/10/6.
//
//

#include "jsb_pomelo.h"
#include "ScriptingCore.h"
#include "cocos2d_specifics.hpp"

#include "cocos2d.h"
#include "pomelo.h"
#include "pomelo_trans.h"
#include "pc_pomelo.h"

USING_NS_CC;

#define REQ_EX ((void*)0x22)
#define REQ_TIMEOUT 50

#define NOTI_EX ((void*)0x33)
#define NOTI_TIMEOUT 30

#define EV_HANDLER_EX ((void*)0x44)
#define SERVER_PUSH "onPush"

#define PC_TEST_ASSERT(expr)  \
do {                            \
if (!(expr)) {                    \
fprintf(stderr,                              \
"Assertion failed in %s on line %d: %s\n",   \
__FILE__,                                    \
__LINE__,                                    \
#expr);                                       \
abort();                                    \
}                                           \
} while (0)




static int local_storage_cb(pc_local_storage_op_t op, char* data, size_t* len, void* ex_data)
{
    // 0 - success, -1 - fail
    char buf[1024];
    size_t length;
    size_t offset;
    FILE* f;
    
    if (op == PC_LOCAL_STORAGE_OP_WRITE) {
        f = fopen("pomelo.dat", "w");
        if (!f) {
            return -1;
        }
        fwrite(data, 1, *len, f);
        fclose(f);
        return 0;
        
    } else {
        f = fopen("pomelo.dat", "r");
        if (!f) {
            *len = 0;
            return -1;
        }
        *len = 0;
        offset = 0;
        
        while((length = fread(buf, 1, 1024, f))) {
            *len += length;
            if (data) {
                memcpy(data + offset, buf, length);
            }
            offset += length;
        }
        
        fclose(f);
        
        return 0;
    }
}

static pc_client_t* gs_client=NULL;
static int handler_id;
static JS::Heap<JSObject*> js_client;

static int g_req_id=1;

JSClass  *js_custom_pomelo_class;
JSObject *js_custom_pomelo_prototype;

static void event_cb(pc_client_t* ps_client, int ev_type, void* ex_data, const char* arg1, const char* arg2)
{
    std::string tmpArg1=arg1==NULL?"":arg1;
    std::string tmpArg2=arg2==NULL?"":arg2;
    
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]{
        js_proxy_t * p = jsb_get_native_proxy(gs_client);
        if (!p) return;
        
        JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
        
        JSContext* cx = ScriptingCore::getInstance()->getGlobalContext();
        JS::RootedObject jsobj(cx, JS_NewObject(cx, NULL, JS::NullPtr(), JS::NullPtr()));
        JS::RootedValue vp(cx);
        vp = int32_to_jsval(cx, ev_type);
        JS_SetProperty(cx, jsobj, "type", vp);
        if (tmpArg1.length()>0)
        {
            JS::RootedValue vp(cx);
            vp = c_string_to_jsval(cx, tmpArg1.c_str());
            JS_SetProperty(cx, jsobj, "route", vp);
        }
        if (tmpArg2.length()>0)
        {
            JS::RootedValue vp(cx);
            vp = c_string_to_jsval(cx, tmpArg2.c_str());
            JS_SetProperty(cx, jsobj, "msg", vp);
        }
//        CCLOG("tmpArg1=%s  tmpArg2=%s",tmpArg1.c_str(),tmpArg2.c_str());

        jsval args = OBJECT_TO_JSVAL(jsobj);
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(js_client), "__onEventCb", 1, &args);
    });
}

static void request_cb(const pc_request_t* req, int rc, const char* resp)
{
    std::string tmpResp=resp==NULL?"":resp;
    int req_id=(int)(long)pc_request_ex_data(req);
    
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]{
//        js_proxy_t * p = jsb_get_native_proxy(gs_client);
//        if (!p) return;
        
//        JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
        
        JSContext* cx = ScriptingCore::getInstance()->getGlobalContext();
        JSAutoCompartment __jsb_ac(cx, ScriptingCore::getInstance()->getGlobalObject());
        
        JS::RootedObject jsobj(cx, JS_NewObject(cx, NULL, JS::NullPtr(), JS::NullPtr()));
        
        JS::RootedValue vp(cx);
        vp = int32_to_jsval(cx, req_id);
        JS_SetProperty(cx, jsobj, "reqId", vp);
        
        vp = int32_to_jsval(cx, rc);
        JS_SetProperty(cx, jsobj, "rc", vp);
        
        if (tmpResp.length()>0)
        {
            vp = c_string_to_jsval(cx, tmpResp.c_str());
            JS_SetProperty(cx, jsobj, "resp", vp);
        }
        
        jsval args = OBJECT_TO_JSVAL(jsobj);
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(js_client), "__onRequestCb", 1, &args);
    });
}

static void notify_cb(const pc_notify_t* noti, int rc)
{
    int req_id=(int)(long)pc_notify_ex_data(noti);
    std::string tmpRoute=pc_notify_route(noti);
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]{
//        js_proxy_t * p = jsb_get_native_proxy(gs_client);
//        if (!p) return;
        
//        JSB_AUTOCOMPARTMENT_WITH_GLOBAL_OBJCET
        
        JSContext* cx = ScriptingCore::getInstance()->getGlobalContext();
        JSAutoCompartment __jsb_ac(cx, ScriptingCore::getInstance()->getGlobalObject());
        
        JS::RootedObject jsobj(cx, JS_NewObject(cx, NULL, JS::NullPtr(), JS::NullPtr()));

        JS::RootedValue vp(cx);
        vp = int32_to_jsval(cx, req_id);
        JS_SetProperty(cx, jsobj, "reqId", vp);

        vp = int32_to_jsval(cx, rc);
        JS_SetProperty(cx, jsobj, "rc", vp);

        if (tmpRoute.length()>0)
        {
            vp = c_string_to_jsval(cx, tmpRoute.c_str());
            JS_SetProperty(cx, jsobj, "route", vp);
        }
        
        jsval args = OBJECT_TO_JSVAL(jsobj);
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(js_client), "__onNotifyCb", 1, &args);
    });
}

static bool js_custom_pomelo_request(JSContext *cx, uint32_t argc, jsval *vp)
{
    if (argc == 2) {
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        
        const char* route[1]={""};
        do {
            bool ok = jsval_to_charptr(cx, args.get(0), route);
            JSB_PRECONDITION2( ok, cx, false, "Error processing route arguments");
        } while (0);
        const char* msg[1]={""};
        do {
            bool ok = jsval_to_charptr(cx, args.get(1), msg);
            JSB_PRECONDITION2( ok, cx, false, "Error processing msg arguments");
        } while (0);
        
        int req_id=pc_request_with_timeout(gs_client,route[0],msg[0], (void*)g_req_id, REQ_TIMEOUT, request_cb);
        if (req_id==PC_RC_OK)
        {
            req_id=g_req_id++;
        }
        args.rval().set(INT_TO_JSVAL(req_id));
        return true;
    }
    JS_ReportError(cx, "wrong number of arguments: argc, was expecting %d. argc must be %d",argc,2);
    return false;
}

static bool js_custom_pomelo_notify(JSContext *cx, uint32_t argc, jsval *vp)
{
    if (argc == 2) {
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        
        const char* route[1]={""};
        do {
            bool ok = jsval_to_charptr(cx, args.get(0), route);
            JSB_PRECONDITION2( ok, cx, false, "Error processing route arguments");
        } while (0);
        const char* msg[1]={""};
        do {
            bool ok = jsval_to_charptr(cx, args.get(1), msg);
            JSB_PRECONDITION2( ok, cx, false, "Error processing msg arguments");
        } while (0);
        
        int req_id=pc_notify_with_timeout(gs_client,route[0],msg[0], (void*)g_req_id, NOTI_TIMEOUT, notify_cb);
        if (req_id==PC_RC_OK)
        {
            req_id=g_req_id++;
        }
        args.rval().set(INT_TO_JSVAL(req_id));
        return true;
    }
    JS_ReportError(cx, "wrong number of arguments: argc, was expecting %d. argc must be %d",argc,2);
    return false;
}

static bool js_custom_pomelo_connect(JSContext *cx, uint32_t argc, jsval *vp)
{
    if (argc == 2)
    {
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        const char* host[1]={""};
        bool ok = jsval_to_charptr(cx, args.get(0), host);
        JSB_PRECONDITION2( ok, cx, false, "Error processing arguments");

        int port=0;
        ok = jsval_to_int(cx, args.get(1), &port);
        JSB_PRECONDITION2( ok, cx, false, "Error processing arguments");
        
        pc_client_config_t config = PC_CLIENT_CONFIG_DEFAULT;
        config.local_storage_cb = local_storage_cb;
        pc_client_init(gs_client, (void*)0x11, &config);
        
        PC_TEST_ASSERT(pc_client_ex_data(gs_client) == (void*)0x11);
        PC_TEST_ASSERT(pc_client_state(gs_client) == PC_ST_INITED);
        
        handler_id = pc_client_add_ev_handler(gs_client, event_cb, EV_HANDLER_EX, NULL);
        int ret=pc_client_connect(gs_client, host[0], port, NULL);
        args.rval().set(INT_TO_JSVAL(ret));
        return true;
    }
    JS_ReportError(cx, "wrong number of arguments: argc, was expecting %d. argc must be %d",argc,2);
    return false;
}

static bool js_custom_pomelo_disconnect(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if(argc == 0)
    {
        if (pc_client_state(gs_client)!=PC_ST_NOT_INITED)
        {
            pc_client_disconnect(gs_client);
            pc_client_disconnect(gs_client);
            pc_client_rm_ev_handler(gs_client, handler_id);
            pc_client_cleanup(gs_client);
            PC_TEST_ASSERT(pc_client_state(gs_client) == PC_ST_NOT_INITED);
        }
        
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}

static bool js_custom_pomelo_close(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if(argc == 0)
    {
        if (pc_client_state(gs_client)!=PC_ST_NOT_INITED)
        {
            pc_client_disconnect(gs_client);
            pc_client_disconnect(gs_client);
            pc_client_rm_ev_handler(gs_client, handler_id);
            pc_client_cleanup(gs_client);
            PC_TEST_ASSERT(pc_client_state(gs_client) == PC_ST_NOT_INITED);
        }
        if (!!gs_client)
        {
            free(gs_client);
            gs_client=NULL;
        }
        
        pc_lib_cleanup();
        
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "wrong number of arguments: %d, was expecting %d", argc, 0);
    return false;
}

void js_custom_pomelo_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOG("jsbindings: finalizing JS object %p (Pomelo)", obj);
}

bool js_custom_pomelo_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    if (argc == 0)
    {
        if (gs_client)
        {
            pc_client_disconnect(gs_client);
            pc_client_disconnect(gs_client);
            pc_client_rm_ev_handler(gs_client, handler_id);
            pc_client_cleanup(gs_client);
            PC_TEST_ASSERT(pc_client_state(gs_client) == PC_ST_NOT_INITED);
            free(gs_client);
            gs_client=NULL;
            pc_lib_cleanup();
        }
        
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        
        JS::RootedObject obj(cx, JS_NewObject(cx, js_custom_pomelo_class, JS::RootedObject(cx, js_custom_pomelo_prototype), JS::NullPtr()));
        js_client=obj;
        
        PC_TEST_ASSERT(gs_client==NULL);
        
        pc_lib_init(NULL, NULL, NULL, NULL);
        gs_client = (pc_client_t*)malloc(pc_client_size());
        PC_TEST_ASSERT(gs_client);
        
        
        JS_DefineProperty(cx, obj, "PC_EV_USER_DEFINED_PUSH", PC_EV_USER_DEFINED_PUSH, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_CONNECTED",PC_EV_CONNECTED, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_CONNECT_ERROR",PC_EV_CONNECT_ERROR, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_CONNECT_FAILED",PC_EV_CONNECT_FAILED, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        
        JS_DefineProperty(cx, obj, "PC_EV_DISCONNECT", PC_EV_DISCONNECT, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_KICKED_BY_SERVER",PC_EV_KICKED_BY_SERVER, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_UNEXPECTED_DISCONNECT",PC_EV_UNEXPECTED_DISCONNECT, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_PROTO_ERROR",PC_EV_PROTO_ERROR, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);
        JS_DefineProperty(cx, obj, "PC_EV_COUNT",PC_EV_COUNT, JSPROP_ENUMERATE | JSPROP_PERMANENT | JSPROP_READONLY);

        
        js_proxy_t *p = jsb_new_proxy(gs_client, obj);
        JS::AddNamedObjectRoot(cx, &p->obj, "Pomelo");
        args.rval().set(OBJECT_TO_JSVAL(obj));
        return true;
    }
    JS_ReportError(cx, "wrong number of arguments: argc, was expecting %d. argc must be 0 ", argc);
    return false;
}

void register_jsb_pomelo(JSContext *cx, JS::HandleObject global)
{
    js_custom_pomelo_class = (JSClass *)calloc(1, sizeof(JSClass));
    js_custom_pomelo_class->name = "Pomelo";
    js_custom_pomelo_class->addProperty = JS_PropertyStub;
    js_custom_pomelo_class->delProperty = JS_DeletePropertyStub;
    js_custom_pomelo_class->getProperty = JS_PropertyStub;
    js_custom_pomelo_class->setProperty = JS_StrictPropertyStub;
    js_custom_pomelo_class->enumerate = JS_EnumerateStub;
    js_custom_pomelo_class->resolve = JS_ResolveStub;
    js_custom_pomelo_class->convert = JS_ConvertStub;
    js_custom_pomelo_class->finalize = js_custom_pomelo_finalize;
    js_custom_pomelo_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };
    
    static JSFunctionSpec funcs[] = {
        JS_FN("__connect",js_custom_pomelo_connect,2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("__request",js_custom_pomelo_request,2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("__notify",js_custom_pomelo_notify,2, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        
        JS_FN("__disconnect",js_custom_pomelo_disconnect,0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("__close",js_custom_pomelo_close,0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };
    
    static JSFunctionSpec st_funcs[] = {
        JS_FS_END
    };
    
    js_custom_pomelo_prototype = JS_InitClass(
                                               cx, global,
                                               JS::NullPtr(),
                                               js_custom_pomelo_class,
                                               js_custom_pomelo_constructor, 0, // constructor
                                               properties,
                                               funcs,
                                               NULL, // no static properties
                                               st_funcs);
    
    
    
}