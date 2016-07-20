#include "ScrollLogManager.h"
#include "cocos-ext.h"
#include "CommonLib.h"
USING_NS_CC_EXT;

ScrollLogManager* ScrollLogManager::s_ScrollLogManager=nullptr;

ScrollLogManager::ScrollLogManager()
:_lastMilliSecond(0)
,_delayInterval(400)
,_localZOrder(200)
,_runAction(nullptr)
{
    _startPosition=Vec2(210,250);
}

ScrollLogManager::~ScrollLogManager()
{
    CC_SAFE_RELEASE_NULL(_runAction);
}

ScrollLogManager* ScrollLogManager::getInstance()
{
    if (s_ScrollLogManager==nullptr)
    {
        s_ScrollLogManager=ScrollLogManager::create();
        s_ScrollLogManager->retain();
    }
    return s_ScrollLogManager;
}

ScrollLogManager* ScrollLogManager::create()
{
    ScrollLogManager *pRet = new ScrollLogManager();
    if (pRet!=nullptr)
    {
        pRet->init();
        pRet->autorelease();
        return pRet;
    }
    else
    {
        delete pRet;
        pRet = NULL;
        return NULL;
    }
}

bool ScrollLogManager::init()
{
    Spawn* spawn=Spawn::create(
                               MoveBy::create(0.5f,Vec2(0,60.0f)),
                               FadeOut::create(0.5f),
                               NULL);
    _runAction=Sequence::create(FadeIn::create(0.04f),MoveBy::create(0.8f,Vec2(0,60.0f)),spawn,RemoveSelf::create(), NULL);
    CC_SAFE_RETAIN(_runAction);
	return true;
}

void ScrollLogManager::startShowLog()
{
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    
    if(!scheduler->isScheduled("ScrollLogManager", this))
        scheduler->schedule(std::bind(&ScrollLogManager::showLog,this,std::placeholders::_1),this,0.1f,CC_REPEAT_FOREVER,0.0f,false, "ScrollLogManager");
}

void ScrollLogManager::stopShowLog()
{
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    scheduler->unschedule("ScrollLogManager", this);
}

void ScrollLogManager::setPosition(Vec2 position)
{
    _startPosition=position;
}

void ScrollLogManager::showLog(float delta)
{
    if (_logDatasVector.empty())
    {
        stopShowLog();
        return;
    }
    
    struct timeval now;
    gettimeofday(&now, nullptr);
    long curMilliSecond=now.tv_sec%259200*1000+ (long)now.tv_usec/1000;
    if (_lastMilliSecond+_delayInterval>curMilliSecond) {
        return;
    }
    
    _lastMilliSecond=curMilliSecond;
    LogData logData=_logDatasVector.back();
    _logDatasVector.pop_back();
    
    Label* logLabel=Label::createWithSystemFont(logData.logString, "Arial",26);
    logLabel->setAnchorPoint(Vec2::ANCHOR_MIDDLE_LEFT);
    logLabel->setColor(g_qualityColor[logData.quality]);
    logLabel->enableOutline(Color4B::BLACK,2);
    logLabel->setPosition(_startPosition);
    
    Scene* runningScene=Director::getInstance()->getRunningScene();
    runningScene->addChild(logLabel,_localZOrder);
    
//    Spawn* spawn=Spawn::create(
//                               MoveBy::create(0.5f,Vec2(0,60.0f)),
//                               FadeOut::create(0.5f),
//                               NULL);
//    Sequence* sequence=Sequence::create(FadeIn::create(0.04f),MoveBy::create(0.8f,Vec2(0,60.0f)),spawn,RemoveSelf::create(), NULL);
    logLabel->runAction(_runAction->clone());
}

void ScrollLogManager::pushLog(const char* logString,int quality)
{
    quality=MIN(MAX(0, quality),7);
    LogData logData={quality,logString};
    
    if (_logDatasVector.size()>10){
        _logDatasVector.pop_back();
    }
    _logDatasVector.insert(_logDatasVector.begin(),logData);
    startShowLog();
}

void ScrollLogManager::setLocalZOrder(int zOrder)
{
    _localZOrder=zOrder;
}
