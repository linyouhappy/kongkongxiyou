/**
 * Copyright (c) 2014 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PC_POMELO_H
#define PC_POMELO_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifdef _WIN32
#  if defined(BUILDING_PC_SHARED)
#    define PC_EXPORT __declspec(dllexport)
#  else
#    define PC_EXPORT
#  endif
#else
#  define PC_EXPORT
#endif

#define PC_MAJOR_VERSION 0
#define PC_MINOR_VERSION 3 
#define PC_REVISION 5
#define PC_VERSION_SUFFIX "release"

#define PC_T(x) PC__T(x)
#define PC__T(x) #x

#define PC_VERSION_NUM (PC_MAJOR_VERSION * 10000 + PC_MINOR_VERSION * 100 + PC_REVISION)
#define PC_VERSION_STR ( PC_T(PC_MAJOR_VERSION) "." PC_T(PC_MINOR_VERSION) \
        "." PC_T(PC_REVISION) "-" PC_VERSION_SUFFIX )

/**
 * error code
 */
#define PC_RC_OK 0
#define PC_RC_ERROR -1
#define PC_RC_TIMEOUT -2
#define PC_RC_INVALID_JSON -3
#define PC_RC_INVALID_ARG -4
#define PC_RC_NO_TRANS -5
#define PC_RC_INVALID_THREAD -6
#define PC_RC_TRANS_ERROR -7
#define PC_RC_INVALID_ROUTE -8
#define PC_RC_INVALID_STATE -9
#define PC_RC_NOT_FOUND -10
#define PC_RC_RESET -11
#define PC_RC_MIN -12

typedef struct pc_client_s pc_client_t;
typedef struct pc_request_s pc_request_t;
typedef struct pc_notify_s pc_notify_t;

/**
 * client state
 */
#define PC_ST_NOT_INITED 0
#define PC_ST_INITED 1
#define PC_ST_CONNECTING 2
#define PC_ST_CONNECTED 3
#define PC_ST_DISCONNECTING 4
#define PC_ST_UNKNOWN 5
#define PC_ST_COUNT 6


/**
 * log level
 */
#define PC_LOG_DEBUG 0
#define PC_LOG_INFO 1
#define PC_LOG_WARN 2
#define PC_LOG_ERROR 3
#define PC_LOG_DISABLE 4

/**
 * some tunable arguments
 */
#define PC_TRANSPORT_PLUGIN_SLOT_COUNT 8
#define PC_PRE_ALLOC_REQUEST_SLOT_COUNT 4 
#define PC_PRE_ALLOC_NOTIFY_SLOT_COUNT 4
#define PC_TIMEOUT_CHECK_INTERVAL 2
#define PC_HEARTBEAT_TIMEOUT_FACTOR 2
#define PC_TCP_READ_BUFFER_SIZE (1 << 16)

/**
 * builtin transport name
 */
#define PC_TR_NAME_UV_TCP 0
#define PC_TR_NAME_UV_TLS 1
#define PC_TR_NAME_DUMMY 7

/**
 * reconnect max retry
 */
#define PC_ALWAYS_RETRY -1 

/**
 * disable timeout
 */
#define PC_WITHOUT_TIMEOUT -1

typedef enum { 
    PC_LOCAL_STORAGE_OP_READ = 0,
    PC_LOCAL_STORAGE_OP_WRITE = 1,
} pc_local_storage_op_t;
typedef int (*pc_local_storage_cb_t)(pc_local_storage_op_t op,
        char* data, size_t* len, void* ex_data);

typedef struct {
    int conn_timeout;

    int enable_reconn;
    int reconn_max_retry;
    int reconn_delay;
    int reconn_delay_max;
    int reconn_exp_backoff;

    int enable_polling;

    pc_local_storage_cb_t local_storage_cb;
    void* ls_ex_data;

    int transport_name;
} pc_client_config_t;

#define PC_CLIENT_CONFIG_DEFAULT                      \
{                                                     \
    30, /* conn_timeout */                            \
    1, /* enable_reconn */                            \
    PC_ALWAYS_RETRY, /* reconn_max_retry */           \
    2, /* reconn_delay */                             \
    30, /* reconn_delay_max */                        \
    1, /* reconn_exp_backoff */                       \
    0, /* enable_polling */                           \
    NULL, /* local_storage_cb */                      \
    NULL, /* ls_ex_data */                               \
    PC_TR_NAME_UV_TCP /* transport_name */            \
}

PC_EXPORT int pc_lib_version();
PC_EXPORT const char* pc_lib_version_str();

/**
 * If you do use default log callback,
 * this function will change the level of log out.
 *
 * Otherwise, this function does nothing.
 */
PC_EXPORT void pc_lib_set_default_log_level(int level);

/**
 * pc_lib_init and pc_lib_cleanup both should be invoked only once.
 */
PC_EXPORT void pc_lib_init(void (*pc_log)(int level, const char* msg, ...),
        void* (*pc_alloc)(size_t len), void (*pc_free)(void* d), const char* platform);
PC_EXPORT void pc_lib_cleanup();

