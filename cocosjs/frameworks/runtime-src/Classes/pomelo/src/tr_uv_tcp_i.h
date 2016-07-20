/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef TR_UV_TCP_I_H
#define TR_UV_TCP_I_H

#include "uv.h"

#include "pc_JSON.h"
#include "pomelo.h"
#include "pomelo_trans.h"
#include "pc_mutex.h"
#include "queue.h"

#include "pr_pkg.h"
#include "pr_msg.h"
#include "tr_uv_tcp.h"

#define TR_UV_WI_TYPE_NONE 0x10
#define TR_UV_WI_TYPE_NOTIFY 0x20
#define TR_UV_WI_TYPE_RESP 0x40
#define TR_UV_WI_TYPE_INTERNAL 0x80 /* handshake and heartbeat */
#define TR_UV_WI_TYPE_MASK 0xf0

#define TR_UV_WI_IS_NOTIFY(type) (((type) & TR_UV_WI_TYPE_MASK) == TR_UV_WI_TYPE_NOTIFY)
#define TR_UV_WI_IS_RESP(type) (((type) & TR_UV_WI_TYPE_MASK) == TR_UV_WI_TYPE_RESP)
#define TR_UV_WI_IS_INTERNAL(type) (((type) & TR_UV_WI_TYPE_MASK) == TR_UV_WI_TYPE_INTERNAL)

#define TR_UV_WI_SET_NOTIFY(type) do { (type) &= ~TR_UV_WI_TYPE_MASK; (type) |= TR_UV_WI_TYPE_NOTIFY; } while(0)
#define TR_UV_WI_SET_RESP(type) do { (type) &= ~TR_UV_WI_TYPE_MASK; (type) |= TR_UV_WI_TYPE_RESP; } while(0)
#define TR_UV_WI_SET_INTERNAL(type) do { (type) &= ~TR_UV_WI_TYPE_MASK; (type) |= TR_UV_WI_TYPE_INTERNAL; } while(0)


/* +1 for internal use */
#define TR_UV_PRE_ALLOC_WI_SLOT_COUNT \
    (PC_PRE_ALLOC_NOTIFY_SLOT_COUNT + PC_PRE_ALLOC_REQUEST_SLOT_COUNT + 1)

#define TR_UV_LCK_PROTO_VERSION "pv"
#define TR_UV_LCK_PROTO_CLIENT "pc"
#define TR_UV_LCK_PROTO_SERVER "ps"

#define TR_UV_LCK_DICT_VERSION "dv"
#define TR_UV_LCK_ROUTE_2_CODE "r2c"
#define TR_UV_LCK_CODE_2_ROUTE "c2r"

typedef struct {
    QUEUE queue;
    unsigned int type;

    uv_buf_t buf;
    unsigned int seq_num; /* for notify, if internal use -1 */
    unsigned int req_id; /* for request, if internal use -1 */
    time_t ts;
    int timeout;
} tr_uv_wi_t;

typedef enum {
    TR_UV_TCP_NOT_CONN,
    TR_UV_TCP_CONNECTING,
    TR_UV_TCP_HANDSHAKEING,
    TR_UV_TCP_DONE
} tr_uv_tcp_state_t;

struct tr_uv_tcp_transport_s {
    pc_transport_t base;

    void (*reset_fn)(tr_uv_tcp_transport_t* tt);
    void (*reconn_fn)(tr_uv_tcp_transport_t* tt);

    void (*conn_done_cb)(uv_connect_t* conn, int status);
    void (*write_async_cb)(uv_async_t* a);
    void (*cleanup_async_cb)(uv_async_t* a);
    void (*on_tcp_read_cb)(uv_stream_t* stream, ssize_t nread, const uv_buf_t* buf);
    void (*write_check_timeout_cb)(uv_timer_t* t);

    pc_client_t* client;
    const pc_client_config_t* config;

    volatile tr_uv_tcp_state_t state;

    uv_loop_t uv_loop;
    uv_tcp_t socket;
    uv_thread_t worker;

    /* used for thread checking */
    unsigned long thread_id;

    uv_connect_t conn_req;
    uv_timer_t conn_timeout;
    uv_timer_t reconn_delay_timer;
    uv_async_t conn_async;
    int reconn_times;
    int is_connecting; /* this flag is used for conn_req */
    int max_reconn_incr;

    uv_timer_t handshake_timer;

    const char* host;
    int port;
    pc_JSON* handshake_opts;

    pc_mutex_t wq_mutex;
    uv_async_t write_async;
    QUEUE conn_pending_queue;
    QUEUE write_wait_queue;
    QUEUE writing_queue;
    QUEUE resp_pending_queue;
    tr_uv_wi_t pre_wis[TR_UV_PRE_ALLOC_WI_SLOT_COUNT];
    int is_writing;
    uv_write_t write_req;

    uv_timer_t check_timeout;

    uv_async_t disconnect_async;
    uv_async_t cleanup_async;

    int hb_interval;
    int hb_timeout;
    uv_timer_t hb_timer;
    uv_timer_t hb_timeout_timer;
    int is_waiting_hb;

    /* here, we use heartbeat round-trip time to evaluate the quality of connection. */
    int hb_rtt;

    pc_pkg_parser_t pkg_parser;

    char tcp_read_buf[PC_TCP_READ_BUFFER_SIZE];

    /**
     * holds ownership of these json
     */
    pc_JSON* route_to_code;
    pc_JSON* code_to_route;
    pc_JSON* dict_ver;

    pc_JSON* server_protos;
    pc_JSON* client_protos;
    pc_JSON* proto_ver;
};

typedef struct {
    pc_transport_plugin_t base;

    uv_buf_t (*pr_msg_encoder)(tr_uv_tcp_transport_t* trans, const pc_msg_t* msg);
    pc_msg_t (*pr_msg_decoder)(tr_uv_tcp_transport_t* trans, const uv_buf_t* buf);
} tr_uv_tcp_transport_plugin_t;

pc_transport_t* tr_uv_tcp_create(pc_transport_plugin_t* plugin);
void tr_uv_tcp_release(pc_transport_plugin_t* plugin, pc_transport_t* trans);
void tr_uv_tcp_plugin_on_register(pc_transport_plugin_t* plugin);
void tr_uv_tcp_plugin_on_deregister(pc_transport_plugin_t* plugin);

int tr_uv_tcp_init(pc_transport_t* trans, pc_client_t* client);
int tr_uv_tcp_connect(pc_transport_t* trans, const char* host, int port, const char* handshake_opts);
int tr_uv_tcp_send(pc_transport_t* trans, const char* route, unsigned int seq_num, const char* msg, unsigned int req_id, int timeout);
int tr_uv_tcp_disconnect(pc_transport_t* trans);
int tr_uv_tcp_cleanup(pc_transport_t* trans);
void* tr_uv_tcp_internal_data(pc_transport_t* trans);
int tr_uv_tcp_quality(pc_transport_t* trans);
pc_transport_plugin_t* tr_uv_tcp_plugin(pc_transport_t* trans);

#endif

