/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <assert.h>
#include <string.h>

#include "pc_JSON.h"
#include "pomelo.h"
#include "pc_lib.h"

#include "pr_msg.h"

pc_buf_t pc_body_json_encode(const pc_JSON* msg)
{
    pc_buf_t buf;
    char* res;

    buf.base = NULL;
    buf.len = -1;

    assert(msg);

    res = pc_JSON_PrintUnformatted(msg);
    if (!res) {
        pc_lib_log(PC_LOG_ERROR, "pc_body_json_encode - json encode error");
    } else {
        buf.base = res;
        buf.len = strlen(res);
    }
    return buf;
}

pc_JSON* pc_body_json_decode(const char *data, size_t offset, size_t len)
{
    const char* end = NULL;
    pc_JSON* res = pc_JSON_ParseWithOpts(data + offset, &end, 0);

    if (!res || end != data + len) {
        pc_JSON_Delete(res);
        res = NULL;
        pc_lib_log(PC_LOG_ERROR, "pc_body_json_decode - json decode error");
    }

    return res;
}
