LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_ARM_MODE := arm

MY_APPSRC_FILES := $(wildcard $(LOCAL_PATH)/../../Classes/pomelo/src/*.c) \
	$(wildcard $(LOCAL_PATH)/../../Classes/GameCore/*.cpp) \
	$(wildcard $(LOCAL_PATH)/../../Classes/jsb/*.cpp)

LOCAL_SRC_FILES := hellojavascript/main.cpp \
../../Classes/AppDelegate.cpp \
../../Classes/ide-support/SimpleConfigParser.cpp \
../../Classes/ide-support/RuntimeJsImpl.cpp \
../../Classes/uv/android/src/fs-poll.c \
../../Classes/uv/android/src/inet.c \
../../Classes/uv/android/src/threadpool.c \
../../Classes/uv/android/src/uv-common.c \
../../Classes/uv/android/src/version.c \
../../Classes/uv/android/src/unix/async.c \
../../Classes/uv/android/src/unix/core.c \
../../Classes/uv/android/src/unix/dl.c \
../../Classes/uv/android/src/unix/fs.c \
../../Classes/uv/android/src/unix/getaddrinfo.c \
../../Classes/uv/android/src/unix/getnameinfo.c \
../../Classes/uv/android/src/unix/loop.c \
../../Classes/uv/android/src/unix/loop-watcher.c \
../../Classes/uv/android/src/unix/pipe.c \
../../Classes/uv/android/src/unix/poll.c \
../../Classes/uv/android/src/unix/process.c \
../../Classes/uv/android/src/unix/signal.c \
../../Classes/uv/android/src/unix/stream.c \
../../Classes/uv/android/src/unix/tcp.c \
../../Classes/uv/android/src/unix/thread.c \
../../Classes/uv/android/src/unix/timer.c \
../../Classes/uv/android/src/unix/tty.c \
../../Classes/uv/android/src/unix/udp.c \
../../Classes/uv/android/src/unix/proctitle.c \
../../Classes/uv/android/src/unix/linux-core.c \
../../Classes/uv/android/src/unix/linux-inotify.c \
../../Classes/uv/android/src/unix/linux-syscalls.c \
../../Classes/uv/android/src/unix/pthread-fixes.c \
../../Classes/uv/android/src/unix/android-ifaddrs.c \
$(MY_APPSRC_FILES:$(LOCAL_PATH)/%=%)


LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../Classes \
$(LOCAL_PATH)/../../Classes/uv/android/include \
$(LOCAL_PATH)/../../Classes/uv/android/src \
$(LOCAL_PATH)/../../Classes/uv/android/src/unix \
$(LOCAL_PATH)/../../Classes/pomelo/include \
$(LOCAL_PATH)/../../Classes/pomelo/src \
$(LOCAL_PATH)/../../Classes/GameCore \
$(LOCAL_PATH)/../../Classes/jsb

LOCAL_STATIC_LIBRARIES := cocos2d_js_static
LOCAL_STATIC_LIBRARIES += cocos2d_simulator_static

include $(BUILD_SHARED_LIBRARY)


$(call import-module,scripting/js-bindings/proj.android)
$(call import-module,tools/simulator/libsimulator/proj.android)
