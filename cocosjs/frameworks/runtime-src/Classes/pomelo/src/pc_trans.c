/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <assert.h>
#include <string.h>

#include "pomelo_trans.h"

#include "pc_lib.h"
#include "pc_pomelo.h"

void pc_trans_fire_event(pc_client_t* client, int ev_type, const char* arg1, const char* arg2)
{
    int pending = 0;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_client_fire_event - client is null");
        return ;
    }

    if (client->config.enable_polling) {
        pending = 1;
    }

    pc__trans_fire_event(client, ev_type, arg1, arg2, pending);
}

void pc__trans_fire_event(pc_client_t* client, int ev_type, const char* arg1, const char* arg2, int pending)
{
    QUEUE* q;
    pc_ev_handler_t* handler;
    pc_event_t* ev;
    int i;

    if (ev_type >= PC_EV_COUNT || ev_type < 0) {
        pc_lib_log(PC_LOG_ERROR, "pc__transport_fire_event - error event type");
        return;
    }

    if (ev_type == PC_EV_USER_DEFINED_PUSH && (!arg1 || !arg2)) {
        pc_lib_log(PC_LOG_ERROR, "pc__transport_fire_event - push msg but without a route or msg");
        return;
    }

    if (ev_type == PC_EV_CONNECT_ERROR || ev_type == PC_EV_UNEXPECTED_DISCONNECT
            || ev_type == PC_EV_PROTO_ERROR || ev_type == PC_EV_CONNECT_FAILED) {
        if (!arg1) {
            pc_lib_log(PC_LOG_ERROR, "pc__transport_fire_event - event should be with a reason description");
            return ;
        }
    }

    if (pending) {
        assert(client->config.enable_polling);

        pc_lib_log(PC_LOG_INFO, "pc__trans_fire_event - add pending event: %s", pc_client_ev_str(ev_type));
        pc_mutex_lock(&client->event_mutex);

        ev = NULL;
        for (i = 0; i < PC_PRE_ALLOC_EVENT_SLOT_COUNT; ++i) {
            if (PC_PRE_ALLOC_IS_IDLE(client->pending_events[i].type)) {
                ev = &client->pending_events[i];
                PC_PRE_ALLOC_SET_BUSY(ev->type);
                break;
            }
        }

        if (!ev) {
            ev = (pc_event_t* )pc_lib_malloc(sizeof(pc_event_t));
            memset(ev, 0, sizeof(pc_event_t));

            ev->type = PC_DYN_ALLOC;
        }

        PC_EV_SET_NET_EVENT(ev->type);

        QUEUE_INIT(&ev->queue);
        QUEUE_INSERT_TAIL(&client->pending_ev_queue, &ev->queue);

        ev->data.ev.ev_type = ev_type;

        if (arg1) {
            ev->data.ev.arg1 = pc_lib_strdup(arg1);
        } else {
            ev->data.ev.arg1 = NULL;
        }

        if (arg2) {
            ev->data.ev.arg2 = pc_lib_strdup(arg2);
        } else {
            ev->data.ev.arg2 = NULL;
        }

        pc_mutex_unlock(&client->event_mutex);

        return ;
    }

    pc_lib_log(PC_LOG_INFO, "pc__trans_fire_event - fire event: %s, arg1: %s, arg2: %s",
            pc_client_ev_str(ev_type), arg1 ? arg1 : "", arg2 ? arg2 : "");
    pc_mutex_lock(&client->state_mutex);
    switch(ev_type) {
        case PC_EV_CONNECTED:
            assert(client->state == PC_ST_CONNECTING);
            client->state = PC_ST_CONNECTED;
            break;

        case PC_EV_CONNECT_ERROR:
            assert(client->state == PC_ST_CONNECTING || client->state == PC_ST_DISCONNECTING);
            break;

        case PC_EV_CONNECT_FAILED:
            assert(client->state == PC_ST_CONNECTING || client->state == PC_ST_DISCONNECTING);
            client->state = PC_ST_INITED;
            break;

        case PC_EV_DISCONNECT:
            assert(client->state == PC_ST_DISCONNECTING);
            client->state = PC_ST_INITED;
            break;

        case PC_EV_KICKED_BY_SERVER:
            assert(client->state == PC_ST_CONNECTED || client->state == PC_ST_DISCONNECTING);
            client->state = PC_ST_INITED;
            break;

        case PC_EV_UNEXPECTED_DISCONNECT:
        case PC_EV_PROTO_ERROR:
            assert(client->state == PC_ST_CONNECTING || client->state == PC_ST_CONNECTED
                    || client->state == PC_ST_DISCONNECTING);
            client->state = PC_ST_CONNECTING;
            break;
        case PC_EV_USER_DEFINED_PUSH:
            /* do nothing here */
            break;

        default:
            /* never run to here */
            pc_lib_log(PC_LOG_ERROR, "pc__trans_fire_event - unknown network event: %d", ev_type);
    }
    pc_mutex_unlock(&client->state_mutex);

    /* invoke handler */
    pc_mutex_lock(&client->handler_mutex);
    QUEUE_FOREACH(q, &client->ev_handlers) {
        handler = QUEUE_DATA(q, pc_ev_handler_t, queue);
        assert(handler && handler->cb);
        handler->cb(client, ev_type, handler->ex_data, arg1, arg2);
    }
    pc_mutex_unlock(&client->handler_mutex);
}

