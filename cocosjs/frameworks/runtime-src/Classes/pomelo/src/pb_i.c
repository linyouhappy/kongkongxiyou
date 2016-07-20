/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#include "pb.h"

#define PB_uInt32 1
#define PB_int32  2
#define PB_sInt32 3
#define PB_float 4
#define PB_double 5
#define PB_string 6

int pb_get_type(const char *type) {
    if (strcmp(type, "uInt32") == 0)
        return PB_uInt32;
    if (strcmp(type, "int32") == 0)
        return PB_int32;
    if (strcmp(type, "sInt32") == 0)
        return PB_sInt32;
    if (strcmp(type, "float") == 0)
        return PB_float;
    if (strcmp(type, "double") == 0)
        return PB_double;
    if (strcmp(type, "string") == 0)
        return PB_string;
    /* if (strcmp(type, "uInt64") == 0)
     *   return 5;
     * if (strcmp(type, "sInt64") == 0)
     *   return 5;
     */
    return 0;
}

int pb_get_constant_type(const char *type) {
    if (strcmp(type, "uInt32") == 0 || strcmp(type, "sInt32") == 0
            || strcmp(type, "int32") == 0) {
        return 0;
    }
    if (strcmp(type, "double") == 0) {
        return 1;
    }
    if (strcmp(type, "string") == 0) {
        return 2;
    }
    if (strcmp(type, "float") == 0) {
        return 5;
    }
    return 2;
}
