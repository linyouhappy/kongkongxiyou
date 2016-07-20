/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <assert.h>

#include "pc_trans_repo.h"

static pc_transport_plugin_t* pc__transport_plugin_repo[PC_TRANSPORT_PLUGIN_SLOT_COUNT];

int pc_transport_plugin_register(pc_transport_plugin_t* plugin)
{
    int trans_name;
    if (!plugin || plugin->transport_name >= PC_TRANSPORT_PLUGIN_SLOT_COUNT
        || plugin->transport_name < 0 || !plugin->transport_create || !plugin->transport_release)
        return PC_RC_INVALID_ARG;

    trans_name = plugin->transport_name;
    if (pc__transport_plugin_repo[trans_name])
        pc_transport_plugin_deregister(trans_name);

    pc__transport_plugin_repo[trans_name] = plugin;

    if (plugin->on_register)
        plugin->on_register(plugin);

    return PC_RC_OK;
}

int pc_transport_plugin_deregister(int trans_name)
{
    pc_transport_plugin_t* tp;
    if (trans_name >= PC_TRANSPORT_PLUGIN_SLOT_COUNT || trans_name < 0)
        return PC_RC_INVALID_ARG;

    tp = pc__transport_plugin_repo[trans_name];

    if (tp && tp->on_deregister)
        tp->on_deregister(tp);

    pc__transport_plugin_repo[trans_name] = NULL;

    return PC_RC_OK;
}

pc_transport_plugin_t* pc__get_transport_plugin(int trans_name)
{
    if (trans_name >= PC_TRANSPORT_PLUGIN_SLOT_COUNT || trans_name < 0)
        return NULL;

    return pc__transport_plugin_repo[trans_name];
}