void pc_trans_sent(pc_client_t* client, unsigned int seq_num, int rc)
{
    int pending = 0;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_trans_sent - client is null");
        return ;
    }

    if (client->config.enable_polling) {
        pending = 1;
    }
    pc__trans_sent(client, seq_num, rc, pending);
}

void pc__trans_sent(pc_client_t* client, unsigned int seq_num, int rc, int pending)
{
    QUEUE* q;
    pc_notify_t* notify;
    pc_notify_t* target;
    pc_event_t* ev;
    int i;

    if (pending) {
        pc_mutex_lock(&client->event_mutex);

        pc_lib_log(PC_LOG_INFO, "pc__trans_sent - add pending sent event, seq_num: %u, rc: %s",
                seq_num, pc_client_rc_str(rc));

        ev = NULL;
        for (i = 0; i < PC_PRE_ALLOC_EVENT_SLOT_COUNT; ++i) {
            if (PC_PRE_ALLOC_IS_IDLE(client->pending_events[i].type)) {
                ev = &client->pending_events[i];
                PC_PRE_ALLOC_SET_BUSY(ev->type);
                break;
            }
        }

        if (!ev) {
            ev = (pc_event_t* )pc_lib_malloc(sizeof(pc_event_t));
            memset(ev, 0, sizeof(pc_event_t));
            ev->type = PC_DYN_ALLOC;
        }

        QUEUE_INIT(&ev->queue);

        PC_EV_SET_NOTIFY_SENT(ev->type);
        ev->data.notify.seq_num = seq_num;
        ev->data.notify.rc = rc;

        QUEUE_INSERT_TAIL(&client->pending_ev_queue, &ev->queue);

        pc_mutex_unlock(&client->event_mutex);

        return ;
    }

    /* callback immediately */
    pc_mutex_lock(&client->notify_mutex);
    target = NULL;
    QUEUE_FOREACH(q, &client->notify_queue) {
        notify = (pc_notify_t* )QUEUE_DATA(q, pc_common_req_t, queue);
        if (notify->base.seq_num == seq_num) {

            pc_lib_log(PC_LOG_INFO, "pc__trans_sent - fire sent event, seq_num: %u, rc: %s",
                    seq_num, pc_client_rc_str(rc));

            target = notify;
            QUEUE_REMOVE(q);
            QUEUE_INIT(q);
            break;
        }
    }
    pc_mutex_unlock(&client->notify_mutex);

    if (target) {
        target->cb(target, rc);
        pc_lib_free((char*)target->base.msg);
        pc_lib_free((char*)target->base.route);

        target->base.msg = NULL;
        target->base.route = NULL;

        if (PC_IS_PRE_ALLOC(target->base.type)) {

            pc_mutex_lock(&client->notify_mutex);
            PC_PRE_ALLOC_SET_IDLE(target->base.type);
            pc_mutex_unlock(&client->notify_mutex);

        } else {
            pc_lib_free(target);
        }

    } else {
        pc_lib_log(PC_LOG_ERROR, "pc__trans_sent - no pending notify found"
                " when transport has sent it, seq num: %u", seq_num);
    }
}

