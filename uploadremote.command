CURRENT_DIR=`dirname $0`

SOURCE_DIR=$CURRENT_DIR/lordofpomelo

TMP_DIR=$CURRENT_DIR/publicResource/remote_tmp
TARGET_ZIP=$CURRENT_DIR/publicResource/remote.zip
rm -rf $TMP_DIR
mkdir $TMP_DIR

GAME_SERVER=$TMP_DIR/game-server
mkdir $GAME_SERVER

cp -R $SOURCE_DIR/game-server/app $GAME_SERVER
cp -R $SOURCE_DIR/game-server/config $GAME_SERVER
cp -R $SOURCE_DIR/game-server/node_modules $GAME_SERVER
cp -R $SOURCE_DIR/game-server/scripts $GAME_SERVER
cp $SOURCE_DIR/game-server/app.js $GAME_SERVER
cp $SOURCE_DIR/game-server/package.json $GAME_SERVER

WEB_SERVER=$TMP_DIR/web-server
mkdir $WEB_SERVER

cp -R $SOURCE_DIR/web-server/config $WEB_SERVER
cp -R $SOURCE_DIR/web-server/lib $WEB_SERVER
cp -R $SOURCE_DIR/web-server/node_modules $WEB_SERVER
cp -R $SOURCE_DIR/web-server/views $WEB_SERVER
cp -R $SOURCE_DIR/web-server/public $WEB_SERVER
cp $SOURCE_DIR/web-server/app.js $WEB_SERVER
cp $SOURCE_DIR/web-server/package.json $WEB_SERVER

cp -R $SOURCE_DIR/shared $TMP_DIR
cp $SOURCE_DIR/create_database.sh $TMP_DIR
cp $SOURCE_DIR/startserver.sh $TMP_DIR
cp $SOURCE_DIR/kill_node_app.sh $TMP_DIR
cp $SOURCE_DIR/startclient.sh $TMP_DIR
cp $SOURCE_DIR/removelog.sh $TMP_DIR

REMOTE_SSH=pomelo1


cd $TMP_DIR
zip -r $TARGET_ZIP ./*

scp $TARGET_ZIP $REMOTE_SSH:/root

rm -rf $TMP_DIR
rm -rf $TARGET_ZIP


#read -p "need stop remote server?(y/n)n:" REMOTE_MASK
#
#if ["$REMOTE_MASK" ]; then
#if [ $REMOTE_MASK = "y" ] ; then
#    ssh $REMOTE_SSH "kill -9 `ps -ef|grep node | awk '{print $2}'`"
#fi
#fi


#read -p "need delete /root/lordofpomelo?(y/n)n:" REMOTE_MASK
#if ["$REMOTE_MASK" ]; then
#if [ $REMOTE_MASK = "y" ] ; then
#    ssh $REMOTE_SSH "rm -rf /root/lordofpomelo;"
#fi
#ssh pomelo1 "unzip -d /root/lordofpomelo /root/remote.zip;rm -rf /root/remote.zip"
#
#else
ssh pomelo1 "unzip -d /root/lordofpomelo /root/remote.zip;rm -rf /root/remote.zip"

#fi


#read -p "need start remote servers?(y/n)n:" REMOTE_MASK
#if ["$REMOTE_MASK" ]; then
#if [ $REMOTE_MASK = "y" ] ; then
#ssh $REMOTE_SSH "cd /root/lordofpomelo/;./startserver.sh daemon"
#fi
#fi

#ssh pomelo1 "cd /root/lordofpomelo/;./startserver.sh daemon"

