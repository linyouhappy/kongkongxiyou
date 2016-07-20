/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#include "pb.h"

typedef struct _pb_istream_t pb_istream_t;

/* Lightweight input stream.
 * You can provide a callback function for reading or use
 * pb_istream_from_buffer.
 *
 * Rules for callback:
 * 1) Return 0 on IO errors. This will cause decoding to abort.
 *
 * 2) You can use state to store your own data (e.g. buffer pointer),
 * and rely on pb_read to verify that no-body reads past bytes_left.
 *
 * 3) Your callback may be used with substreams, in which case bytes_left
 * is different than from the main stream. Don't use bytes_left to compute
 * any pointers.
 */
struct _pb_istream_t {
    int (*callback)(pb_istream_t* stream, uint8_t* buf, size_t count);
    void* state; /* Free field for use by callback implementation */
    size_t bytes_left;
};

static int pb_decode(pb_istream_t* stream, const pc_JSON* gprotos, const pc_JSON*protos, pc_JSON* result);

static pb_istream_t pb_istream_from_buffer(uint8_t* buf, size_t bufsize);
static int pb_read(pb_istream_t* stream, uint8_t* buf, size_t count);


/* --- Helper functions ---
 * You may want to use these from your caller or callbacks.
 */
static int pb_decode_proto(pb_istream_t *stream, const pc_JSON* gprotos, const pc_JSON* proto, const pc_JSON* protos, const char *key, pc_JSON* result);

static int pb_decode_array(pb_istream_t *stream, const pc_JSON* gprotos, const pc_JSON* proto, const pc_JSON* protos, const char *key, pc_JSON* result);

/* Decode the tag for the next field in the stream. Gives the wire type and
 * field tag. At end of the message, returns 0 and sets eof to 1. */
static int pb_decode_tag(pb_istream_t *stream, int *wire_type, uint32_t *tag, int *eof);

/* Decode an integer in the varint format. This works for int, enum, int32,
 * int64, uint32 and uint64 field types. */
static int pb_decode_varint(pb_istream_t *stream, uint64_t *dest);

static int pb_decode_varint32(pb_istream_t *stream, uint32_t *dest);

/* Decode an integer in the zig-zagged svarint format. This works for sint32
 * and sint64. */
static int pb_decode_svarint(pb_istream_t *stream, int64_t *dest);

/* Decode a fixed32, sfixed32 or float value. You need to pass a pointer to
 * a 4-byte wide C variable. */
static int pb_decode_fixed32(pb_istream_t *stream, void *dest);

/* Decode a fixed64, sfixed64 or double value. You need to pass a pointer to
 * a 8-byte wide C variable. */
static int pb_decode_fixed64(pb_istream_t *stream, void *dest);

/* Make a limited-length substream for reading a PB_string field. */
static int pb_make_string_substream(pb_istream_t *stream, pb_istream_t *substream);
static void pb_close_string_substream(pb_istream_t *stream, pb_istream_t *substream);

/* Decode a string */
static int  pb_decode_strlen(pb_istream_t *stream, uint32_t *size);
static int pb_decode_string(pb_istream_t *stream, void *dest, uint32_t size);

/* Decode submessage in __messages protos */
static int pb_decode_submessage(pb_istream_t *stream, const pc_JSON* gprotos, const pc_JSON* protos, void *dest);

int pc_pb_decode(const uint8_t *buf, size_t len, const pc_JSON* gprotos, const pc_JSON* protos,
        pc_JSON* result) {
    /* TODO: */
    pb_istream_t stream = pb_istream_from_buffer((uint8_t*)buf, len);
    if (!pb_decode(&stream, gprotos, protos, result)) {
        return 0;
    }
    return 1;
}

/**************
 * pb_istream *
 **************/

static int  buf_read(pb_istream_t *stream, uint8_t *buf,
        size_t count) {
    uint8_t *source = (uint8_t *) stream->state;

    if (buf != NULL )
        memcpy(buf, source, count);

    stream->state = source + count;
    return 1;
}

static int  pb_read(pb_istream_t *stream, uint8_t *buf, size_t count) {
    if (buf == NULL && stream->callback != buf_read) {
        /* Skip input bytes */
        uint8_t tmp[16];
        while (count > 16) {
            if (!pb_read(stream, tmp, 16))
                return 0;

            count -= 16;
        }

        return pb_read(stream, tmp, count);
    }

    if (stream->bytes_left < count)
        return 0;

    if (!stream->callback(stream, buf, count))
        return 0;

    stream->bytes_left -= count;
    return 1;
}

