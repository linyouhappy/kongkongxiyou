#include "CommonLib.h"
#include "SimpleAudioEngine.h"
#include "CResourcesHelper.h"
#include "MyMD5.h"


#include <netdb.h>
#include <arpa/inet.h>
#include "scripting/js-bindings/manual/ScriptingCore.h"

Color3B _qualityColor[8]=
{
    Color3B(255,255,255),	//0white
    Color3B(10,180,10),		//1green
    Color3B(91,180,255),	//2blue
    Color3B(255,80,255),	//3purple
    Color3B(255,20,80),		//4red
    Color3B(255,255,127),	//5golden
    Color3B(232,237,57),	//6
    Color3B(255,0,0),		//7
};

Color3B *g_qualityColor=_qualityColor;

bool g_enableEffectSound=true;
bool g_enalbeBgMusic=true;
std::string g_bgMusicFile="";

void CommonLib::initCommonLib()
{
    
    g_enableEffectSound=UserDefault::getInstance()->getBoolForKey("effectSoundKey", true);
    g_enalbeBgMusic=UserDefault::getInstance()->getBoolForKey("bgMusicKey", true);
}

#pragma mark time
double CommonLib::currentSecond()
{
    struct timeval now;
    gettimeofday(&now, nullptr);
    double second=now.tv_sec+ now.tv_usec/1000000;
    return second;
}

long CommonLib::currentMilliSecond()
{
    struct timeval now;
    gettimeofday(&now, nullptr);
    long milliSecond=now.tv_sec%259200*1000+ (long)now.tv_usec/1000;
    return milliSecond;
}

bool CommonLib::isJSBScriptZipRun()
{
    ScriptingCore* sc = ScriptingCore::getInstance();
    return sc->exterScriptFunc!=nullptr;
}

int CommonLib::getTodayInteger()
{
    time_t t = time(NULL);
    struct tm *stm = localtime(&t);
    int day=stm->tm_mday;
    int month=stm->tm_mon+1;
    int year=stm->tm_year+1900;
    int today=day+month*100+year*10000;
    return today;
}

#pragma mark math
//bool CommonLib::floatEqual(float f1,float f2)
//{
//    if (std::abs(f1-f2)<=0.00001f)
//    {
//        return true;
//    }
//    return false;
//}

bool CommonLib::RandomProbability( const int probability )
{
	if( probability >= 100 ) 
		return true;

	if( probability <= 0 )
		return false;

	return ceil(CCRANDOM_0_1() * 100) <= probability;
}

int CommonLib::createUid()
{
    static int _uid=0;
    return --_uid;
}

#pragma mark sound
unsigned int CommonLib::playEffectSound(const char* soundFile,bool isLoop)
{
    if(!g_enableEffectSound || strlen(soundFile)==0)
        return 0;
    
    if (FileUtils::getInstance()->isFileExist(soundFile))
    {
        return CocosDenshion::SimpleAudioEngine::getInstance()->playEffect(soundFile,isLoop);
    }
    else
    {
        char msg[64]={};
        sprintf(msg, "sound effect file is no exist:%s",soundFile);
        MessageBox(msg, "res tips");
//        CCLOG("ERROR:sound effect file is no exist:%s",soundFile);
    }
    return 0;
}

void CommonLib::stopEffectSound(unsigned int nSoundId)
{
    if (nSoundId>0)
    {
        CocosDenshion::SimpleAudioEngine::getInstance()->stopEffect(nSoundId);
    }
}

void CommonLib::stopAllEffectsSound()
{
    CocosDenshion::SimpleAudioEngine::getInstance()->stopAllEffects();
}

void CommonLib::playBgMusic(const char* musicFile,bool isLoop)
{
    if(strlen(musicFile)==0)
    {
        g_bgMusicFile="";
        return;
    }
    
    if (FileUtils::getInstance()->isFileExist(musicFile))
    {
        g_bgMusicFile=musicFile;
        if (g_enalbeBgMusic)
            CocosDenshion::SimpleAudioEngine::getInstance()->playBackgroundMusic(musicFile,isLoop);
    }
    else
    {
        char msg[64]={};
        sprintf(msg, "music file is no exist:%s",musicFile);
//        CCLOG("ERROR music file is no exist:%s",musicFile);
        MessageBox(msg, "res tips");
        g_bgMusicFile="";
    }
}

