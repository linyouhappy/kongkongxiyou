/**
 * Copyright (c) 2014 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PC_POMELO_TRANS_H
#define PC_POMELO_TRANS_H

#include "pomelo.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct pc_transport_s pc_transport_t;
typedef struct pc_transport_plugin_s pc_transport_plugin_t;

/**
 * special request id
 */
#define PC_NOTIFY_PUSH_REQ_ID ((unsigned int)0)
#define PC_INVALID_REQ_ID ((unsigned int)-1)

struct pc_transport_s {
    int (*init)(pc_transport_t* trans, pc_client_t* client);
    int (*connect)(pc_transport_t* trans, const char* host, int port, const char* handshake_opt);

    /**
     * req_id == PC_NOTIFY_PUSH_REQ_ID indicates that it is a notify message,
     * otherwise it is a request message
     */
    int (*send)(pc_transport_t* trans, const char* route, unsigned int seq_num,
            const char* msg, unsigned int req_id, int timeout);

    int (*disconnect)(pc_transport_t* trans);
    int (*cleanup)(pc_transport_t* trans);

    void* (*internal_data)(pc_transport_t* trans); /* optional */
    int (*quality)(pc_transport_t* trans); /* optional */
    pc_transport_plugin_t* (*plugin)(pc_transport_t* trans);
};

struct pc_transport_plugin_s {
    pc_transport_t* (*transport_create)(pc_transport_plugin_t* plugin);
    void (*transport_release)(pc_transport_plugin_t* plugin, pc_transport_t* trans);

    void (*on_register)(pc_transport_plugin_t* plugin); /* optional */
    void (*on_deregister)(pc_transport_plugin_t* plugin); /* optional */

    int transport_name;
};

PC_EXPORT int pc_transport_plugin_register(pc_transport_plugin_t* plugin);
PC_EXPORT int pc_transport_plugin_deregister(int trans_name);

/**
 * when net work event occures, transport impl should invoke this function.
 */
PC_EXPORT void pc_trans_fire_event(pc_client_t* client, int ev_type, const char* arg1, const char* arg2);

/**
 * when a notify is sent or timeout, transport impl should invoke this function.
 */
PC_EXPORT void pc_trans_sent(pc_client_t* client, unsigned int seq_num, int rc);

/**
 * when a request gets a resp or timeout, transport impl should invoke this function.
 */
PC_EXPORT void pc_trans_resp(pc_client_t* client, unsigned int req_id, int rc, const char* resp);


#ifdef __cplusplus
}
#endif

#endif /* PC_POMELO_TRANS_H */