static pb_istream_t pb_istream_from_buffer(uint8_t *buf, size_t bufsize) {
    pb_istream_t stream;
    stream.callback = &buf_read;
    stream.state = buf;
    stream.bytes_left = bufsize;
    return stream;
}

/*************************
 * Decode a single field *
 *************************/

static int pb_decode_proto(pb_istream_t *stream, const pc_JSON* gprotos, const pc_JSON* proto,
        const pc_JSON *protos, const char *key, pc_JSON* result) {
    pc_JSON *type, *_messages, *sub_msg, *sub_value;
    const char *type_text;

    uint64_t int_value;
    int64_t sint_value;
    float float_value;
    double double_value;
    uint32_t str_len;
    char *str_value;

#ifdef PB_DEBUG
    char* debug_log = NULL;
#endif

    type = pc_JSON_GetObjectItem(proto, "type");
    type_text = type->valuestring;

#ifdef PB_DEBUG
    debug_log = pc_JSON_Print(result);
    /* FIXME: memory leak */
    fprintf(stderr, "result %s\n", debug_log);
    /* jsonp_free(debug_log); */
    debug_log = NULL;
#endif

    _messages = pc_JSON_GetObjectItem(protos, "__messages");
    switch (pb_get_type(type_text)) {
        case PB_uInt32:
            if (!pb_decode_varint(stream, &int_value)) {
                return 0;
            }
            if (result->type == pc_JSON_Object) {
                pc_JSON_AddNumberToObject(result, key, int_value);
            } else {
                pc_JSON_AddItemToArray(result, pc_JSON_CreateNumber(int_value));
            }
            break;
        case PB_int32:
        case PB_sInt32:
            if (!pb_decode_svarint(stream, &sint_value)) {
                return 0;
            }
            if (result->type == pc_JSON_Object) {
                pc_JSON_AddNumberToObject(result, key, sint_value);
            } else {
                pc_JSON_AddItemToArray(result, pc_JSON_CreateNumber(sint_value));
            }
            break;
        case PB_float:
            if (!pb_decode_fixed32(stream, &float_value)) {
                return 0;
            }
            if (result->type == pc_JSON_Object) {
                pc_JSON_AddNumberToObject(result, key, float_value);
            } else {
                pc_JSON_AddItemToArray(result, pc_JSON_CreateNumber(float_value));
            }
            break;
        case PB_double:
            if (!pb_decode_fixed64(stream, &double_value)) {
                return 0;
            }
            if (result->type == pc_JSON_Object) {
                pc_JSON_AddNumberToObject(result, key, double_value);
            } else {
                pc_JSON_AddItemToArray(result, pc_JSON_CreateNumber(double_value));
            }
            break;
        case PB_string:
            if (!pb_decode_strlen(stream, &str_len)) {
                return 0;
            }
            str_value = (char *)malloc(str_len + 1);
            if (str_value == NULL) {
                free(str_value);
                return 0;
            }
            if (!pb_decode_string(stream, str_value, str_len)) {
                free(str_value);
                return 0;
            }
            if (result->type == pc_JSON_Object) {
                pc_JSON_AddStringToObject(result, key, str_value);
            } else {
                pc_JSON_AddItemToArray(result, pc_JSON_CreateString(str_value));
            }
            free(str_value);
            break;
        default:
            if (_messages) {
                sub_msg = pc_JSON_GetObjectItem(_messages, type_text);
                if (!sub_msg) {
                    const char *head = "message ";
                    size_t len = strlen(head) + strlen(type_text) + 1;
                    char *head_text = (char *)malloc(len);
                    memset(head_text, 0, len);
                    strcpy(head_text, head);
                    strcat(head_text, type_text);
                    /* check root msg in gprotos */
                    sub_msg = pc_JSON_GetObjectItem(gprotos, head_text);
                    free(head_text);
                }

                if (sub_msg) {
                    if (!key) {
                        if (!pb_decode_submessage(stream, gprotos, sub_msg, result)) {
                            return 0;
                        }
                    } else {
                        sub_value = pc_JSON_CreateObject();
                        if (!pb_decode_submessage(stream, gprotos, sub_msg, sub_value)) {
                            return 0;
                        }
                        pc_JSON_AddItemToObject(result, key, sub_value);
                    }
                } else {
                    return 0;
                }
            }

    }
    return 1;
}