void CommonLib::stopBgMusic(bool bReleaseData)
{
    CocosDenshion::SimpleAudioEngine::getInstance()->stopBackgroundMusic(bReleaseData);
}

void CommonLib::enableEffectSound(bool enable)
{
    g_enableEffectSound=enable;
    UserDefault::getInstance()->setBoolForKey("effectSoundKey", enable);
    if (!enable)
    {
        CommonLib::stopAllEffectsSound();
    }
}

void CommonLib::enableBgMusic(bool enable)
{
    g_enalbeBgMusic=enable;
    UserDefault::getInstance()->setBoolForKey("bgMusicKey", enable);
    if(enable)
    {
        if(g_bgMusicFile.length()>0)
        {
            CommonLib::playBgMusic(g_bgMusicFile.c_str(),true);
        }
    }
    else
    {
        CommonLib::stopBgMusic(true);
    }
}

bool CommonLib::isEnableEffectSound()
{
    return g_enableEffectSound;
}

bool CommonLib::isEnableBgMusic()
{
    return g_enalbeBgMusic;
}

#pragma mark messageBox
void CommonLib::MessageBox(const char * msg, const char * title)
{
    cocos2d::MessageBox(msg,title);
}

#pragma mark node
Animation* CommonLib::genarelAnimation(const char* plistFile,const char* spriteFrameName,float delayPerUnit,int loopNum)
{
    Animation* animation=AnimationCache::getInstance()->getAnimation(spriteFrameName);
    if (animation)
        return animation;
    
    auto spriteFrameCache=SpriteFrameCache::getInstance();
    if (strlen(plistFile)>0)
    {
        spriteFrameCache->addSpriteFramesWithFile(plistFile);
    }
    int frameNum=10000;
    Vector<SpriteFrame*> arrayOfSpriteFrames;
    for (int i=1; i<frameNum; ++i)
    {
        char spriteFullName[64]={};
        sprintf(spriteFullName, "%s%d.png",spriteFrameName,i);
        auto spriteFrame=spriteFrameCache->getSpriteFrameByName(spriteFullName);
        if (spriteFrame==nullptr)
        {
//            CCLOG("COMPLETE spriteFrame spriteFullName=%s",spriteFullName);
            break;
        }
        arrayOfSpriteFrames.pushBack(spriteFrame);
    }
    animation=Animation::createWithSpriteFrames(arrayOfSpriteFrames, delayPerUnit,loopNum);
    AnimationCache::getInstance()->addAnimation(animation, spriteFrameName);
    return animation;
}

Animate* CommonLib::genarelAnimate(const char*plistFile,const char* spriteFrameName,float delayPerUnit,int loopNum)
{
    auto animation = CommonLib::genarelAnimation(plistFile,spriteFrameName,delayPerUnit,loopNum);
    return Animate::create(animation);
}

void CommonLib::removeAnimation(const char* spriteFrameName)
{
    AnimationCache::getInstance()->removeAnimation(spriteFrameName);
}

void CommonLib::removeRes(const char* resName)
{
    std::string fileName=resName;
    int strLength=fileName.length();
    if(strLength==0)
        return;
    
    int index=fileName.find_last_of("plist");
    if (index==strLength-1)
    {
        SpriteFrameCache::getInstance()->removeSpriteFramesFromFile(fileName);
        std::string tmpString=fileName.substr(0,index-4);
        if (FileUtils::getInstance()->isFileExist(tmpString+"png"))
        {
            Director::getInstance()->getTextureCache()->removeTextureForKey(tmpString + "png");
        }
        else
        {
            Director::getInstance()->getTextureCache()->removeTextureForKey(tmpString + "pvr.ccz");
        }
        return;
    }
    index=fileName.find_last_of("png");
    if (index==strLength-1)
    {
        Director::getInstance()->getTextureCache()->removeTextureForKey(fileName);
        return;
    }
    index=fileName.find_last_of("_");
    if (index==strLength-1)
    {
        AnimationCache::getInstance()->removeAnimation(fileName);
        return;
    }
}

