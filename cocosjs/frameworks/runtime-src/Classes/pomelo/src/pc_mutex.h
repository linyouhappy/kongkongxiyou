/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef PC_MUTEX_H
#define PC_MUTEX_H

#include <assert.h>

/*
 * pc_mutex_t is recursive
 */
#ifdef _WIN32

#include <windows.h>

typedef CRITICAL_SECTION pc_mutex_t;

static __inline void pc_mutex_init(pc_mutex_t* mutex)
{
    InitializeCriticalSection(mutex);
}

static __inline void pc_mutex_lock(pc_mutex_t* mutex)
{
    EnterCriticalSection(mutex);
}

static __inline void pc_mutex_unlock(pc_mutex_t* mutex)
{
    LeaveCriticalSection(mutex);
}

static __inline void pc_mutex_destroy(pc_mutex_t* mutex)
{
    DeleteCriticalSection(mutex);
}

#else

#include <pthread.h>
#include <unistd.h>
#include <stdlib.h>

typedef pthread_mutex_t pc_mutex_t;

static inline void pc_mutex_init(pc_mutex_t* mutex)
{
    pthread_mutexattr_t attr;
    int ret;
    pthread_mutexattr_init(&attr);

#ifdef __linux__
    pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE_NP);
#else
    pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE);
#endif

    ret = pthread_mutex_init(mutex, &attr);
    assert(!ret);
}

static inline void pc_mutex_lock(pc_mutex_t* mutex)
{
    int ret;
    ret = pthread_mutex_lock(mutex);
    assert(!ret);
}

static inline void pc_mutex_unlock(pc_mutex_t* mutex)
{
    int ret;
    ret = pthread_mutex_unlock(mutex);
    assert(!ret);
}

static inline void pc_mutex_destroy(pc_mutex_t* mutex)
{
    int ret;
    ret = pthread_mutex_destroy(mutex);
    assert(!ret);
}

#endif

#endif /* PC_MUTEX_H */