static int  pb_decode_array(pb_istream_t *stream, const pc_JSON *gprotos, const pc_JSON *proto, const pc_JSON *protos,
        const char *key, pc_JSON *result) {
    pc_JSON *type, *array, *value;
    const char *type_text;
    uint32_t size;
    uint32_t i;
    int need_free = 0;

#ifdef PB_DEBUG
    char* debug_log = NULL;
#endif

    type = pc_JSON_GetObjectItem(proto, "type");
    type_text = type->valuestring;
    if (!result) {
        return 0;
    }
    array = pc_JSON_GetObjectItem(result, key);

    if (!array) {
        array = pc_JSON_CreateArray();
        need_free = 1;
    }

    if (pb_get_type(type_text) && pb_get_type(type_text) != PB_string) {
        if (!pb_decode_varint32(stream, &size)) {
            if (need_free)
                pc_JSON_Delete(array);
            return 0;
        }
        for (i = 0; i < size; i++) {
            if (!pb_decode_proto(stream, gprotos, proto, protos, key, array)) {
                if (need_free)
                    pc_JSON_Delete(array);
                return 0;
            }
        }
    } else if (pb_get_type(type_text) && pb_get_type(type_text) == PB_string) {
        if (!pb_decode_proto(stream, gprotos, proto, protos, key, array)) {
            if (need_free)
                pc_JSON_Delete(array);
            return 0;
        }
    } else {
        value = pc_JSON_CreateObject();
        if (!pb_decode_proto(stream, gprotos, proto, protos, NULL, value)) {
            pc_JSON_Delete(value);
            if (need_free)
                pc_JSON_Delete(array);
            return 0;
        }
        pc_JSON_AddItemToArray(array, value);
    }

#ifdef PB_DEBUG
    debug_log = pc_JSON_Print(array);
    fprintf(stderr, "array %s\n", debug_log);
    /* FIXME: mem leak */
    /* jsonp_free(debug_log); */
    debug_log = NULL;
#endif

    if (need_free)
        pc_JSON_AddItemToObject(result, key, array);

    return 1;
}

/*********************
 * Decode all fields *
 *********************/

static int  pb_decode(pb_istream_t *stream, const pc_JSON *gprotos,
        const pc_JSON *protos, pc_JSON *result) {
    while (stream->bytes_left) {
        uint32_t tag;
        int wire_type;
        int eof;
        pc_JSON *tags, *_tag, *option, *proto;
        const char *name;
        const char *option_text;
        char buffer[64];
        if (!pb_decode_tag(stream, &wire_type, &tag, &eof)) {
            if (eof)
                break;
            else
                return 0;
        }

        memset(&buffer, 0, 64);
        tags = pc_JSON_GetObjectItem(protos, "__tags");
        if (!tags)
            return 0;

        sprintf(buffer, "%u", tag);
        _tag = pc_JSON_GetObjectItem(tags, buffer);
        if (!_tag)
            return 0;
        name = _tag->valuestring;
        proto = pc_JSON_GetObjectItem(protos, name);
        if (!proto)
            return 0;
        option = pc_JSON_GetObjectItem(proto, "option");
        option_text = option->valuestring;
        if (strcmp(option_text, "optional") == 0
                || strcmp(option_text, "required") == 0) {
            if (!pb_decode_proto(stream, gprotos, proto, protos, name, result))
                return 0;
        } else if (strcmp(option_text, "repeated") == 0) {
            if (!pb_decode_array(stream, gprotos, proto, protos, name, result))
                return 0;
        }
    }

    return 1;
}

/* Field decoders */

/********************
 * Helper functions *
 ********************/

static int  pb_decode_varint32(pb_istream_t *stream, uint32_t *dest) {
    uint64_t temp;
    int status = pb_decode_varint(stream, &temp);
    if (status) {
        *dest = (uint32_t) temp;
    } else {
        *dest = -1;
    }
    return status;
}

/* Decode an integer in the varint format. This works for bool, enum, int32,
 * int64, uint32 and uint64 field types. */
int  pb_decode_varint(pb_istream_t *stream, uint64_t *dest) {
    uint8_t byte;
    int bitpos = 0;
    *dest = 0;

    while (bitpos < 64 && pb_read(stream, &byte, 1)) {
        *dest |= (uint64_t)(byte & 0x7F) << bitpos;
        bitpos += 7;

        if (!(byte & 0x80))
            return 1;
    }

    return 0;
}

