/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

#ifndef TR_UV_TCP_AUX_H
#define TR_UV_TCP_AUX_H

#include "tr_uv_tcp_i.h"

void tcp__reset(tr_uv_tcp_transport_t* trans);
void tcp__reconn(tr_uv_tcp_transport_t* trans);

void tcp__conn_async_cb(uv_async_t* t);
void tcp__conn_timeout_cb(uv_timer_t* t);
void tcp__conn_done_cb(uv_connect_t* conn, int status);
void tcp__reconn_delay_timer_cb(uv_timer_t* t);

void tcp__write_async_cb(uv_async_t* a);
void tcp__write_done_cb(uv_write_t* w, int status);

void tcp__write_check_timeout_cb(uv_timer_t* timer);
int tcp__check_queue_timeout(QUEUE* ql, pc_client_t* client, int cont);

void tcp__cleanup_async_cb(uv_async_t* a);
void tcp__disconnect_async_cb(uv_async_t* a);

void tcp__heartbeat_timer_cb(uv_timer_t* t);
void tcp__heartbeat_timeout_cb(uv_timer_t* t);
void tcp__send_heartbeat(tr_uv_tcp_transport_t* tt);
void tcp__on_heartbeat(tr_uv_tcp_transport_t* tt);

void tcp__handshake_timer_cb(uv_timer_t* t);
void tcp__send_handshake(tr_uv_tcp_transport_t* tt);
void tcp__on_handshake_resp(tr_uv_tcp_transport_t* tt, const char* data, size_t len);
void tcp__send_handshake_ack(tr_uv_tcp_transport_t* tt);

void tcp__on_tcp_read_cb(uv_stream_t* stream, ssize_t nread, const uv_buf_t* buf);
void tcp__alloc_cb(uv_handle_t* handle, size_t suggested_size, uv_buf_t* buf);

void tcp__on_data_recieved(tr_uv_tcp_transport_t* tt, const char* data, size_t len);
void tcp__on_kick_recieved(tr_uv_tcp_transport_t* tt);

#endif /* TR_UV_TCP_AUX_H */
