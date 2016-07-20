
REMOTE_SSH=pomelo1
#ssh $REMOTE_SSH "kill -9 `ps -ef|grep node | awk '{print $2}'`"
#ssh $REMOTE_SSH "kill -9 `ps -ef|grep node | awk '{print $2}'`"

ssh $REMOTE_SSH "/root/lordofpomelo/kill_node_app.sh"