PC_EXPORT size_t pc_client_size();
PC_EXPORT int pc_client_init(pc_client_t* client, void* ex_data, const pc_client_config_t* config);
PC_EXPORT int pc_client_connect(pc_client_t* client, const char* host, int port, const char* handshake_opts);
PC_EXPORT int pc_client_disconnect(pc_client_t* client);
PC_EXPORT int pc_client_cleanup(pc_client_t* client);
PC_EXPORT int pc_client_poll(pc_client_t* client);

/**
 * pc_client_t getters
 */
PC_EXPORT void* pc_client_ex_data(const pc_client_t* client);
PC_EXPORT const pc_client_config_t* pc_client_config(const pc_client_t* client);
PC_EXPORT int pc_client_state(pc_client_t* client);
PC_EXPORT int pc_client_conn_quality(pc_client_t* client);
PC_EXPORT void* pc_client_trans_data(pc_client_t* client);

/**
 * Event
 */

/**
 * event handler callback and event types
 *
 * arg1 and arg2 are significant for the following events:
 *   PC_EV_USER_DEFINED_PUSH - arg1 as push route, arg2 as push msg
 *   PC_EV_CONNECT_ERROR - arg1 as short error description
 *   PC_EV_CONNECT_FAILED - arg1 as short reason description
 *   PC_EV_UNEXPECTED_DISCONNECT - arg1 as short reason description
 *   PC_EV_PROTO_ERROR - arg1 as short reason description
 *
 * For other events, arg1 and arg2 will be set to NULL.
 */
typedef void (*pc_event_cb_t)(pc_client_t *client, int ev_type, void* ex_data,
                              const char* arg1, const char* arg2);
#define PC_EV_USER_DEFINED_PUSH 0
#define PC_EV_CONNECTED 1
#define PC_EV_CONNECT_ERROR 2
#define PC_EV_CONNECT_FAILED 3
#define PC_EV_DISCONNECT 4
#define PC_EV_KICKED_BY_SERVER 5
#define PC_EV_UNEXPECTED_DISCONNECT 6
#define PC_EV_PROTO_ERROR 7
#define PC_EV_COUNT 8

#define PC_EV_INVALID_HANDLER_ID -1

PC_EXPORT int pc_client_add_ev_handler(pc_client_t* client, pc_event_cb_t cb,
        void* ex_data, void (*destructor)(void* ex_data));
PC_EXPORT int pc_client_rm_ev_handler(pc_client_t* client, int id);

/**
 * Request
 */

typedef void (*pc_request_cb_t)(const pc_request_t* req, int rc, const char* resp);

/**
 * pc_request_t getters.
 *
 * All the getters should be called in pc_request_cb_t to access read-only 
 * properties of the current pc_request_t.
 *
 * User should not hold any references to pc_request_t.
 */
PC_EXPORT pc_client_t* pc_request_client(const pc_request_t* req);
PC_EXPORT const char* pc_request_route(const pc_request_t* req);
PC_EXPORT const char* pc_request_msg(const pc_request_t* req);
PC_EXPORT int pc_request_timeout(const pc_request_t* req);
PC_EXPORT void* pc_request_ex_data(const pc_request_t* req);

/**
 * Initiate a request.
 */
PC_EXPORT int pc_request_with_timeout(pc_client_t* client, const char* route,
        const char* msg, void* ex_data, int timeout, pc_request_cb_t cb);

/**
 * Notify
 */

typedef void (*pc_notify_cb_t)(const pc_notify_t* req, int rc);

/**
 * pc_notify_t getters.
 *
 * All the getters should be called in pc_notify_cb_t to access read-only 
 * properties of the current pc_notify_t. 
 *
 * User should not hold any references to pc_notify_t.
 */
PC_EXPORT pc_client_t* pc_notify_client(const pc_notify_t* notify);
PC_EXPORT const char* pc_notify_route(const pc_notify_t* notify);
PC_EXPORT const char* pc_notify_msg(const pc_notify_t* notify);
PC_EXPORT int pc_notify_timeout(const pc_notify_t* notify);
PC_EXPORT void* pc_notify_ex_data(const pc_notify_t* notify);

/**
 * Initiate a notify.
 */
PC_EXPORT int pc_notify_with_timeout(pc_client_t* client, const char* route,
        const char* msg, void* ex_data, int timeout, pc_notify_cb_t cb);

/**
 * Utilities
 */
PC_EXPORT const char* pc_client_state_str(int state);
PC_EXPORT const char* pc_client_ev_str(int ev_type);
PC_EXPORT const char* pc_client_rc_str(int rc);

/**
 * set ca file for tls transports
 */

#if !defined(PC_NO_UV_TCP_TRANS) && !defined(PC_NO_UV_TLS_TRANS)

void tr_uv_tls_set_ca_file(const char* ca_file, const char* ca_path);

#endif /* uv_tls */

/**
 * Macro implementation
 */
#define pc_lib_version() PC_VERSION_NUM
#define pc_lib_version_str() PC_VERSION_STR 

#ifdef __cplusplus
}
#endif

#endif /* PC_POMELO_H */
