/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#endif

#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <time.h>

#include "pc_JSON.h"
#include "pomelo.h"
#include "pc_lib.h"
#include "pc_pomelo.h"

#include "tr_uv_tcp.h"
#include "tr_uv_tcp_i.h"
#include "tr_uv_tcp_aux.h"

#define GET_TT tr_uv_tcp_transport_t* tt = (tr_uv_tcp_transport_t*)trans; assert(tt)

pc_transport_t* tr_uv_tcp_create(pc_transport_plugin_t* plugin)
{
    size_t len = sizeof(tr_uv_tcp_transport_t);
    tr_uv_tcp_transport_t* tt = (tr_uv_tcp_transport_t* )pc_lib_malloc(len);
    memset(tt, 0, len);

    (void)plugin; /* unused */
    tt->base.connect = tr_uv_tcp_connect;
    tt->base.send = tr_uv_tcp_send;
    tt->base.disconnect = tr_uv_tcp_disconnect;
    tt->base.cleanup = tr_uv_tcp_cleanup;
    tt->base.quality = tr_uv_tcp_quality;
    tt->reconn_fn = tcp__reconn;

    tt->base.init = tr_uv_tcp_init;
    tt->base.internal_data = tr_uv_tcp_internal_data;
    tt->base.plugin = tr_uv_tcp_plugin;
    tt->base.quality = tr_uv_tcp_quality;

    tt->reset_fn = tcp__reset;
    tt->conn_done_cb = tcp__conn_done_cb;
    tt->write_async_cb = tcp__write_async_cb;
    tt->cleanup_async_cb = tcp__cleanup_async_cb;
    tt->write_check_timeout_cb = tcp__write_check_timeout_cb;
    tt->on_tcp_read_cb = tcp__on_tcp_read_cb;

    return (pc_transport_t* )tt;
}

void tr_uv_tcp_release(pc_transport_plugin_t* plugin, pc_transport_t* trans)
{
    (void)plugin; /* unused */

    pc_lib_free(trans);
}

void tr_uv_tcp_plugin_on_register(pc_transport_plugin_t* plugin)
{
    (void)plugin; /* unused */
    pc_JSON_Hooks h;
    h.malloc_fn = pc_lib_malloc;
    h.free_fn = pc_lib_free;
    pc_JSON_InitHooks(&h);
}

void tr_uv_tcp_plugin_on_deregister(pc_transport_plugin_t* plugin)
{
    (void)plugin; /* unused */
}

static void tr_uv_tcp_thread_fn(void* arg)
{
    uv_loop_t* lp = (uv_loop_t* )arg;
    tr_uv_tcp_transport_t* tt = (tr_uv_tcp_transport_t* )(lp->data);

    tt->thread_id = uv_thread_self();
    pc_lib_log(PC_LOG_INFO, "tr_uv_tcp_thread_fn - start uv loop thread");
    uv_run(lp, UV_RUN_DEFAULT);
}

static void tr_tcp_on_pkg_handler(pc_pkg_type type, const char* data, size_t len, void* ex_data)
{
    tr_uv_tcp_transport_t* tt = (tr_uv_tcp_transport_t* ) ex_data;

    assert(type == PC_PKG_HANDSHAKE || type == PC_PKG_HEARBEAT
           || type == PC_PKG_DATA || type == PC_PKG_KICK);

    switch(type) {
        case PC_PKG_HANDSHAKE:
            tcp__on_handshake_resp(tt, data, len);
            break;

        case PC_PKG_HEARBEAT:
            tcp__on_heartbeat(tt);
            break;

        case PC_PKG_DATA:
            tcp__on_data_recieved(tt, data, len);
            break;

        case PC_PKG_KICK:
            tcp__on_kick_recieved(tt);
            break;
        default:
            break;
    }
}

/**
 * uv_timer_init always return 0
 * uv_tcp_init always return 0, too
 * uv_async_init only fails in few cases, and  it is safe to ignore.
 *
 * so we do not check their returning value here.
 */