void CommonLib::showResInfo()
{
    std::string textInfo=Director::getInstance()->getTextureCache()->getCachedTextureInfo();
    CCLOG("%s",textInfo.c_str());
}

static Sequence* m_pHurtAction=nullptr;
Sequence* getHurtAction()
{
    if(m_pHurtAction==nullptr)
    {
        Vector<FiniteTimeAction*> actionsVector;
//        actionsVector.pushBack(ScaleTo::create(0.067f,1.2f));0.067f
        actionsVector.pushBack(Spawn::createWithTwoActions(MoveBy::create(0.2f,Vec2(0.0f,35.0f)),ScaleTo::create(0.2f,1.2f)));
        actionsVector.pushBack(ScaleTo::create(0.034f,1.1f));
        actionsVector.pushBack(DelayTime::create(0.3f));
        
        actionsVector.pushBack(Spawn::createWithTwoActions(MoveBy::create(0.44f,Vec2(0.0f,45.0f)),FadeTo::create(0.44f,0.0f)));
        
        actionsVector.pushBack(RemoveSelf::create());
        m_pHurtAction=Sequence::create(actionsVector);
        m_pHurtAction->retain();
    }
    return m_pHurtAction->clone();
}

Node* CommonLib::createMobHurtNumber(unsigned int hurtValue)
{
    char hurtString[128]={};
    sprintf(hurtString, "-%d",hurtValue);

    Texture2D *tempTexture = Director::getInstance()->getTextureCache()->addImage("fonts/mob_hurt_number.png");
    Size texSize=tempTexture->getContentSize();
    Label* hurtLabel=Label::createWithCharMap(tempTexture,texSize.width/15,texSize.height,'+');
    hurtLabel->setString(hurtString);
    hurtLabel->setScale(0.7f);
    hurtLabel->stopAllActions();
    hurtLabel->runAction(getHurtAction());
    return hurtLabel;
}

//static Vector<Label*> m_vNormalHurtLabelVector;
Node* CommonLib::createNormalHurtNumber(unsigned int hurtValue)
{
    char hurtString[128]={};
    sprintf(hurtString, "-%d",hurtValue);
    Texture2D *tempTexture = Director::getInstance()->getTextureCache()->addImage("fonts/normal_hurt_number.png");
    Size texSize=tempTexture->getContentSize();
    Label* hurtLabel=Label::createWithCharMap(tempTexture,texSize.width/13,texSize.height,'-');
    hurtLabel->setString(hurtString);
    
    hurtLabel->setScale(0.7f);
    hurtLabel->stopAllActions();
    hurtLabel->runAction(getHurtAction());
    return hurtLabel;
}

//static Vector<Node*> m_vCritHurtLabelVector;
Node* CommonLib::createCritHurtNumber(unsigned int hurtValue)
{
    char hurtString[128]={};
    sprintf(hurtString, "-%d",hurtValue);
    
    Node* hurtSprite=Node::create();
    Texture2D *tempTexture = Director::getInstance()->getTextureCache()->addImage("fonts/crit_hurt_number.png");
    Size texSize=tempTexture->getContentSize();
    Label* hurtLabel=Label::createWithCharMap(tempTexture,texSize.width/13,texSize.height,'-');
    hurtLabel->setString(hurtString);
    hurtLabel->setAnchorPoint(Vec2(0.0f,0.0f));
    hurtSprite->addChild(hurtLabel);
    hurtLabel->setTag(168);
    
    Sprite* critSprite=Sprite::createWithSpriteFrameName("battle_crit_text.png");
    critSprite->setAnchorPoint(Vec2(0.0f,0.0f));
    critSprite->setTag(169);
    hurtSprite->addChild(critSprite);
        
    Size labelContentSize=hurtLabel->getContentSize();
    Size spriteContentSize = critSprite->getContentSize();
    int totalLength=labelContentSize.width+spriteContentSize.width;
    
    critSprite->setPosition(-totalLength/2, 0.0f);
    hurtLabel->setPosition(-totalLength/2+spriteContentSize.width,0.0f);
    
    hurtSprite->setScale(0.7f);
    hurtSprite->stopAllActions();
    hurtSprite->runAction(getHurtAction());
    
    return hurtSprite;
}

