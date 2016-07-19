#!/bin/bash

#Author: chisj
#Time: 2015.7.22
#Describe: Create Database

#The username of mysql database
USER="root"

#The password of mysql database
PASS="+123456-"

#The datebase name will be created
DATABASE="Pomelo"

SQLFILE="./game-server/config/schema/Pomelo.sql"

mysql -u $USER -p$PASS << EOF >/dev/null

DROP DATABASE $DATABASE;
CREATE DATABASE $DATABASE;

EOF


mysql -u $USER -p$PASS $DATABASE < $SQLFILE