int tr_uv_tcp_init(pc_transport_t* trans, pc_client_t* client)
{
    int i;
    int ret;
    tr_uv_wi_t* wi;
    GET_TT;

    assert(trans && client);

    tt->client = client;
    tt->config = pc_client_config(client);

    tt->state = TR_UV_TCP_NOT_CONN;

    if (uv_loop_init(&tt->uv_loop)) {
        pc_lib_log(PC_LOG_ERROR, "tr_uv_tcp_init - init uv loop error");
        return PC_RC_ERROR;
    }

    tt->uv_loop.data = tt;

    /*
     * we do not init tt->socket here, because
     * tt->socket will be inited when to connect
     */
    tt->socket.data = tt;

    tt->thread_id = -1;

    ret = uv_timer_init(&tt->uv_loop, &tt->conn_timeout);
    assert(!ret);

    ret = uv_timer_init(&tt->uv_loop, &tt->reconn_delay_timer);
    assert(!ret);

    tt->conn_async.data = tt;
    ret = uv_async_init(&tt->uv_loop, &tt->conn_async, tcp__conn_async_cb);
    assert(!ret);

    tt->conn_timeout.data = tt;
    tt->reconn_delay_timer.data = tt;

    tt->reconn_times = 0;

    uv_timer_init(&tt->uv_loop, &tt->handshake_timer);
    assert(!ret);

    tt->handshake_timer.data = tt;

    tt->host = NULL;
    tt->port = 0;
    tt->handshake_opts = NULL;

    /* onle write wait queue need a mutex. */
    pc_mutex_init(&tt->wq_mutex);
    ret = uv_async_init(&tt->uv_loop, &tt->write_async, tt->write_async_cb);
    assert(!ret);
    tt->write_async.data = tt;

    QUEUE_INIT(&tt->conn_pending_queue);
    QUEUE_INIT(&tt->write_wait_queue);
    QUEUE_INIT(&tt->writing_queue);
    QUEUE_INIT(&tt->resp_pending_queue);

    for (i = 0; i < TR_UV_PRE_ALLOC_WI_SLOT_COUNT; ++i) {
        wi = &tt->pre_wis[i];
        memset(wi, 0, sizeof(tr_uv_wi_t));

        wi->type = PC_PRE_ALLOC | PC_PRE_ALLOC_ST_IDLE | TR_UV_WI_TYPE_NONE;
        QUEUE_INIT(&wi->queue);
    }
    tt->is_writing = 0;
    tt->is_connecting = 0;

    ret = uv_timer_init(&tt->uv_loop, &tt->check_timeout);
    assert(!ret);

    tt->check_timeout.data = tt;

    tt->disconnect_async.data = tt;
    ret = uv_async_init(&tt->uv_loop, &tt->disconnect_async, tcp__disconnect_async_cb);
    assert(!ret);

    tt->cleanup_async.data = tt;
    ret = uv_async_init(&tt->uv_loop, &tt->cleanup_async, tt->cleanup_async_cb);
    assert(!ret);

    ret = uv_timer_init(&tt->uv_loop, &tt->hb_timer);
    assert(!ret);

    ret = uv_timer_init(&tt->uv_loop, &tt->hb_timeout_timer);
    assert(!ret);

    tt->hb_timer.data = tt;
    tt->hb_timeout_timer.data = tt;
    tt->is_waiting_hb = 0;
    tt->hb_rtt = -1;

    pc_pkg_parser_init(&tt->pkg_parser, tr_tcp_on_pkg_handler, tt);

    tt->route_to_code = NULL;
    tt->code_to_route = NULL;
    tt->dict_ver = NULL;

    tt->server_protos = NULL;
    tt->client_protos = NULL;
    tt->proto_ver = NULL;

    if (tt->config->local_storage_cb) {
        size_t len;
        int ret;

        ret = tt->config->local_storage_cb(PC_LOCAL_STORAGE_OP_READ, NULL,
                &len, tt->config->ls_ex_data);
        if (!ret) {
            pc_JSON* lc = NULL;
            char* buf;
            size_t len2;

            assert(len > 0);
            buf = (char* )pc_lib_malloc(len);
            memset(buf, 0, len);

            ret = tt->config->local_storage_cb(PC_LOCAL_STORAGE_OP_READ, buf,
                    &len2, tt->config->ls_ex_data);
            assert(!ret);
            assert(len == len2);

            lc = pc_JSON_Parse(buf);
            pc_lib_free(buf);

            if (!lc) {
                pc_lib_log(PC_LOG_WARN, "tr_uv_tcp_init - load local storage failed, not valid json");
                goto next;
            }

            pc_lib_log(PC_LOG_INFO, "tr_uv_tcp_init - load local storage ok");

            tt->route_to_code = pc_JSON_DetachItemFromObject(lc, TR_UV_LCK_ROUTE_2_CODE);
            tt->code_to_route = pc_JSON_DetachItemFromObject(lc, TR_UV_LCK_CODE_2_ROUTE);
            tt->dict_ver = pc_JSON_DetachItemFromObject(lc, TR_UV_LCK_DICT_VERSION);

            /* the local dict is complete */
            if (!tt->dict_ver || !tt->code_to_route || !tt->route_to_code) {
                pc_JSON_Delete(tt->dict_ver);
                pc_JSON_Delete(tt->code_to_route);
                pc_JSON_Delete(tt->route_to_code);

                tt->dict_ver = NULL;
                tt->code_to_route = NULL;
                tt->route_to_code = NULL;
            }

            tt->client_protos = pc_JSON_DetachItemFromObject(lc, TR_UV_LCK_PROTO_CLIENT);
            tt->server_protos = pc_JSON_DetachItemFromObject(lc, TR_UV_LCK_PROTO_SERVER);
            tt->proto_ver = pc_JSON_DetachItemFromObject(lc, TR_UV_LCK_PROTO_VERSION);

            if (!tt->proto_ver || !tt->client_protos || !tt->server_protos) {
                pc_JSON_Delete(tt->proto_ver);
                pc_JSON_Delete(tt->server_protos);
                pc_JSON_Delete(tt->client_protos);

                tt->proto_ver = NULL;
                tt->client_protos = NULL;
                tt->server_protos = NULL;
            }
            pc_JSON_Delete(lc);
        }
    }

next:
    uv_thread_create(&tt->worker, tr_uv_tcp_thread_fn, &tt->uv_loop);

    return PC_RC_OK;
}