//static Vector<Node*> m_vDodgeSpriteVector;
Node* CommonLib::createDodge()
{
    Node* hurtSprite=Sprite::createWithSpriteFrameName("battle_miss_text.png");
    hurtSprite->setScale(0.7f);
    hurtSprite->runAction(getHurtAction());
    return hurtSprite;
}

Node* CommonLib::createAddHpNumber(unsigned int addHpValue)
{
    char hurtString[128]={};
    sprintf(hurtString, "+%d",addHpValue);
    
    Texture2D *tempTexture = Director::getInstance()->getTextureCache()->addImage("fonts/add_hp_number.png");
    Size texSize=tempTexture->getContentSize();
    Label* hurtLabel=Label::createWithCharMap(tempTexture,texSize.width/15,texSize.height,'+');
    hurtLabel->setString(hurtString);
    hurtLabel->setScale(0.7f);
    hurtLabel->stopAllActions();
    hurtLabel->runAction(getHurtAction());
    return hurtLabel;
}

Node* CommonLib::createAddMpNumber(unsigned int addMpValue)
{
    char hurtString[128]={};
    sprintf(hurtString, "+%d",addMpValue);
    Texture2D *tempTexture = Director::getInstance()->getTextureCache()->addImage("fonts/add_mp_number.png");
    Size texSize=tempTexture->getContentSize();
    Label* hurtLabel=Label::createWithCharMap(tempTexture,texSize.width/15,texSize.height,'+');
    hurtLabel->setString(hurtString);
    hurtLabel->setScale(0.7f);
    hurtLabel->stopAllActions();
    hurtLabel->runAction(getHurtAction());
    return hurtLabel;
}

