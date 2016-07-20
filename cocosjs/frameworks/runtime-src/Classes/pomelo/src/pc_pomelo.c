/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <time.h>

#include "pomelo.h"
#include "pomelo_trans.h"

#include "pc_lib.h"
#include "pc_pomelo.h"
#include "pc_trans_repo.h"

static int pc__init_magic_num = 0x65521abc;

static pc_client_config_t pc__default_config = PC_CLIENT_CONFIG_DEFAULT;

size_t pc_client_size()
{
    return sizeof(pc_client_t);
}

int pc_client_init(pc_client_t* client, void* ex_data, const pc_client_config_t* config)
{
    int i;
    pc_transport_plugin_t* tp;
    pc_transport_t* trans;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_init - client is null");
        return PC_RC_INVALID_ARG;
    }

    /* error report that using uninitialised value by valgrind here can be suppressed */
    if (client->magic_num == pc__init_magic_num) {
        pc_lib_log(PC_LOG_INFO, "pc_client_init - client has already inited");
        return PC_RC_OK;
    }

    if (!config) {
        client->config = pc__default_config;
    } else {
        memcpy(&client->config, config, sizeof(pc_client_config_t));
    }

    tp = pc__get_transport_plugin(client->config.transport_name);

    if (!tp) {
        client->magic_num = 0;
        pc_lib_log(PC_LOG_ERROR, "pc_client_init - no registered transport plugin found, transport plugin: %d", config->transport_name);
        return PC_RC_NO_TRANS;
    }

    assert(tp->transport_create);
    assert(tp->transport_release);

    trans = tp->transport_create(tp);
    if (!trans) {
        client->magic_num = 0;
        pc_lib_log(PC_LOG_ERROR, "pc_client_init - create transport error");
        return PC_RC_ERROR;
    }

    client->trans = trans;

    assert(client->trans->init);

    if (client->trans->init(client->trans, client)) {
        client->magic_num = 0;
        pc_lib_log(PC_LOG_ERROR, "pc_client_init - init transport error");
        tp->transport_release(tp, trans);
        return PC_RC_ERROR;
    }

    pc_mutex_init(&client->state_mutex);

    client->ex_data = ex_data;

    pc_mutex_init(&client->handler_mutex);
    QUEUE_INIT(&client->ev_handlers);

    pc_mutex_init(&client->req_mutex);
    pc_mutex_init(&client->notify_mutex);

    QUEUE_INIT(&client->req_queue);
    QUEUE_INIT(&client->notify_queue);

    client->seq_num = 0;
    client->req_id_seq = 1;

    memset(&client->requests[0], 0, sizeof(pc_request_t) * PC_PRE_ALLOC_REQUEST_SLOT_COUNT);
    memset(&client->notifies[0], 0, sizeof(pc_notify_t) * PC_PRE_ALLOC_NOTIFY_SLOT_COUNT);

    for (i = 0; i < PC_PRE_ALLOC_REQUEST_SLOT_COUNT; ++i) {
        QUEUE_INIT(&client->requests[i].base.queue);
        client->requests[i].base.client = client;
        client->requests[i].base.type = PC_REQ_TYPE_REQUEST | PC_PRE_ALLOC_ST_IDLE | PC_PRE_ALLOC;
    }

    for (i = 0; i < PC_PRE_ALLOC_NOTIFY_SLOT_COUNT; ++i) {
        QUEUE_INIT(&client->notifies[i].base.queue);
        client->notifies[i].base.client = client;
        client->notifies[i].base.type = PC_REQ_TYPE_NOTIFY | PC_PRE_ALLOC_ST_IDLE | PC_PRE_ALLOC;
    }

    pc_mutex_init(&client->event_mutex);
    if (client->config.enable_polling) {

        QUEUE_INIT(&client->pending_ev_queue);

        memset(&client->pending_events[0], 0, sizeof(pc_event_t) * PC_PRE_ALLOC_EVENT_SLOT_COUNT);

        for (i = 0; i < PC_PRE_ALLOC_EVENT_SLOT_COUNT; ++i) {
            QUEUE_INIT(&client->pending_events[i].queue);
            client->pending_events[i].type = PC_PRE_ALLOC_ST_IDLE | PC_PRE_ALLOC;
        }
    }

    client->is_in_poll = 0;

    client->magic_num = pc__init_magic_num;
    pc_lib_log(PC_LOG_DEBUG, "pc_client_init - init ok");
    client->state = PC_ST_INITED;

    return PC_RC_OK;
}