void pc_trans_resp(pc_client_t* client, unsigned int req_id, int rc, const char* resp)
{
    int pending = 0;

    if (!client) {
        pc_lib_log(PC_LOG_ERROR, "pc_trans_resp - client is null");
        return ;
    }

    if (client->config.enable_polling) {
        pending = 1;
    }

    pc__trans_resp(client, req_id, rc, resp, pending);
}

void pc__trans_resp(pc_client_t* client, unsigned int req_id, int rc, const char* resp, int pending)
{
    QUEUE* q;
    pc_request_t* req;
    pc_event_t* ev;
    pc_request_t* target;
    int i;

    if (pending) {
        pc_mutex_lock(&client->event_mutex);

        pc_lib_log(PC_LOG_INFO, "pc__trans_resp - add pending resp event, req_id: %u, rc: %s",
                req_id, pc_client_rc_str(rc));
        ev = NULL;
        for (i = 0; i < PC_PRE_ALLOC_EVENT_SLOT_COUNT; ++i) {
            if (PC_PRE_ALLOC_IS_IDLE(client->pending_events[i].type)) {
                ev = &client->pending_events[i];
                PC_PRE_ALLOC_SET_BUSY(ev->type);
                break;
            }
        }

        if (!ev) {
            ev = (pc_event_t* )pc_lib_malloc(sizeof(pc_event_t));
            memset(ev, 0, sizeof(pc_event_t));

            ev->type = PC_DYN_ALLOC;
        }

        PC_EV_SET_RESP(ev->type);

        QUEUE_INIT(&ev->queue);
        ev->data.req.req_id = req_id;
        ev->data.req.rc = rc;
        ev->data.req.resp = pc_lib_strdup(resp);

        QUEUE_INSERT_TAIL(&client->pending_ev_queue, &ev->queue);

        pc_mutex_unlock(&client->event_mutex);
        return ;
    }

    /* invoke callback immediately */
    target = NULL;
    pc_mutex_lock(&client->req_mutex);
    QUEUE_FOREACH(q, &client->req_queue) {
        req= (pc_request_t* )QUEUE_DATA(q, pc_common_req_t, queue);
        if (req->req_id == req_id) {

            pc_lib_log(PC_LOG_INFO, "pc__trans_resp - fire resp event, req_id: %u, rc: %s",
                    req_id, pc_client_rc_str(rc));

            target = req;
            QUEUE_REMOVE(q);
            QUEUE_INIT(q);
            break;
        }
    }
    pc_mutex_unlock(&client->req_mutex);

    if (target) {
        target->cb(target, rc, resp);

        pc_lib_free((char*)target->base.msg);
        pc_lib_free((char*)target->base.route);

        target->base.msg = NULL;
        target->base.route = NULL;

        if (PC_IS_PRE_ALLOC(target->base.type)) {

            pc_mutex_lock(&client->req_mutex);
            PC_PRE_ALLOC_SET_IDLE(target->base.type);
            pc_mutex_unlock(&client->req_mutex);

        } else {
            pc_lib_free(target);
        }
    } else {
        pc_lib_log(PC_LOG_ERROR, "pc__trans_resp - no pending request found when"
            " get a response, req id: %u", req_id);
    }
}