/**
 * uv_async_send always return 0
 */
int tr_uv_tcp_connect(pc_transport_t* trans, const char* host, int port, const char* handshake_opts)
{
    pc_JSON* handshake;
    GET_TT;

    assert(host);

    if (tt->handshake_opts) {
        pc_JSON_Delete(tt->handshake_opts);
        tt->handshake_opts = NULL;
    }

    if (handshake_opts) {
        handshake = pc_JSON_Parse(handshake_opts);
        if (!handshake) {
            pc_lib_log(PC_LOG_ERROR, "tr_uv_tcp_connect - handshake_opts is invalid json string");
            return PC_RC_INVALID_JSON;
        }
        tt->handshake_opts = handshake;
    }

    if (tt->host) {
        pc_lib_free((char* )tt->host);
        tt->host = NULL;
    }

    tt->host = pc_lib_strdup(host);
    tt->port = port;

    uv_async_send(&tt->conn_async);
    return PC_RC_OK;
}

int tr_uv_tcp_send(pc_transport_t* trans, const char* route, unsigned int seq_num, const char* msg, unsigned int req_id, int timeout)
{
    int i;
    tr_uv_wi_t* wi;
    pc_msg_t m;
    uv_buf_t buf;
    uv_buf_t pkg_buf;
    GET_TT;

    if (tt->state == TR_UV_TCP_NOT_CONN) {
        return PC_RC_INVALID_STATE;
    }

    assert(trans && route && msg && req_id != PC_INVALID_REQ_ID);

    m.id = req_id;
    m.msg = msg;
    m.route = route;

    buf = ((tr_uv_tcp_transport_plugin_t*)tr_uv_tcp_plugin((pc_transport_t*)tt))->pr_msg_encoder(tt, &m);
    if (buf.len == (unsigned int)-1) {
        pc_lib_log(PC_LOG_ERROR, "tr_uv_tcp_send - encode msg failed, msg: %s, route: %s", msg, route);
        return PC_RC_ERROR;
    }

    pkg_buf = pc_pkg_encode(PC_PKG_DATA, buf.base, buf.len);
    pc_lib_free(buf.base);

    if (pkg_buf.len == (unsigned int)-1) {
        pc_lib_log(PC_LOG_ERROR, "tr_uv_tcp_send - encode package failed");
        return PC_RC_ERROR;
    }

    wi = NULL;
    pc_mutex_lock(&tt->wq_mutex);
    for (i = 0; i < TR_UV_PRE_ALLOC_WI_SLOT_COUNT; ++i) {
        if (PC_PRE_ALLOC_IS_IDLE(tt->pre_wis[i].type)) {
            wi = &tt->pre_wis[i];
            PC_PRE_ALLOC_SET_BUSY(wi->type);
            pc_lib_log(PC_LOG_DEBUG, "tr_uv_tcp_send - use pre alloc write item, seq_num: %u, req_id: %u", seq_num, req_id);
            break;
        }
    }

    if (!wi) {
        wi = (tr_uv_wi_t* )pc_lib_malloc(sizeof(tr_uv_wi_t));
        memset(wi, 0, sizeof(tr_uv_wi_t));
        pc_lib_log(PC_LOG_DEBUG, "tr_uv_tcp_send - use dynamic alloc write item, seq_num: %u, req_id: %u", seq_num, req_id);
        wi->type = PC_DYN_ALLOC;
    }

    QUEUE_INIT(&wi->queue);

    /* if not done, push it to connecting queue. */
    if (tt->state == TR_UV_TCP_DONE) {
        QUEUE_INSERT_TAIL(&tt->write_wait_queue, &wi->queue);
        pc_lib_log(PC_LOG_DEBUG, "tr_uv_tcp_send - put to write wait queue, seq_num: %u, req_id: %u", seq_num, req_id);
    } else {
        QUEUE_INSERT_TAIL(&tt->conn_pending_queue, &wi->queue);
        pc_lib_log(PC_LOG_DEBUG, "tr_uv_tcp_send - put to conn pending queue, seq_num: %u, req_id: %u", seq_num, req_id);
    }

    if (PC_NOTIFY_PUSH_REQ_ID == req_id) {
        TR_UV_WI_SET_NOTIFY(wi->type);
    } else {
        TR_UV_WI_SET_RESP(wi->type);
    }

    wi->buf = pkg_buf;
    wi->seq_num = seq_num;
    wi->req_id = req_id;
    wi->timeout = timeout;
    wi->ts = time(NULL);

    pc_lib_log(PC_LOG_DEBUG, "tr_uv_tcp_send - seq num: %u, req_id: %u", seq_num, req_id);
    pc_mutex_unlock(&tt->wq_mutex);

    if (tt->state == TR_UV_TCP_CONNECTING || tt->state == TR_UV_TCP_HANDSHAKEING || tt->state == TR_UV_TCP_DONE) {
        uv_async_send(&tt->write_async);
    }

    return PC_RC_OK;
}