int pc_client_connect(pc_client_t* client, const char* host, int port, const char* handshake_opts)
{
    int state;
    int ret;

    if (!client || !host || port < 0 || port > (1 << 16) - 1) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_connect - invalid args");
        return PC_RC_INVALID_ARG;
    }

    if (client->config.enable_polling) {
        pc_client_poll(client);
    }

    state = pc_client_state(client);
    switch(state) {
    case PC_ST_NOT_INITED:
    case PC_ST_DISCONNECTING:
        pc_lib_log(PC_LOG_ERROR, "pc_client_connect - invalid state, state: %s", pc_client_state_str(state));
        return PC_RC_INVALID_STATE;

    case PC_ST_CONNECTED:
    case PC_ST_CONNECTING:
        pc_lib_log(PC_LOG_INFO, "pc_client_connect - client already connecting or connected");
        return PC_RC_OK;

    case PC_ST_INITED:
        assert(client->trans && client->trans->connect);

        pc_mutex_lock(&client->state_mutex);
        client->state = PC_ST_CONNECTING;
        pc_mutex_unlock(&client->state_mutex);

        ret = client->trans->connect(client->trans, host, port, handshake_opts);

        if (ret != PC_RC_OK) {
            pc_lib_log(PC_LOG_ERROR, "pc_client_connect - transport connect error, rc: %s", pc_client_rc_str(ret));
            pc_mutex_lock(&client->state_mutex);
            client->state = PC_ST_INITED;
            pc_mutex_unlock(&client->state_mutex);
        }

        return ret;
    }
    pc_lib_log(PC_LOG_ERROR, "pc_client_connect - unknown client state found, state: %d", state);
    return PC_RC_ERROR;
}

int pc_client_disconnect(pc_client_t* client)
{
    int state;
    int ret;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_disconnect - client is null");
        return PC_RC_INVALID_ARG;
    }

    if (client->config.enable_polling) {
        pc_client_poll(client);
    }

    state = pc_client_state(client);
    switch(state) {
        case PC_ST_NOT_INITED:
        case PC_ST_INITED:
            pc_lib_log(PC_LOG_ERROR, "pc_client_disconnect - invalid state, state: %s",
                    pc_client_state_str(state));
            return PC_RC_INVALID_STATE;

        case PC_ST_CONNECTING:
        case PC_ST_CONNECTED:
            assert(client->trans && client->trans->disconnect);

            pc_mutex_lock(&client->state_mutex);
            client->state = PC_ST_DISCONNECTING;
            pc_mutex_unlock(&client->state_mutex);

            ret = client->trans->disconnect(client->trans);

            if (ret != PC_RC_OK) {
                pc_lib_log(PC_LOG_ERROR, "pc_client_disconnect - transport disconnect error: %s",
                        pc_client_rc_str(ret));
                pc_mutex_lock(&client->state_mutex);
                client->state = state;
                pc_mutex_unlock(&client->state_mutex);
            }
            return ret;

        case PC_ST_DISCONNECTING:
            pc_lib_log(PC_LOG_INFO, "pc_client_disconnect - client is already disconnecting");
            return PC_RC_OK;
    }
    pc_lib_log(PC_LOG_ERROR, "pc_client_disconnect - unknown client state found, %d", state);
    return PC_RC_ERROR;
}

