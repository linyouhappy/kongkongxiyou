/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PR_PKG_H
#define PR_PKG_H

#include <stddef.h>
#include <stdint.h>

#include "uv.h"

/**
 * Pomelo package format:
 * +------+-------------+------------------+
 * | type | body length |       body       |
 * +------+-------------+------------------+
 *
 * Head: 4bytes
 *   0: package type, see as pc_pkg_type
 *   1 - 3: big-endian body length
 * Body: body length bytes
 */

#define PC_PKG_TYPE_MASK 0xff
#define PC_PKG_TYPE_BYTES 1
#define PC_PKG_BODY_LEN_BYTES 3
#define PC_PKG_HEAD_BYTES (PC_PKG_TYPE_BYTES + PC_PKG_BODY_LEN_BYTES)
#define PC_PKG_MAX_BODY_BYTES (1 << 24)

/**
 * pkg type of pomelo
 */
typedef enum {
  PC_PKG_HANDSHAKE = 1,
  PC_PKG_HANDSHAKE_ACK,
  PC_PKG_HEARBEAT,
  PC_PKG_DATA,
  PC_PKG_KICK
} pc_pkg_type;

/**
 * State of Pomelo package parser
 */
typedef enum {
    PC_PKG_HEAD = 1,        /* parsing header */
    PC_PKG_BODY,            /* parsing body */
} pc_pkg_parser_state;

typedef void (*pc_on_pkg_handler_t)(pc_pkg_type type, const char* data, size_t len, void* ex_data);

/**
 * package handler for pkg parser
 */
/**
 * Structure for Pomelo package parser which provided the service to collect
 * the raw data from lower layer (such as tcp) and parse them into Pomleo
 * package.
 */
typedef struct {
    char head_buf[PC_PKG_HEAD_BYTES];
    size_t head_offset;
    size_t head_size;

    char *pkg_buf;
    size_t pkg_offset;
    size_t pkg_size;

    pc_on_pkg_handler_t handler;
    void* ex_data;

    pc_pkg_parser_state state;
} pc_pkg_parser_t;

void pc_pkg_parser_init(pc_pkg_parser_t *parser, pc_on_pkg_handler_t handler, void* ex_data);
void pc_pkg_parser_reset(pc_pkg_parser_t *parser);
void pc_pkg_parser_feed(pc_pkg_parser_t* parser, const char* data, size_t len);

uv_buf_t pc_pkg_encode(pc_pkg_type type, const char *data, size_t len);

#endif
