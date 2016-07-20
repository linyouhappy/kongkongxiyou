/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <assert.h>

#include "pr_msg.h"
#include "tr_uv_tcp.h"
#include "tr_uv_tcp_i.h"

static tr_uv_tcp_transport_plugin_t instance =
{
    {
        tr_uv_tcp_create,
        tr_uv_tcp_release,
        tr_uv_tcp_plugin_on_register,
        tr_uv_tcp_plugin_on_deregister,
        PC_TR_NAME_UV_TCP
    },
    pr_default_msg_encoder, /* pr_msg_encoder */
    pr_default_msg_decoder  /* pr_msg_decoder */
};

pc_transport_plugin_t* pc_tr_uv_tcp_trans_plugin()
{
    return (pc_transport_plugin_t* )&instance;
}