int pc_client_cleanup(pc_client_t* client)
{
    QUEUE* q;
    int ret;
    pc_ev_handler_t* handler;
    pc_transport_plugin_t* plugin;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_cleanup - client is null");
        return PC_RC_INVALID_ARG;
    }

    if (client->magic_num != pc__init_magic_num) {
        pc_lib_log(PC_LOG_INFO, "pc_client_cleanup - client has not been inited");
        return PC_RC_OK;
    }

    assert(client->trans && client->trans->cleanup);

    /*
     * when cleaning transport up, transport should ack all
     * the request it holds from client so that client can release them
     *
     * transport->cleanup may be blocking.
     */
    ret = client->trans->cleanup(client->trans);
    if (ret != PC_RC_OK) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_cleanup - transport cleanup error: %s", pc_client_rc_str(ret));
        return ret;
    }

    plugin = client->trans->plugin(client->trans);
    plugin->transport_release(plugin, client->trans);

    client->trans = NULL;

    if (client->config.enable_polling) {
        pc_client_poll(client);

        assert(QUEUE_EMPTY(&client->pending_events));
    }

    assert(QUEUE_EMPTY(&client->req_queue));
    assert(QUEUE_EMPTY(&client->notify_queue));

    while(!QUEUE_EMPTY(&client->ev_handlers)) {
        q = QUEUE_HEAD(&client->ev_handlers);
        QUEUE_REMOVE(q);
        QUEUE_INIT(q);

        handler = QUEUE_DATA(q, pc_ev_handler_t, queue);

        if (handler->destructor) {
            handler->destructor(handler->ex_data);
        }

        pc_lib_free(handler);
    }

    pc_mutex_destroy(&client->req_mutex);
    pc_mutex_destroy(&client->notify_mutex);
    pc_mutex_destroy(&client->event_mutex);

    pc_mutex_destroy(&client->handler_mutex);
    pc_mutex_destroy(&client->state_mutex);

    client->req_id_seq = 1;
    client->seq_num = 0;

    client->magic_num = 0;
    client->state = PC_ST_NOT_INITED;

    return PC_RC_OK;
}

static void pc__handle_event(pc_client_t* client, pc_event_t* ev)
{
    assert(PC_EV_IS_RESP(ev->type) || PC_EV_IS_NOTIFY_SENT(ev->type) || PC_EV_IS_NET_EVENT(ev->type));

    if (PC_EV_IS_RESP(ev->type)) {
        pc__trans_resp(client, ev->data.req.req_id, ev->data.req.rc, ev->data.req.resp, 0/* not pending */);
        pc_lib_log(PC_LOG_DEBUG, "pc__handle_event - fire pending trans resp, req_id: %u, rc: %s",
                ev->data.req.req_id, pc_client_rc_str(ev->data.req.rc));
        pc_lib_free((char* )ev->data.req.resp);
        ev->data.req.resp = NULL;

    } else if (PC_EV_IS_NOTIFY_SENT(ev->type)) {
        pc__trans_sent(client, ev->data.notify.seq_num, ev->data.notify.rc, 0/* not pending */);
        pc_lib_log(PC_LOG_DEBUG, "pc__handle_event - fire pending trans sent, seq_num: %u, rc: %s",
                ev->data.notify.seq_num, pc_client_rc_str(ev->data.notify.rc));
    } else {
        pc__trans_fire_event(client, ev->data.ev.ev_type, ev->data.ev.arg1, ev->data.ev.arg2, 0/* not pending */);
        pc_lib_log(PC_LOG_DEBUG, "pc__handle_event - fire pending trans event: %s, arg1: %s",
                pc_client_ev_str(ev->data.ev.ev_type), ev->data.ev.arg1 ? ev->data.ev.arg1 : "");
        pc_lib_free((char* )ev->data.ev.arg1);
        pc_lib_free((char* )ev->data.ev.arg2);

        ev->data.ev.arg1 = NULL;
        ev->data.ev.arg2 = NULL;
    }

    if (PC_IS_DYN_ALLOC(ev->type)) {
        pc_lib_free(ev);
    } else {
        PC_PRE_ALLOC_SET_IDLE(ev->type);
    }
}

int pc_client_poll(pc_client_t* client)
{
    pc_event_t* ev;
    QUEUE* q;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_poll - client is null");
        return PC_RC_INVALID_ARG;
    }

    if (!client->config.enable_polling) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_poll - client did not enable polling");
        return PC_RC_ERROR;
    }

    pc_mutex_lock(&client->event_mutex);

    /*
     * `is_in_poll` is used to avoid recursive invocation of pc_client_poll
     * by identical thread as `pc_mutex_t` is recursive.
     *
     * `is_in_poll` can be protected by `event_mutex` too, so no extra mutex
     * is needed here.
     */
    if (!client->is_in_poll) {
        client->is_in_poll = 1;

        while(!QUEUE_EMPTY(&client->pending_ev_queue)) {
            q = QUEUE_HEAD(&client->pending_ev_queue);
            ev = (pc_event_t*) QUEUE_DATA(q, pc_event_t, queue);

            QUEUE_REMOVE(&ev->queue);
            QUEUE_INIT(&ev->queue);

            assert((PC_IS_PRE_ALLOC(ev->type) && PC_PRE_ALLOC_IS_BUSY(ev->type)) || PC_IS_DYN_ALLOC(ev->type));

            pc__handle_event(client, ev);
        }
        client->is_in_poll = 0;
    }

    pc_mutex_unlock(&client->event_mutex);

    return PC_RC_OK;
}

