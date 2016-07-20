/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PR_MSG_H
#define PR_MSG_H

#include <stdint.h>

#include "pr_pkg.h"
#include "pc_JSON.h"

typedef struct tr_uv_tcp_transport_s tr_uv_tcp_transport_t;

typedef struct {
    unsigned int id;
    const char* route;
    const char* msg;
} pc_msg_t;

uv_buf_t pr_default_msg_encoder(tr_uv_tcp_transport_t* tt, const pc_msg_t* msg);
pc_msg_t pr_default_msg_decoder(tr_uv_tcp_transport_t* tt, const uv_buf_t* buf);

/**
 * internal use
 */
typedef struct {
    char* base;
    int len;
} pc_buf_t;

pc_buf_t pc_default_msg_encode(const pc_JSON* route2code, const pc_JSON* client_protos, const pc_msg_t* msg);
pc_msg_t pc_default_msg_decode(const pc_JSON* code2route, const pc_JSON* server_protos, const pc_buf_t* buf);

pc_buf_t pc_body_json_encode(const pc_JSON* msg);
pc_JSON* pc_body_json_decode(const char *data, size_t offset, size_t len);

pc_buf_t pc_body_pb_encode(const pc_JSON*msg, const pc_JSON* gprotos, const pc_JSON* pb_def);
pc_JSON* pc_body_pb_decode(const char* data, size_t offset, size_t len,
                      const pc_JSON* gprotos, const pc_JSON* pb_def);

#endif