/* Decode an integer in the zig-zagged svarint format. This works for sint32
 * and sint64. */
static int pb_decode_svarint(pb_istream_t *stream, int64_t *dest) {
    uint64_t value;
    if (!pb_decode_varint(stream, &value))
        return 0;

    if (value & 1)
        *dest = (int64_t) (~(value >> 1));
    else
        *dest = (int64_t) (value >> 1);

    return 1;
}

/* Decode a fixed32, sfixed32 or float value. You need to pass a pointer to
 * a 4-byte wide C variable. */
static int pb_decode_fixed32(pb_istream_t *stream, void *dest) {
#ifdef __BIG_ENDIAN__
    uint8_t *bytes = (uint8_t *)dest;
    uint8_t lebytes[4];

    if (!pb_read(stream, lebytes, 4))
        return 0;

    bytes[0] = lebytes[3];
    bytes[1] = lebytes[2];
    bytes[2] = lebytes[1];
    bytes[3] = lebytes[0];
    return 1;
#else
    return pb_read(stream, (uint8_t *) dest, 4);
#endif
}

/* Decode a fixed64, sfixed64 or double value. You need to pass a pointer to
 * a 8-byte wide C variable. */
static int pb_decode_fixed64(pb_istream_t *stream, void *dest) {
#ifdef __BIG_ENDIAN__
    uint8_t *bytes = (uint8_t *)dest;
    uint8_t lebytes[8];

    if (!pb_read(stream, lebytes, 8))
        return 0;

    bytes[0] = lebytes[7];
    bytes[1] = lebytes[6];
    bytes[2] = lebytes[5];
    bytes[3] = lebytes[4];
    bytes[4] = lebytes[3];
    bytes[5] = lebytes[2];
    bytes[6] = lebytes[1];
    bytes[7] = lebytes[0];
    return 1;
#else
    return pb_read(stream, (uint8_t *) dest, 8);
#endif
}

static int  pb_decode_strlen(pb_istream_t *stream, uint32_t *size) {
    return pb_decode_varint32(stream, size);
}

/* Decode a string */
static int  pb_decode_string(pb_istream_t *stream,
        void *dest, uint32_t size) {
    int status;

    status = pb_read(stream, (uint8_t *) dest, size);
    *((uint8_t *) dest + size) = 0;
    return status;
}

/* Decode the tag for the next field in the stream. Gives the wire type and
 * field tag. At end of the message, returns 0 and sets eof to 1. */
static int  pb_decode_tag(pb_istream_t *stream, int *wire_type,
        uint32_t *tag, int *eof) {
    uint32_t temp;
    *eof = 0;
    *wire_type = 0;
    *tag = 0;

    if (!pb_decode_varint32(stream, &temp)) {
        if (stream->bytes_left == 0)
            *eof = 1;

        return 0;
    }

    if (temp == 0) {
        *eof = 1; /* Special feature: allow 0-terminated messages. */
        return 0;
    }

    *tag = temp >> 3;
    *wire_type = (temp & 7);
    return 1;
}

/* Decode string length from stream and return a substream with limited length.
 * Remember to close the substream using pb_close_string_substream().
 */
static int  pb_make_string_substream(pb_istream_t *stream,
        pb_istream_t *substream) {
    uint32_t size;
    if (!pb_decode_varint32(stream, &size)) {
        return 0;
    }

    *substream = *stream;
    if (substream->bytes_left < size)
        return 0;

    substream->bytes_left = size;
    stream->bytes_left -= size;
    return 1;
}

static void pb_close_string_substream(pb_istream_t *stream, pb_istream_t *substream) {
    stream->state = substream->state;
}

/* Decode submessage in __messages protos */
static int pb_decode_submessage(pb_istream_t *stream, const pc_JSON *gprotos, const pc_JSON *protos,
        void *dest) {
    int status;
    pb_istream_t substream;

    if (!pb_make_string_substream(stream, &substream)) {
        return 0;
    }
    /* New array entries need to be initialized, while required and optional
     * submessages have already been initialized in the top-level pb_decode. */
    status = pb_decode(&substream, gprotos, protos, (pc_JSON *)dest);

    pb_close_string_substream(stream, &substream);
    return status;
}