int pc_client_add_ev_handler(pc_client_t* client, pc_event_cb_t cb,
        void* ex_data, void (*destructor)(void* ex_data))
{
    pc_ev_handler_t* handler;
    static int handler_id = 0;

    if (!client || !cb) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_add_ev_handler - invalid args");
        return PC_EV_INVALID_HANDLER_ID;
    }

    handler = (pc_ev_handler_t*)pc_lib_malloc(sizeof(pc_ev_handler_t));
    memset(handler, 0, sizeof(pc_ev_handler_t));

    QUEUE_INIT(&handler->queue);
    handler->ex_data = ex_data;
    handler->cb = cb;
    handler->handler_id = handler_id++;
    handler->destructor = destructor;

    pc_mutex_lock(&client->handler_mutex);

    QUEUE_INSERT_TAIL(&client->ev_handlers, &handler->queue);
    pc_lib_log(PC_LOG_INFO, "pc_client_add_ev_handler -"
            " add event handler, handler id: %d", handler->handler_id);

    pc_mutex_unlock(&client->handler_mutex);

    return handler->handler_id;
}

int pc_client_rm_ev_handler(pc_client_t* client, int id)
{
    QUEUE* q;
    pc_ev_handler_t* handler;
    int flag = 0;

    pc_mutex_lock(&client->handler_mutex);

    QUEUE_FOREACH(q, &client->ev_handlers) {
        handler = QUEUE_DATA(q, pc_ev_handler_t, queue);

        if (handler->handler_id != id)
            continue;

        pc_lib_log(PC_LOG_INFO, "pc_client_rm_ev_handler - rm handler, handler_id: %d", id);
        flag = 1;
        QUEUE_REMOVE(q);
        QUEUE_INIT(q);

        if (handler->destructor) {
            handler->destructor(handler->ex_data);
        }

        pc_lib_free(handler);
        break;
    }

    pc_mutex_unlock(&client->handler_mutex);

    if (!flag) {
        pc_lib_log(PC_LOG_WARN, "pc_client_rm_ev_handler - no matched event handler found, handler id: %d", id);
    }

    return PC_RC_OK;
}

void* pc_client_ex_data(const pc_client_t* client)
{
    return client->ex_data;
}

const pc_client_config_t* pc_client_config(const pc_client_t* client)
{
    return &client->config;
}

int pc_client_state(pc_client_t* client)
{
    int state;

    if (!client) {
        pc_lib_log(PC_LOG_DEBUG, "pc_client_state - client is null");
        return PC_ST_UNKNOWN;
    }

    if (client->magic_num != pc__init_magic_num) {
        return PC_ST_NOT_INITED;
    }

    pc_mutex_lock(&client->state_mutex);
    state = client->state;
    pc_mutex_unlock(&client->state_mutex);

    return state;
}

int pc_client_conn_quality(pc_client_t* client)
{
    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_conn_quality - client is null, invalid arg");
        return PC_RC_INVALID_ARG;
    }

    assert(client->trans);

    if (client->trans->quality) {
        return client->trans->quality(client->trans);
    } else {
        pc_lib_log(PC_LOG_ERROR, "pc_client_conn_quality - transport doesn't support qulity query");
    }

    return PC_RC_ERROR;
}

void* pc_client_trans_data(pc_client_t* client)
{
    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_trans_data - client is null, invalid arg");
        return NULL;
    }

    assert(client->trans);

    if (client->trans->internal_data) {
        return client->trans->internal_data(client->trans);
    } else {
        pc_lib_log(PC_LOG_ERROR, "pc_client_trans_data - transport doesn't support internal data");
    }

    return NULL;
}