//typedef  struct _fightingEffectData:public Ref
//{
//    float preFighting;
//    float nextFighting;
//    float deltaFighting;
//    Label* fightingLabel;
//    Label* label;
//} FightingEffectData;
//
//void CommonLib::showFightingChangeEffect(int preFighting,int nextFighting)
//{
//    float deltaFighting=nextFighting-preFighting;
//    if(deltaFighting==0) return;
//    deltaFighting/=20.0f;
//    
//    Scene* runningScene=Director::getInstance()->getRunningScene();
//    if(runningScene==nullptr)
//        return;
//    
//    Size winSize=Director::getInstance()->getWinSize();
//    Node* effectNode=Node::create();
//    
//    int width=0;
//    Label* fightingLabel=Label::createWithCharMap("res/fonts/img_number.png",29,40,'0');
//    effectNode->addChild(fightingLabel);
//    fightingLabel->setAnchorPoint(Vec2::ANCHOR_MIDDLE_LEFT);
//    
//    stringstream stringStream;
//    stringStream<<0;
//    fightingLabel->setString(stringStream.str());
//    
//    width+=fightingLabel->getContentSize().width;
//    
//    Sprite* nameSprite=Sprite::create("res/fonts/text_label_fighting.png");
//    effectNode->addChild(nameSprite);
//    nameSprite->setAnchorPoint(Vec2::ANCHOR_MIDDLE_LEFT);
//    nameSprite->setScale(1.3f);
//    width+=nameSprite->getContentSize().width*1.5f;
//    
//    nameSprite->setPosition(Vec2(-width*1.3f/2,0.0f));
//    fightingLabel->setPosition(Vec2(-width/2+nameSprite->getContentSize().width+30.0f,0.0f));
//    
//    Sprite* symbolSprite;
//    if(deltaFighting>=0)
//    {
//        symbolSprite=Sprite::create("res/fonts/icon_number_plus.png");
//    }
//    else
//    {
//        symbolSprite=Sprite::create("res/fonts/icon_number_minus.png");
//    }
//    effectNode->addChild(symbolSprite);
//    symbolSprite->setPosition(Vec2(-width/2+nameSprite->getContentSize().width+20.0f,0.0f));
//    
//    runningScene->addChild(effectNode,60000);
//    effectNode->setPosition(Vec2(winSize.width/2,0.0f));
//    effectNode->setScale(0.8f);
//    
//    effectNode->runAction(Sequence::create(
//                                           MoveTo::create(0.2f,Vec2(winSize.width/2,winSize.height/2+50.0f)),
//                                           ScaleTo::create(0.1f,1.0f),
//                                           DelayTime::create(1.0f),
//                                           FadeOut::create(0.2f),
//                                           nullptr));
//    
//    FightingEffectData* fightingEffectData=new FightingEffectData;
//    fightingEffectData->preFighting=0;
//    fightingEffectData->nextFighting=nextFighting-preFighting;
//    fightingEffectData->deltaFighting=deltaFighting;
//    fightingEffectData->fightingLabel=fightingLabel;
//    effectNode->setUserObject(fightingEffectData);
//    fightingEffectData->autorelease();
//    
//    effectNode->runAction(
//                Sequence::create(
//                   DelayTime::create(0.3f),
//                   CallFuncN::create([=](Node* node){
//                      RepeatForever* repeatForever=RepeatForever::create(
//                                     Sequence::create(DelayTime::create(0.05f),
//                                                  CallFuncN::create([=](Node* node){
//                                         
//                             FightingEffectData* fightingEffectData=(FightingEffectData*)node->getUserObject();
//                                         
//                             if(fightingEffectData->preFighting==fightingEffectData->nextFighting)
//                             {
//                                 node->stopAllActions();
//                                 node->removeFromParent();
//                                 return;
//                             }
//                             if(fightingEffectData->deltaFighting>0)
//                             {
//                                 fightingEffectData->preFighting+=fightingEffectData->deltaFighting;
//                                 if(fightingEffectData->preFighting>=fightingEffectData->nextFighting)
//                                     fightingEffectData->preFighting=fightingEffectData->nextFighting;
//                             }
//                             else if(fightingEffectData->deltaFighting<0)
//                             {
//                                 fightingEffectData->preFighting+=fightingEffectData->deltaFighting;
//                                 if(fightingEffectData->preFighting<=fightingEffectData->nextFighting)
//                                     fightingEffectData->preFighting=fightingEffectData->nextFighting;
//                             }
//                             else
//                             {
//                                 fightingEffectData->preFighting=fightingEffectData->nextFighting;
//                             }
//                             stringstream stringStream;
//                             stringStream<<(int)fightingEffectData->preFighting;
//                             fightingEffectData->fightingLabel->setString(stringStream.str());
//                                         
//                             Vec2 position=fightingEffectData->fightingLabel->getPosition();
//                             Size contentSize=fightingEffectData->fightingLabel->getContentSize();
//                                         
//                                                     }),nullptr)
//                                                 );
//                      node->runAction(repeatForever);
//                }),
//            nullptr)
//    );
//}

bool CommonLib::saveFile(const char *filePath, const char *fileData,const size_t fileSize)
{
    return _saveFile(filePath,fileData,strlen(fileData));
}

const char* CommonLib::hostToIp(const char *host)
{
    hostent* host_entry = gethostbyname(host);
    if (!host_entry)
    {
        printf("域名解析失败, 请检查IP");
        return "";
    }
    struct sockaddr_in serv_addr;
    serv_addr.sin_addr = *((struct in_addr *)host_entry->h_addr_list[0]);
    host = inet_ntoa(serv_addr.sin_addr);
    return host;
}

const char* CommonLib::getFileMD5(const char* filename)
{
    return myGetFileMD5(filename).c_str();
}

const char* CommonLib::md5(const char* originChars)
{
    return myMD5(originChars).c_str();
}

const char* CommonLib::getServerIP()
{
    return hostToIp(CommonLib::getServerURL());
}

static std::string g_serverURL="www.tiexuejinrong.com";
//static std::string g_serverURL="192.168.199.242";
//static std::string g_serverURL="127.0.0.1";

const char* CommonLib::getServerURL()
{
    return g_serverURL.c_str();
//    return "192.168.199.242";
//    return "127.0.0.1";
}

void CommonLib::setServerURL(const char* url)
{
    if (!!url && strlen(url)>0)
    {
        g_serverURL=url;
    }
}

