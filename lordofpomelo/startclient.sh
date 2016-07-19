#!/bin/sh
# CURRENT_DIR=`dirname $0`

#kill -9 `ps -ef|grep node | awk '{print $2}'`


CUR_SCRIPT_PATH=$(pwd)

WEB_SERVER=$CUR_SCRIPT_PATH/web-server
cd $WEB_SERVER
nohup node app &

#GAME_SERVER=$CUR_SCRIPT_PATH/game-server
#cd $GAME_SERVER
#
#POMELO_PATH=$GAME_SERVER/node_modules/pomelo/bin/pomelo
##pomelo start -e production
#
#if [ $1 = "daemon" ] ; then
#    $POMELO_PATH start -D
#else
#    $POMELO_PATH start
#fi




