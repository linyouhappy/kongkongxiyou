/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PC_PB_H_
#define PC_PB_H_

#include <stdint.h>
#include <stddef.h>

#include "pc_JSON.h"

#define PB_uInt32 1
#define PB_int32  2
#define PB_sInt32 3
#define PB_float 4
#define PB_double 5
#define PB_string 6


int pc_pb_encode(uint8_t *buf, size_t len, size_t *written,
        const pc_JSON* gprotos, const pc_JSON* protos, const pc_JSON* msg);

int pc_pb_decode(const uint8_t *buf, size_t len, const pc_JSON* gprotos,
        const pc_JSON* protos, pc_JSON* result);


int pb_get_type(const char *type);
int pb_get_constant_type(const char *type);

#endif