int pc_request_with_timeout(pc_client_t* client, const char* route, const char* msg, void* ex_data,
        int timeout, pc_request_cb_t cb)
{
    pc_request_t* req;
    int i;
    int ret;
    int state;

    if (!client || !route || !msg || !cb) {
        pc_lib_log(PC_LOG_ERROR, "pc_request_with_timeout - invalid args");
        return PC_RC_INVALID_ARG;
    }

    state = pc_client_state(client);
    if(state != PC_ST_CONNECTED && state != PC_ST_CONNECTING) {
        pc_lib_log(PC_LOG_ERROR, "pc_request_with_timeout - invalid state, state: %s", pc_client_state_str(state));
        return PC_RC_INVALID_STATE;
    }

    if (timeout != PC_WITHOUT_TIMEOUT && timeout <= 0) {
        pc_lib_log(PC_LOG_ERROR, "pc_request_with_timeout - timeout value is invalid");
        return PC_RC_INVALID_ARG;
    }

    assert(client->trans && client->trans->send);

    pc_mutex_lock(&client->req_mutex);

    req = NULL;
    for (i = 0; i < PC_PRE_ALLOC_REQUEST_SLOT_COUNT; ++i) {
        if (PC_PRE_ALLOC_IS_IDLE(client->requests[i].base.type)) {
            req = &client->requests[i];

            PC_PRE_ALLOC_SET_BUSY(req->base.type);
            assert(!req->base.route && !req->base.msg);
            assert(PC_IS_PRE_ALLOC(req->base.type));
            pc_lib_log(PC_LOG_DEBUG, "pc_request_with_timeout - use pre alloc request");

            break;
        }
    }

    if (!req) {
        req = (pc_request_t* )pc_lib_malloc(sizeof(pc_request_t));
        memset(req, 0, sizeof(pc_request_t));

        pc_lib_log(PC_LOG_DEBUG, "pc_request_with_timeout - use dynamic alloc request");
        req->base.type = PC_DYN_ALLOC | PC_REQ_TYPE_REQUEST;
        req->base.client = client;
    }

    QUEUE_INIT(&req->base.queue);
    QUEUE_INSERT_TAIL(&client->req_queue, &req->base.queue);

    req->base.route = pc_lib_strdup(route);
    req->base.msg = pc_lib_strdup(msg);

    req->base.seq_num = client->seq_num++;
    req->base.timeout = timeout;
    req->base.ex_data = ex_data;

    if (client->req_id_seq == PC_NOTIFY_PUSH_REQ_ID || client->req_id_seq == PC_INVALID_REQ_ID)
        client->req_id_seq = 1;
    req->req_id = client->req_id_seq++;
    req->cb = cb;

    pc_mutex_unlock(&client->req_mutex);

    pc_lib_log(PC_LOG_INFO, "pc_request_with_timeout - add request to queue, req id: %u", req->req_id);

    ret = client->trans->send(client->trans, req->base.route, req->base.seq_num, req->base.msg, req->req_id, req->base.timeout);

    if (ret != PC_RC_OK) {
        pc_lib_log(PC_LOG_ERROR, "pc_request_with_timeout - send to transport error,"
                " req id: %u, error: %s", req->req_id, pc_client_rc_str(ret));

        pc_mutex_lock(&client->req_mutex);

        pc_lib_free((char* )req->base.msg);
        pc_lib_free((char* )req->base.route);

        req->base.msg = NULL;
        req->base.route = NULL;

        QUEUE_REMOVE(&req->base.queue);
        QUEUE_INIT(&req->base.queue);

        if (PC_IS_PRE_ALLOC(req->base.type)) {
            PC_PRE_ALLOC_SET_IDLE(req->base.type);
        } else {
            pc_lib_free(req);
        }

        pc_mutex_unlock(&client->req_mutex);
    }

    return ret;
}

pc_client_t* pc_request_client(const pc_request_t* req)
{
    assert(req);
    return req->base.client;
}

const char* pc_request_route(const pc_request_t* req)
{
    assert(req);
    return req->base.route;
}

const char* pc_request_msg(const pc_request_t* req)
{
    assert(req);
    return req->base.msg;
}

int pc_request_timeout(const pc_request_t* req)
{
    assert(req);
    return req->base.timeout;
}

void* pc_request_ex_data(const pc_request_t* req)
{
    assert(req);
    return req->base.ex_data;
}

