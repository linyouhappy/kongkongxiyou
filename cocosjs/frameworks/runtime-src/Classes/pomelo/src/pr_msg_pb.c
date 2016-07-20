/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <assert.h>
#include <string.h>

#include "pomelo.h"
#include "pc_lib.h"
#include "pc_JSON.h"

#include "pr_msg.h"
#include "pb.h"

#define PC_PB_EVAL_FACTOR 2

pc_buf_t pc_body_pb_encode(const pc_JSON* msg, const pc_JSON* gprotos, const pc_JSON* pb_def)
{
    pc_buf_t buf;
    pc_buf_t json_buf;
    size_t eval_size;
    size_t written;

    assert(msg && gprotos && pb_def);

    buf.base = NULL;
    buf.len = -1;

    json_buf.base = NULL;
    json_buf.len = -1;

    json_buf = pc_body_json_encode(msg);

    if (json_buf.len == -1) {
        pc_lib_log(PC_LOG_ERROR, "pc_body_pb_encode - dump json msg to buf error");
        buf.len = -1;
        return buf;
    }

    /* use double space of json_buf, it should be enough */
    eval_size = json_buf.len * PC_PB_EVAL_FACTOR;

    pc_lib_free(json_buf.base);
    json_buf.base = NULL;
    json_buf.len = -1;

    buf.base = (char *)pc_lib_malloc(eval_size);

    written = 0;
    if (!pc_pb_encode((uint8_t *)buf.base, eval_size, &written,
                      gprotos, pb_def, msg)) {
        pc_lib_free(buf.base);
        buf.base = NULL;
        buf.len = -1;
        pc_lib_log(PC_LOG_ERROR, "pc_body_pb_encode - failed to encode msg based on protobuf");

        return buf;
    }

    buf.len = written;

    return buf;
}

pc_JSON* pc_body_pb_decode(const char *data, size_t offset, size_t len,
                      const pc_JSON* gprotos, const pc_JSON* pb_def)
{
    pc_JSON *result = pc_JSON_CreateObject();
    if (!pc_pb_decode((const uint8_t *)(data + offset), len,
                      gprotos, pb_def, result)) {
        pc_JSON_Delete(result);
        result = NULL;
        pc_lib_log(PC_LOG_ERROR, "pc_body_pb_decode - failed to decode msg based on protobuf");
    }

    return result;
}
