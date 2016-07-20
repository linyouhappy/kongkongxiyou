CURRENT_DIR=`dirname $0`

SOURCE_DIR=$CURRENT_DIR/cocosjs/res
#SOURCE_DIR=$CURRENT_DIR/publicResource/workpath/res0
WORK_DIR=$CURRENT_DIR/publicResource/workpath
ZIP_SOURCE_DIR=$CURRENT_DIR/publicResource/publiczip
ZIP_PUBLIC_DIR=$CURRENT_DIR/lordofpomelo/web-server/public/res

PUBLIC_PATH=$CURRENT_DIR/publicResource/publicpath
PUBLIC_ZIP=$CURRENT_DIR/publicResource/publiczip


#exit

rm -rf $CURRENT_DIR/publicResource/src
mkdir $CURRENT_DIR/publicResource/src

SRC_WORK_DIR=$CURRENT_DIR/publicResource/srcworkpath
rm -rf $SRC_WORK_DIR
mkdir $SRC_WORK_DIR


SRC_DIR=$CURRENT_DIR/cocosjs/src
SCRIPT_DIR=$CURRENT_DIR/cocosjs/frameworks/cocos2d-x/cocos/scripting/js-bindings/script

cp -Rp $SRC_DIR $SRC_WORK_DIR
cp -Rp $SCRIPT_DIR $SRC_WORK_DIR

cocos jscompile -s $SRC_WORK_DIR -d $CURRENT_DIR/publicResource/src

SRC_SOURCE_DIR=$CURRENT_DIR/publicResource/src
cd $SRC_SOURCE_DIR
zip -r -P c97fd81db51212a43a5a5c9279584d2b $SOURCE_DIR/data.js ./*
#zip -r $SOURCE_DIR/data.js ./*

DIR_INDEX=1
for CUR_DIR in $WORK_DIR/*
do
    if [ -d "$CUR_DIR" ]; then
        DIR_INDEX=`expr $DIR_INDEX + 1`
    fi
done

DIR_INDEX=2
NEW_WORK_DIR=$WORK_DIR/res$DIR_INDEX

rm -rf $NEW_WORK_DIR
mkdir $NEW_WORK_DIR

echo "copy res to work path=============================>>>"

SOURCE_DIR_LEN==${#SOURCE_DIR}

COPY_DIR_FUNCTION() {
    SUB_SOURCE_DIR=$1

    for SOURCE_FILE in $SUB_SOURCE_DIR/*
    do
        RELATIVE_FILE=${SOURCE_FILE##$SOURCE_DIR}
        TARGET_FILE=${NEW_WORK_DIR}${RELATIVE_FILE}

        if [ -d "$SOURCE_FILE" ]; then
            mkdir $TARGET_FILE
            COPY_DIR_FUNCTION $SOURCE_FILE
        fi

        if [ -f "$SOURCE_FILE" ]; then
            cp -Rp $SOURCE_FILE $TARGET_FILE
        fi
    done
}

COPY_DIR_FUNCTION $SOURCE_DIR


rm -rf $NEW_WORK_DIR/update.xml
rm -rf $NEW_WORK_DIR/version


cd $CURRENT_DIR/publicResource
node app


rm -rf $PUBLIC_ZIP
mkdir $PUBLIC_ZIP


#compress data to zip
for VERSION_DIR in $PUBLIC_PATH/*
do
    VERSION_DIR_NAME=${VERSION_DIR##*/}
    cd $VERSION_DIR
#    zip -r -P 123456 $PUBLIC_ZIP/$VERSION_DIR_NAME.ios ./*
    zip -r $PUBLIC_ZIP/$VERSION_DIR_NAME.ios ./*
done


#generate update.json
cd $CURRENT_DIR/publicResource
node updateApp

#copy to web
rm -rf $ZIP_PUBLIC_DIR
mkdir $ZIP_PUBLIC_DIR


cd $CURRENT_DIR

for ZIP_SOURCE in $ZIP_SOURCE_DIR/*
do
ZIP_FILE_NAME=${ZIP_SOURCE##*/}
ZIP_FILE_FULLPATH=$ZIP_PUBLIC_DIR/$ZIP_FILE_NAME
cp -f $ZIP_SOURCE $ZIP_FILE_FULLPATH
done


read -p "need update to remote server?(y/n)n:" REMOTE_MASK
if [ $REMOTE_MASK = "y" ] ; then

for ZIP_SOURCE in $ZIP_SOURCE_DIR/*
do
scp $ZIP_SOURCE pomelo1:/root/lordofpomelo/web-server/public/res
done

fi










