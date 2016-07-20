/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PC_LIB_H
#define PC_LIB_H

#include <stddef.h>

#if defined(_WIN32) && !defined(__cplusplus)
#define PC_INLINE __inline
#else
#define PC_INLINE inline
#endif

extern void (*pc_lib_log)(int level, const char* msg, ...);
extern void* (*pc_lib_malloc)(size_t len);
extern void (*pc_lib_free)(void* data);
extern const char* pc_lib_platform_type;

const char* pc_lib_strdup(const char* str);

#endif
