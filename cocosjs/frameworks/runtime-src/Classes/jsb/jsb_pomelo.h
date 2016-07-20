//
//  jsb_pomelo.h
//  cocosjs
//
//  Created by linyou on 15/10/6.
//
//

#ifndef __cocosjs__jsb_pomelo__
#define __cocosjs__jsb_pomelo__

#include <stdio.h>

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *js_custom_pomelo_class;
extern JSObject *js_custom_pomelo_prototype;

void register_jsb_pomelo(JSContext* cx, JS::HandleObject global);

#endif /* defined(__cocosjs__jsb_pomelo__) */
