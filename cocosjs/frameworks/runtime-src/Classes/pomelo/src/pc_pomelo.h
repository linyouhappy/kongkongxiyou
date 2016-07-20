/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PC_POMELO_I_H
#define PC_POMELO_I_H

#include "pomelo.h"
#include "pomelo_trans.h"

#include "pc_mutex.h"
#include "queue.h"

#define PC_PRE_ALLOC 0x1
#define PC_DYN_ALLOC 0x0
#define PC_ALLOC_MASK 0x1

#define PC_IS_PRE_ALLOC(type) (((type) & PC_ALLOC_MASK) == PC_PRE_ALLOC)
#define PC_IS_DYN_ALLOC(type) (((type) & PC_ALLOC_MASK) == PC_DYN_ALLOC)

#define PC_PRE_ALLOC_ST_IDLE 0x0
#define PC_PRE_ALLOC_ST_BUSY 0x2
#define PC_PRE_ALLOC_ST_MASK 0x2

#define PC_PRE_ALLOC_IS_IDLE(type) (((type) & PC_PRE_ALLOC_ST_MASK) == PC_PRE_ALLOC_ST_IDLE)
#define PC_PRE_ALLOC_IS_BUSY(type) (((type) & PC_PRE_ALLOC_ST_MASK) == PC_PRE_ALLOC_ST_BUSY)

#define PC_PRE_ALLOC_SET_IDLE(type) do { (type) &= ~PC_PRE_ALLOC_ST_MASK; (type) |= PC_PRE_ALLOC_ST_IDLE; } while(0)
#define PC_PRE_ALLOC_SET_BUSY(type) do { (type) &= ~PC_PRE_ALLOC_ST_MASK; (type) |= PC_PRE_ALLOC_ST_BUSY; } while(0)

#define PC_REQ_TYPE_NOTIFY 0x10
#define PC_REQ_TYPE_REQUEST 0x20
#define PC_REQ_TYPE_MASK 0xf0

#define PC_REQ_IS_NOTIFY(type) (((type) & PC_REQ_TYPE_MASK) == PC_REQ_TYPE_NOTIFY)
#define PC_REQ_IS_REQUEST(type) (((type) & PC_REQ_TYPE_MASK) == PC_REQ_TYPE_REQUEST)

#define PC_EV_TYPE_NOTIFY_SENT 0x10
#define PC_EV_TYPE_RESP 0x20
#define PC_EV_TYPE_NET_EVENT 0x40
#define PC_EV_TYPE_MASK 0xf0

#define PC_EV_IS_NOTIFY_SENT(type) (((type) & PC_EV_TYPE_MASK) == PC_EV_TYPE_NOTIFY_SENT)
#define PC_EV_IS_RESP(type) (((type) & PC_EV_TYPE_MASK) == PC_EV_TYPE_RESP)
#define PC_EV_IS_NET_EVENT(type) (((type) & PC_EV_TYPE_MASK) == PC_EV_TYPE_NET_EVENT)

#define PC_EV_SET_NOTIFY_SENT(type) do { (type) &= ~PC_EV_TYPE_MASK; (type) |= PC_EV_TYPE_NOTIFY_SENT; } while(0)
#define PC_EV_SET_RESP(type) do { (type) &= ~PC_EV_TYPE_MASK; (type) |= PC_EV_TYPE_RESP; } while(0)
#define PC_EV_SET_NET_EVENT(type) do { (type) &= ~PC_EV_TYPE_MASK; (type) |= PC_EV_TYPE_NET_EVENT; } while(0)


/* +2 for net event */
#define PC_PRE_ALLOC_EVENT_SLOT_COUNT \
    (PC_PRE_ALLOC_NOTIFY_SLOT_COUNT + PC_PRE_ALLOC_REQUEST_SLOT_COUNT + 2)

typedef struct {
    QUEUE queue;
    pc_client_t* client;
    unsigned int type;

    const char* route;
    const char* msg;
    unsigned int seq_num;
    int timeout;
    void* ex_data;
} pc_common_req_t;

typedef struct {
    QUEUE queue;
    void* ex_data;
    void (*destructor)(void* ex_data);
    int handler_id;
    pc_event_cb_t cb;
} pc_ev_handler_t;

struct pc_request_s {
    pc_common_req_t base;

    unsigned int req_id;
    pc_request_cb_t cb;
};

struct pc_notify_s {
    pc_common_req_t base;

    pc_notify_cb_t cb;
};

typedef struct {
    QUEUE queue;
    unsigned int type;

    union {
        struct {
            int seq_num;
            int rc;
        } notify;

        struct {
            int req_id;
            int rc;
            const char* resp;
        } req;

        struct {
            int ev_type;
            const char* arg1;
            const char* arg2;
        } ev;
    } data;
} pc_event_t;

struct pc_client_s {
    int magic_num;

    /* as the state will be updated by multi threads */
    pc_mutex_t state_mutex;
    int state;

    pc_client_config_t config;
    void* ex_data;

    pc_transport_t* trans;

    pc_mutex_t handler_mutex;
    QUEUE ev_handlers;

    pc_mutex_t notify_mutex;
    unsigned int seq_num;
    pc_notify_t notifies[PC_PRE_ALLOC_NOTIFY_SLOT_COUNT];
    QUEUE notify_queue;

    pc_mutex_t req_mutex;
    unsigned int req_id_seq;
    pc_request_t requests[PC_PRE_ALLOC_REQUEST_SLOT_COUNT];
    QUEUE req_queue;

    pc_mutex_t event_mutex;
    pc_event_t pending_events[PC_PRE_ALLOC_EVENT_SLOT_COUNT];
    QUEUE pending_ev_queue;
    int is_in_poll;
};

void pc__trans_resp(pc_client_t* client, unsigned int req_id, int rc, const char* resp, int pending);
void pc__trans_sent(pc_client_t* client, unsigned int req_num, int rc, int pending);
void pc__trans_fire_event(pc_client_t* client, int ev_type, const char* arg1, const char* arg2, int pending);

#endif /* PC_POMELO_I_H */