int pc_notify_with_timeout(pc_client_t* client, const char* route, const char* msg, void* ex_data,
       int timeout, pc_notify_cb_t cb)
{
    pc_notify_t* notify;
    int i;
    int ret;
    int state;

    if (!client || !route || !msg || !cb) {
        pc_lib_log(PC_LOG_ERROR, "pc_notify_with_timeout - invalid args");
        return PC_RC_INVALID_ARG;
    }

    if (timeout != PC_WITHOUT_TIMEOUT && timeout <= 0) {
        pc_lib_log(PC_LOG_ERROR, "pc_notify_with_timeout - invalid timeout value");
        return PC_RC_INVALID_ARG;
    }

    state = pc_client_state(client);
    if(state != PC_ST_CONNECTED && state != PC_ST_CONNECTING) {
        pc_lib_log(PC_LOG_ERROR, "pc_request_with_timeout - invalid state, state: %s", pc_client_state_str(state));
        return PC_RC_INVALID_STATE;
    }


    assert(client->trans && client->trans->send);

    pc_mutex_lock(&client->req_mutex);

    notify = NULL;
    for (i = 0; i < PC_PRE_ALLOC_NOTIFY_SLOT_COUNT; ++i) {
        if (PC_PRE_ALLOC_IS_IDLE(client->notifies[i].base.type)) {
            notify = &client->notifies[i];

            PC_PRE_ALLOC_SET_BUSY(notify->base.type);

            pc_lib_log(PC_LOG_DEBUG, "pc_notify_with_timeout - use pre alloc notify");
            assert(!notify->base.route && !notify->base.msg);
            assert(PC_IS_PRE_ALLOC(notify->base.type));

            break;
        }
    }

    if (!notify) {
        notify = (pc_notify_t* )pc_lib_malloc(sizeof(pc_notify_t));
        memset(notify, 0, sizeof(pc_notify_t));

        pc_lib_log(PC_LOG_DEBUG, "pc_notify_with_timeout - use dynamic alloc notify");
        notify->base.type = PC_REQ_TYPE_NOTIFY | PC_DYN_ALLOC;
        notify->base.client = client;
    }

    QUEUE_INIT(&notify->base.queue);
    QUEUE_INSERT_TAIL(&client->notify_queue, &notify->base.queue);

    notify->base.route = pc_lib_strdup(route);
    notify->base.msg = pc_lib_strdup(msg);

    notify->base.seq_num = client->seq_num++;

    notify->base.timeout = timeout;
    notify->base.ex_data = ex_data;

    notify->cb = cb;

    pc_mutex_unlock(&client->req_mutex);

    pc_lib_log(PC_LOG_INFO, "pc_notify_with_timeout - add notify to queue, seq num: %u", notify->base.seq_num);

    ret = client->trans->send(client->trans, notify->base.route, notify->base.seq_num,
            notify->base.msg, PC_NOTIFY_PUSH_REQ_ID, notify->base.timeout);

    if (ret != PC_RC_OK) {
        pc_lib_log(PC_LOG_ERROR, "pc_notify_with_timeout - send to transport error,"
                " seq num: %u, error: %s", notify->base.seq_num, pc_client_rc_str(ret));

        pc_mutex_lock(&client->req_mutex);

        pc_lib_free((char* )notify->base.msg);
        pc_lib_free((char* )notify->base.route);

        notify->base.msg = NULL;
        notify->base.route = NULL;

        QUEUE_REMOVE(&notify->base.queue);
        QUEUE_INIT(&notify->base.queue);

        if (PC_IS_PRE_ALLOC(notify->base.type)) {
            PC_PRE_ALLOC_SET_IDLE(notify->base.type);
        } else {
            pc_lib_free(notify);
        }

        pc_mutex_unlock(&client->req_mutex);
    }
    return ret;
}

pc_client_t* pc_notify_client(const pc_notify_t* notify)
{
    assert(notify);
    return notify->base.client;
}

const char* pc_notify_route(const pc_notify_t* notify)
{
    assert(notify);
    return notify->base.route;
}

const char* pc_notify_msg(const pc_notify_t* notify)
{
    assert(notify);
    return notify->base.msg;
}

int pc_notify_timeout(const pc_notify_t* notify)
{
    assert(notify);
    return notify->base.timeout;
}

void* pc_notify_ex_data(const pc_notify_t* notify)
{
    assert(notify);
    return notify->base.ex_data;
}
