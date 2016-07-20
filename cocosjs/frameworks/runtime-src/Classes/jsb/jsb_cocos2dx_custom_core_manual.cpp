//
//  jsb_cocos2dx_custom_core_man.cpp
//  cocosjs
//
//  Created by linyou on 15/10/19.
//
//

#include "jsb_cocos2dx_custom_core_manual.h"
#include "cocos2d_specifics.hpp"
#include "GameCore.h"
//#include "GameEngine.h"

extern JSObject *jsb_EntitySprite_prototype;
static bool js_cocos2dx_EntitySprite_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    EntitySprite* cobj = (EntitySprite *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
    
    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        cobj->addEventListener([=](int actionType)->void{
            jsval arg= int32_to_jsval(cx, (int32_t)actionType);
            JS::RootedValue rval(cx);
            
            bool ok = func->invoke(1, &arg, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}

extern JSObject *jsb_CCRichText_prototype;
static bool js_cocos2dx_CCRichText_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    CCRichText* cobj = (CCRichText *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
    
    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        cobj->addEventListener([=](kRichTextState richTextState, int eventId, int x, int y)->bool{
            
            JS::RootedValue rval(cx);
            
            jsval dataVal[4];
            dataVal[0] = int32_to_jsval(cx, (int32_t)richTextState);
            dataVal[1] = int32_to_jsval(cx,eventId);
            dataVal[2] = int32_to_jsval(cx,x);
            dataVal[3] = int32_to_jsval(cx,y);
            
            bool ok = func->invoke(4, dataVal, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
            
            if(rval.isBoolean())
            {
                return rval.toBoolean();
            } 
            return false;
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}

extern JSObject *jsb_RichLabelsLayer_prototype;
static bool js_cocos2dx_RichLabelsLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    RichLabelsLayer* cobj = (RichLabelsLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
    
    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        cobj->addEventListener([=](int richLabelId)->void{
            
            jsval arg= int32_to_jsval(cx,richLabelId);
            JS::RootedValue rval(cx);
            
            bool ok = func->invoke(1, &arg, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}

extern JSObject *jsb_ItemBox_prototype;
static bool js_cocos2dx_ItemBox_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBox* cobj = (ItemBox *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
    
    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        cobj->addEventListener([=](ItemBox* itemBox)->void{
            
//            jsval arg= int32_to_jsval(cx,itemId);
            jsval arg;
            js_proxy_t *proxy = js_get_or_create_proxy(cx, itemBox);
            if(proxy)
                arg = OBJECT_TO_JSVAL(proxy->obj);
            else
                arg = JSVAL_NULL;
            
            JS::RootedValue rval(cx);
            
            bool ok = func->invoke(1, &arg, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}


extern JSObject *jsb_ItemBoxLayer_prototype;
static bool js_cocos2dx_ItemBoxLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    ItemBoxLayer* cobj = (ItemBoxLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
    
    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        cobj->addEventListener([=](int position,ItemBox* itemBox)->void{
            
            JS::RootedValue rval(cx);
            
            jsval dataVal[2];
            dataVal[0] = int32_to_jsval(cx,position);
            
            js_proxy_t *proxy = js_get_or_create_proxy(cx, itemBox);
            if(proxy)
                dataVal[1] = OBJECT_TO_JSVAL(proxy->obj);
            else
                dataVal[1] = JSVAL_NULL;

//            dataVal[1] = int32_to_jsval(cx,itemId);
            
            bool ok = func->invoke(2, dataVal, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}


//extern JSObject *jsb_CUpdateManager_prototype;
//static bool js_cocos2dx_CUpdateManager_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
//{
//    JSObject *obj = JS_THIS_OBJECT(cx, vp);
//    js_proxy_t *proxy = jsb_get_js_proxy(obj);
//    CUpdateManager* cobj = (CUpdateManager *)(proxy ? proxy->ptr : NULL);
//    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
//    
//    if(argc == 1){
//        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
//        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
//        cobj->addEventListener([=](int carryValueType,int nowDownloaded,int totalDownload,const char* msg)->void{
//            
//            JS::RootedValue rval(cx);
//            
//            jsval dataVal[4];
//            dataVal[0] = int32_to_jsval(cx,carryValueType);
//            dataVal[1] = int32_to_jsval(cx,nowDownloaded);
//            dataVal[2] = int32_to_jsval(cx,totalDownload);
//            
//            dataVal[3] = c_string_to_jsval(cx,msg);
//            
//            bool ok = func->invoke(4, dataVal, &rval);
//            if (!ok && JS_IsExceptionPending(cx)) {
//                JS_ReportPendingException(cx);
//            }
//        });
//        return true;
//    }
//    JS_ReportError(cx, "Invalid number of arguments");
//    return false;
//}

extern JSObject *jsb_GraphLayer_prototype;
static bool js_cocos2dx_GraphLayer_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    GraphLayer* cobj = (GraphLayer *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
    
    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        cobj->addEventListener([=](int x)->void{
            jsval arg= int32_to_jsval(cx, (int32_t)x);
            JS::RootedValue rval(cx);
            
            bool ok = func->invoke(1, &arg, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}

//extern JSObject *jsb_CUpdateManager_prototype;
//static bool js_cocos2dx_CUpdateManager_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
//{
//    JSObject *obj = JS_THIS_OBJECT(cx, vp);
//    js_proxy_t *proxy = jsb_get_js_proxy(obj);
//    CUpdateManager* cobj = (CUpdateManager *)(proxy ? proxy->ptr : NULL);
//    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");
//
//    if(argc == 1){
//        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
//        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
//        cobj->addEventListener([=](int carryValueType,int nowDownloaded,int totalDownload,const char* msg)->void{
//
//            JS::RootedValue rval(cx);
//
//            jsval dataVal[4];
//            dataVal[0] = int32_to_jsval(cx,carryValueType);
//            dataVal[1] = int32_to_jsval(cx,nowDownloaded);
//            dataVal[2] = int32_to_jsval(cx,totalDownload);
//
//            dataVal[3] = c_string_to_jsval(cx,msg);
//
//            bool ok = func->invoke(4, dataVal, &rval);
//            if (!ok && JS_IsExceptionPending(cx)) {
//                JS_ReportPendingException(cx);
//            }
//        });
//        return true;
//    }
//    JS_ReportError(cx, "Invalid number of arguments");
//    return false;
//}

extern JSObject *jsb_SDKManager_prototype;
static bool js_cocos2dx_SDKManager_addEventListener(JSContext *cx, uint32_t argc, jsval *vp)
{
    JSObject *obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t *proxy = jsb_get_js_proxy(obj);
    SDKManager* cobj = (SDKManager *)(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2( cobj, cx, false, "Invalid Native Object");

    if(argc == 1){
        JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
        std::shared_ptr<JSFunctionWrapper> func(new JSFunctionWrapper(cx, obj, args.get(0)));
        
        cobj->addEventListener([=](int msgType,int param1)->void{

            JS::RootedValue rval(cx);

            jsval dataVal[2];
            dataVal[0] = int32_to_jsval(cx,msgType);
            dataVal[1] = int32_to_jsval(cx,param1);

            bool ok = func->invoke(2, dataVal, &rval);
            if (!ok && JS_IsExceptionPending(cx)) {
                JS_ReportPendingException(cx);
            }
        });
        return true;
    }
    JS_ReportError(cx, "Invalid number of arguments");
    return false;
}

void register_all_cocos2dx_custom_core_manual(JSContext* cx, JS::HandleObject obj) {
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_EntitySprite_prototype), "addEventListener", js_cocos2dx_EntitySprite_addEventListener, 1, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_CCRichText_prototype), "addEventListener", js_cocos2dx_CCRichText_addEventListener, 4, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_ItemBox_prototype), "addEventListener", js_cocos2dx_ItemBox_addEventListener, 1, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_ItemBoxLayer_prototype), "addEventListener", js_cocos2dx_ItemBoxLayer_addEventListener, 2, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
//    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_CUpdateManager_prototype), "addEventListener", js_cocos2dx_CUpdateManager_addEventListener, 2, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_RichLabelsLayer_prototype), "addEventListener", js_cocos2dx_RichLabelsLayer_addEventListener, 1, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_GraphLayer_prototype), "addEventListener", js_cocos2dx_GraphLayer_addEventListener, 1, JSPROP_ENUMERATE | JSPROP_PERMANENT);
    
    JS_DefineFunction(cx, JS::RootedObject(cx, jsb_SDKManager_prototype), "addEventListener", js_cocos2dx_SDKManager_addEventListener, 1, JSPROP_ENUMERATE | JSPROP_PERMANENT);
}