int tr_uv_tcp_disconnect(pc_transport_t* trans)
{
    GET_TT;

    uv_async_send(&tt->disconnect_async);
    return PC_RC_OK;
}

int tr_uv_tcp_cleanup(pc_transport_t* trans)
{
    GET_TT;

    if (tt->thread_id == uv_thread_self()) {
        pc_lib_log(PC_LOG_ERROR, "tr_uv_tcp_cleanup - can not cleanup a client in its callback");
        return PC_RC_INVALID_THREAD;
    }

    uv_async_send(&tt->cleanup_async);

    if (uv_thread_join(&tt->worker)) {
        pc_lib_log(PC_LOG_ERROR, "tr_uv_tcp_cleanup - join uv thread error");
        return PC_RC_ERROR;
    }

    pc_mutex_destroy(&tt->wq_mutex);
    uv_loop_close(&tt->uv_loop);

    return PC_RC_OK;
}

void* tr_uv_tcp_internal_data(pc_transport_t* trans)
{
    GET_TT;

    return &tt->uv_loop;
}

int tr_uv_tcp_quality(pc_transport_t* trans)
{
    GET_TT;

    return tt->hb_rtt;
}

pc_transport_plugin_t* tr_uv_tcp_plugin(pc_transport_t* trans)
{
    return pc_tr_uv_tcp_trans_plugin();
}

#undef GET_TT

