#CURRENT_DIR=`dirname $0`
#cd $CURRENT_DIR/lordofpomelo/game-server

#pomelo start -e production

#pomelo start

#source $CURRENT_DIR/lordofpomelo/startserver.sh

CURRENT_DIR=`dirname $0`
cd $CURRENT_DIR/lordofpomelo/game-server

POMELO_PATH=$CURRENT_DIR/lordofpomelo/pomelo/bin/pomelo
#pomelo start -e production

$POMELO_PATH start -e production