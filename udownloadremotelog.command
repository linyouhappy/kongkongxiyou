
REMOTE_SSH=pomelo1
PROJECT_LOGS_DIR=/Users/linyou/Documents/current/lordofpomelo/game-server/logs
NATIVE_LOGS=/Users/linyou/Desktop/logs
ROMETE_LOGS=$REMOTE_SSH:/root/lordofpomelo/game-server/logs

mkdir $NATIVE_LOGS

for LOG_FILE in $PROJECT_LOGS_DIR/*
do
    FILE_NAME=${LOG_FILE##*/}

    REMOTE_LOG_FILE=$ROMETE_LOGS/$FILE_NAME
    NATIVE_LOG_FILE=$NATIVE_LOGS/$FILE_NAME

    scp $REMOTE_LOG_FILE $NATIVE_LOG_FILE
done

ssh $REMOTE_SSH "rm -rf /root/lordofpomelo/game-server/logs"

#scp /Users/linyou/Desktop/logs/node-log-area-server-1001.log pomelo1:/root/lordofpomelo/game-server/logs/node-log-area-server-1001.log





