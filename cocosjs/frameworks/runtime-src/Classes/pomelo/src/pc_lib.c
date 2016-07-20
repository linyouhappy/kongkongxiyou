/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <assert.h>
#include <time.h>

#include "pomelo.h"
#include "pomelo_trans.h"

#include "pc_lib.h"

#define PC_NO_DUMMY_TRANS
//#define PC_NO_UV_TCP_TRANS
#define PC_NO_UV_TLS_TRANS

#if !defined(PC_NO_DUMMY_TRANS)
#  include "tr/dummy/tr_dummy.h"
#endif

#if !defined(PC_NO_UV_TCP_TRANS)
#  include "tr_uv_tcp.h"

#  if !defined(PC_NO_UV_TLS_TRANS)
#    include "tr/uv/tr_uv_tls.h"
#  endif /* tls */

#endif /* tcp */

void (*pc_lib_log)(int level, const char* msg, ...) = NULL;
void* (*pc_lib_malloc)(size_t len) = NULL;
void (*pc_lib_free)(void* data) = NULL;

const char* pc_lib_platform_type = NULL;

static int pc__default_log_level = 0;

/**
 * default malloc never return NULL
 * so we don't have to check its return value
 *
 * if you customize malloc, please make sure that it never return NULL
 */
static void* default_malloc(size_t len)
{
    void* d = malloc(len);

    /* if oom, just abort */
    if (!d)
        abort();

    return d;
}

static void default_log(int level, const char* msg, ...)
{
    return;
    
    time_t t = time(NULL);
    char buf[32];
    va_list va;

    if (level < pc__default_log_level) {
        return;
    }

    strftime(buf, 32, "[%Y-%m-%d %H:%M:%S]", localtime(&t));
    printf("%s", buf);
    switch(level) {
    case PC_LOG_DEBUG:
        printf("[DEBUG] ");
        break;
    case PC_LOG_INFO:
        printf("[INFO] ");
        break;
    case PC_LOG_WARN:
        printf("[WARN] ");
        break;
    case PC_LOG_ERROR:
        printf("[ERROR] ");
        break;
    }

    va_start(va, msg);
    vprintf(msg, va);
    va_end(va);

    printf("\n");

    fflush(stdout);
}

void pc_lib_init(void (*pc_log)(int level, const char* msg, ...), void* (*pc_alloc)(size_t), void (*pc_free)(void* ), const char* platform)
{
    pc_transport_plugin_t* tp;

    pc_lib_log = pc_log ? pc_log : default_log;
    pc_lib_malloc = pc_alloc ? pc_alloc : default_malloc;
    pc_lib_free = pc_free ? pc_free: free;
    pc_lib_platform_type = platform ? pc_lib_strdup(platform) : pc_lib_strdup("desktop");

#if !defined(PC_NO_DUMMY_TRANS)
    tp = pc_tr_dummy_trans_plugin();
    pc_transport_plugin_register(tp);
    pc_lib_log(PC_LOG_INFO, "pc_lib_init - register dummy plugin");
#endif

#if !defined(PC_NO_UV_TCP_TRANS)
    tp = pc_tr_uv_tcp_trans_plugin();
    pc_transport_plugin_register(tp);
    pc_lib_log(PC_LOG_INFO, "pc_lib_init - register tcp plugin");
#if !defined(PC_NO_UV_TLS_TRANS)
    tp = pc_tr_uv_tls_trans_plugin();
    pc_transport_plugin_register(tp);
    pc_lib_log(PC_LOG_INFO, "pc_lib_init - register tls plugin");
#endif
    srand((unsigned int)time(0));

#endif
}

void pc_lib_cleanup()
{
#if !defined(PC_NO_DUMMY_TRANS)
    pc_transport_plugin_deregister(PC_TR_NAME_DUMMY);
    pc_lib_log(PC_LOG_INFO, "pc_lib_cleanup - deregister dummy plugin");
#endif

#if !defined(PC_NO_UV_TCP_TRANS)
    pc_transport_plugin_deregister(PC_TR_NAME_UV_TCP);
    pc_lib_log(PC_LOG_INFO, "pc_lib_cleanup - deregister tcp plugin");

#if !defined(PC_NO_UV_TLS_TRANS)
    pc_transport_plugin_deregister(PC_TR_NAME_UV_TLS);
    pc_lib_log(PC_LOG_INFO, "pc_lib_cleanup - deregister tls plugin");
#endif

#endif
    pc_lib_free((char*)pc_lib_platform_type);
}

const char* pc_lib_strdup(const char* str)
{
    char* buf;
    size_t len;

    if (!str)
        return NULL;

    len = strlen(str);

    buf = (char* )pc_lib_malloc(len + 1);
    strcpy(buf, str);
    buf[len] = '\0';

    return buf;
}

static const char* state_str[] = {
    "PC_ST_NOT_INITED",
    "PC_ST_INITED",
    "PC_ST_CONNECTING",
    "PC_ST_CONNECTED",
    "PC_ST_DISCONNECTING",
    "PC_ST_UNKNOWN",
    NULL
};


const char* pc_client_state_str(int state)
{
    assert(state < PC_ST_COUNT && state >= 0);
    return state_str[state];
}

static const char* ev_str[] = {
    "PC_EV_USER_DEFINED_PUSH",
    "PC_EV_CONNECTED",
    "PC_EV_CONNECT_ERROR",
    "PC_EV_CONNECT_FAILED",
    "PC_EV_DISCONNECT",
    "PC_EV_KICKED_BY_SERVER",
    "PC_EV_UNEXPECTED_DISCONNECT",
    "PC_EV_PROTO_ERROR",
    NULL
};

const char* pc_client_ev_str(int ev_type)
{
    assert(ev_type >= 0 && ev_type < PC_EV_COUNT);
    return ev_str[ev_type];
}

static const char* rc_str[] = {
    "PC_RC_OK",
    "PC_RC_ERROR",
    "PC_RC_TIMEOUT",
    "PC_RC_INVALID_JSON",
    "PC_RC_INVALID_ARG",
    "PC_RC_NO_TRANS",
    "PC_RC_INVALID_THREAD",
    "PC_RC_TRANS_ERROR",
    "PC_RC_INVALID_ROUTE",
    "PC_RC_INVALID_STATE",
    "PC_RC_NOT_FOUND",
    "PC_RC_RESET",
    NULL
};

const char* pc_client_rc_str(int rc)
{
    assert(rc <= 0 && rc > PC_RC_MIN);
    return rc_str[-rc];
}

void pc_lib_set_default_log_level(int level)
{
    pc__default_log_level = level;
}
