/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <string.h>
#include <assert.h>

#include "pc_lib.h"
#include "pomelo.h"

#include "pr_pkg.h"

#define pc__pkg_type(head) (head[0] & 0xff)
#define MIN(a, b) ( (a) > (b) ? (b) : (a))

#define PC_HANDSHAKE_OK 200

static size_t pc__parse_pkg_head(pc_pkg_parser_t *parser,
        const char *data, size_t offset, size_t nread);

static size_t pc__parse_pkg_body(pc_pkg_parser_t *parser,
        const char *data, size_t offset, size_t nread);


void pc_pkg_parser_init(pc_pkg_parser_t *parser, pc_on_pkg_handler_t handler, void* ex_data)
{
    parser->head_size = PC_PKG_HEAD_BYTES;
    parser->handler = handler;
    parser->ex_data = ex_data;
    parser->head_offset = 0;
    parser->pkg_offset = 0;
    parser->pkg_size = 0;
    parser->state = PC_PKG_HEAD;
}

void pc_pkg_parser_reset(pc_pkg_parser_t *parser)
{
    pc_lib_free(parser->pkg_buf);
    parser->head_offset = 0;
    parser->pkg_buf = NULL;
    parser->pkg_offset = 0;
    parser->pkg_size = 0;
    parser->state = PC_PKG_HEAD;
};

void pc_pkg_parser_feed(pc_pkg_parser_t *parser, const char *data, size_t nread)
{
    size_t offset = 0;
    assert(parser->state == PC_PKG_HEAD || parser->state == PC_PKG_BODY);

    while(offset < nread) {
        if(parser->state == PC_PKG_HEAD)
            offset = pc__parse_pkg_head(parser, data, offset, nread);

        if(parser->state == PC_PKG_BODY)
            offset = pc__parse_pkg_body(parser, data, offset, nread);
    }
}

static size_t pc__parse_pkg_head(pc_pkg_parser_t *parser, const char *data, size_t offset, size_t nread)
{
    size_t need_len = parser->head_size - parser->head_offset;
    size_t data_len = nread - offset;
    size_t len = MIN(need_len, data_len);

    memcpy(parser->head_buf + parser->head_offset, data + offset, len);
    parser->head_offset += len;

    /* a complete head got */
    if (parser->head_offset == parser->head_size) {
        size_t pkg_len = 0;
        int i;
        /* skip the first byte which is the type */
        for (i = 1; i < PC_PKG_HEAD_BYTES; ++i) {
            pkg_len <<= 8;
            pkg_len += parser->head_buf[i] & 0xff;
        }

        if (pkg_len > 0) {
            parser->pkg_buf = (char *)pc_lib_malloc(pkg_len);
            memset(parser->pkg_buf, 0, pkg_len);
        }

        parser->pkg_offset = 0;
        parser->pkg_size = pkg_len;
        parser->state = PC_PKG_BODY;
    }
    return offset + len;
}

static size_t pc__parse_pkg_body(pc_pkg_parser_t *parser, const char *data, size_t offset, size_t nread)
{
    size_t need_len = parser->pkg_size - parser->pkg_offset;
    size_t data_len = nread - offset;
    size_t len = MIN(need_len, data_len);

    memcpy(parser->pkg_buf + parser->pkg_offset, data + offset, len);
    parser->pkg_offset += len;

    if(parser->pkg_offset == parser->pkg_size) {
        /* a complete package parsed */
        parser->handler((pc_pkg_type)pc__pkg_type(parser->head_buf),
                parser->pkg_buf, parser->pkg_size, parser->ex_data);
        pc_pkg_parser_reset(parser);
    }

    return offset + len;
}

uv_buf_t pc_pkg_encode(pc_pkg_type type, const char *data, size_t len)
{
    uv_buf_t buf;
    size_t sz;
    char* base;

    if (len > PC_PKG_MAX_BODY_BYTES - 1) {
        buf.len = -1;
        buf.base = NULL;
        return buf;
    }

    sz = PC_PKG_HEAD_BYTES + len;
    buf.base = (char *)pc_lib_malloc(sz);
    buf.len = sz;

    memset(buf.base, 0, sz);

    buf.base[0] = type & PC_PKG_TYPE_MASK;
    base = buf.base + (PC_PKG_HEAD_BYTES - 1);

    if (len) {
        size_t body_size = len;
        int i;
        for (i = 0; i < PC_PKG_BODY_LEN_BYTES; i++, base--) {
            *base = body_size & 0xff;
            body_size >>= 8;
        }

        memcpy(buf.base + PC_PKG_HEAD_BYTES, data, len);
    }

    return buf;
}

