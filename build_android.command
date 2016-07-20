#! /bin/bash

CURRENT_DIR=`dirname $0`
CocosJavaPath=$CURRENT_DIR/cocosjs/frameworks/cocos2d-x/cocos/platform/android/java
RuntimePath=$CURRENT_DIR/cocosjs/frameworks/runtime-src

echo $CURRENT_DIR

#CopyRes()
#{
#cp -Rp $CURRENT_DIR/cocosjs/config.json $RuntimePath/$1/assets
#cp -Rp $CURRENT_DIR/cocosjs/res $RuntimePath/$1/assets
#}

CleanPreject()
{
echo "CleanPreject===>>$1"
cd $RuntimePath/$1
rm -rf $RuntimePath/$1/assets
mkdir $RuntimePath/$1/assets
ant clean
cp -Rp $CURRENT_DIR/cocosjs/config.json $RuntimePath/$1/assets
cp -Rp $CURRENT_DIR/cocosjs/res $RuntimePath/$1/assets
echo "CleanPreject===<<$1"
}

CompileCPLUS()
{
echo "CompileCPLUS=====>>$1"
#cocos compile -p android
#--ndk-mode debug|release|none
cd $CURRENT_DIR/cocosjs
cocos compile -p android --no-apk --proj-dir $RuntimePath/$1

echo "CompileCPLUS=====<<$1"
sleep 1
}


UpdateCocosJava()
{
cd $CocosJavaPath
android update lib-project -p . -t android-19
}

PublicReleaseAPK()
{
cd $RuntimePath/$1
android update project -p . -t android-19
ant release
}

ChannelPrepare()
{
CleanPreject $1
CompileCPLUS $1
}

ChannelStart()
{
UpdateCocosJava
PublicReleaseAPK $1
mv -f $RuntimePath/$1/bin/cocosjs-release.apk /Users/linyou/Sites/res/$1-release.apk
}


PREJOCTNAME=proj.android

ChannelPrepare $PREJOCTNAME
ChannelStart $PREJOCTNAME



#cp -Rp $CURRENT_DIR/cocosjs/frameworks/runtime-src/proj.android/bin/cocosjs-debug-unaligned.apk /Users/linyou/Sites/res


