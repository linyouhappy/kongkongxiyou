#include "ColorLogManager.h"
#include "cocos-ext.h"
#include "CommonLib.h"
USING_NS_CC_EXT;

ColorLogManager* ColorLogManager::s_ColorLogManager=nullptr;

ColorLogManager::ColorLogManager()
:_bgImgFile("update/quick_log_bg.png")
,_localZOrder(999999)
,_containerNode(nullptr)
,_curContentArray(nullptr)
{
    _defaultColorFormat.fontFamily="Arial";
    _defaultColorFormat.fontSize=26;
    _defaultColorFormat.fontColor=Color4B(255,255,255,255);
    _curColorFormat=_defaultColorFormat;
}

ColorLogManager::~ColorLogManager()
{
    CC_SAFE_RELEASE_NULL(_containerNode);
    CC_SAFE_RELEASE_NULL(_curContentArray);
    stopShowLog();
    for (auto iter=_colorLogDatasCachDeque.begin(); iter!=_colorLogDatasCachDeque.end(); iter++)
    {
        (*iter)->subNode->removeFromParentAndCleanup(true);
        (*iter)->subNode->release();
        delete *iter;
    }
    _colorLogDatasCachDeque.clear();
    
    for (auto iter=_colorLogDatasDeque.begin(); iter!=_colorLogDatasDeque.end(); iter++)
    {
        (*iter)->subNode->removeFromParentAndCleanup(true);
        (*iter)->subNode->release();
        delete *iter;
    }
    _colorLogDatasDeque.clear();
}

ColorLogManager* ColorLogManager::getInstance()
{
    if (s_ColorLogManager==nullptr)
    {
        s_ColorLogManager=ColorLogManager::create();
        s_ColorLogManager->retain();
    }
    return s_ColorLogManager;
}

ColorLogManager* ColorLogManager::create()
{
    ColorLogManager *pRet = new ColorLogManager();
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

bool ColorLogManager::init()
{
    _containerNode=Node::create();
    CC_SAFE_RETAIN(_containerNode);
    
    Size winSize=Director::getInstance()->getWinSize();
    _logPosition=Vec2(winSize.width/2,200);
    _minBgWidth=200;
	return true;
}

void ColorLogManager::setDefaultColorFormat(const char* fontFamily,int fontSize,Color4B fontColor)
{
    _defaultColorFormat.fontFamily=fontFamily;
    _defaultColorFormat.fontSize=fontSize;
    _defaultColorFormat.fontColor=fontColor;
}

//void ColorLogManager::startLog()
//{
//    
//}

void ColorLogManager::appendText(const char *text)
{
    if (!text || strlen(text)==0)
        return;
    
    Label* logLabel=Label::createWithSystemFont(text, _curColorFormat.fontFamily,_curColorFormat.fontSize);
    logLabel->setTextColor(_curColorFormat.fontColor);
    logLabel->enableOutline(Color4B::BLACK,2);

    __Array* contentArray=getCurContentArray();
    contentArray->addObject(logLabel);
}

void ColorLogManager::appendSpriteFrame(const char *spriteFrameName,int width)
{
    SpriteFrame* spriteFrame=SpriteFrameCache::getInstance()->getSpriteFrameByName(spriteFrameName);
    if(!spriteFrame)
        return;
    
    Sprite* sprite=Sprite::createWithSpriteFrame(spriteFrame);
    if(width>0)
    {
        Size contentSize=sprite->getContentSize();
        sprite->setScale(width/contentSize.width);
    }
    __Array* contentArray=getCurContentArray();
    contentArray->addObject(sprite);
}

void ColorLogManager::appendSpriteFile(const char *spriteFileName,int width)
{
    Sprite* sprite=Sprite::create(spriteFileName);
    if(!sprite)
        return;
    
    if(width>0)
    {
        Size contentSize=sprite->getContentSize();
        sprite->setScale(width/contentSize.width);
    }
    __Array* contentArray=getCurContentArray();
    contentArray->addObject(sprite);
}

void ColorLogManager::appendNode(Node *node)
{
    if(!node)
        return;
    
    node->removeFromParent();
    __Array* contentArray=getCurContentArray();
    contentArray->addObject(node);
}

void ColorLogManager::resetDefaultFormat()
{
    _curColorFormat=_defaultColorFormat;
}

void ColorLogManager::setFontFamily(const char* fontFamily)
{
    _curColorFormat.fontFamily=fontFamily;
}

void ColorLogManager::setFontSize(int fontSize)
{
    _curColorFormat.fontSize=fontSize;
}

void ColorLogManager::setFontColor(Color4B fontColor)
{
    _curColorFormat.fontColor=fontColor;
}

void ColorLogManager::endRichLog()
{
    if (!_curContentArray)
        return;
    
    if (_curContentArray->count()==0)
    {
        CC_SAFE_RELEASE_NULL(_curContentArray);
        return;
    }
    
    ColorLogData* colorLogData=new ColorLogData;
    colorLogData->subNode=Node::create();
    colorLogData->subNode->retain();
    colorLogData->width=0;
    colorLogData->height=0;
    colorLogData->type=1;
    
    Node *childNode;
    Size contentSize;
    float tmpScale;
    for(unsigned int i = 0 ; i < _curContentArray->count() ; i++ )
    {
        childNode = dynamic_cast<Node *>(_curContentArray->getObjectAtIndex(i));
        contentSize=childNode->getContentSize();
        tmpScale=childNode->getScale();
        colorLogData->width+=contentSize.width*tmpScale;
        if (contentSize.height>colorLogData->height*tmpScale)
        {
            colorLogData->height=contentSize.height*tmpScale;
        }
        colorLogData->subNode->addChild(childNode);
    }
    int positionX=-colorLogData->width/2;
    for(unsigned int i = 0 ; i < _curContentArray->count() ; i++ )
    {
        childNode = dynamic_cast<Node *>(_curContentArray->getObjectAtIndex(i));
        contentSize=childNode->getContentSize();
        tmpScale=childNode->getScale();
        positionX+=childNode->getAnchorPoint().x*contentSize.width*tmpScale;
        childNode->setPosition(positionX, 0);
        positionX+=(1-childNode->getAnchorPoint().x)*contentSize.width*tmpScale;
    }
    CC_SAFE_RELEASE_NULL(_curContentArray);
    _colorLogDatasDeque.push_back(colorLogData);
    startShowLog();
}

void ColorLogManager::cancelRichLog()
{
    CC_SAFE_RELEASE_NULL(_curContentArray);
}

__Array* ColorLogManager::getCurContentArray()
{
    if (_curContentArray==nullptr)
    {
        _curContentArray=__Array::create();
        CC_SAFE_RETAIN(_curContentArray);
    }
    return _curContentArray;
}

void ColorLogManager::pushNewLog(const char* logString,Color4B fontColor,int fontSize)
{
    if (!logString || strlen(logString)==0)
        return;
    
    Label* logLabel=Label::createWithSystemFont(logString, _curColorFormat.fontFamily,fontSize);
    logLabel->setTextColor(fontColor);
    logLabel->enableOutline(Color4B::BLACK,2);
    
    ColorLogData* colorLogData=new ColorLogData;
    colorLogData->subNode=logLabel;
    colorLogData->subNode->retain();
    colorLogData->width=logLabel->getContentSize().width;
    colorLogData->height=logLabel->getContentSize().height;
    colorLogData->type=0;
    
    _colorLogDatasDeque.push_back(colorLogData);
    startShowLog();
}

void ColorLogManager::pushLog(const char* logString,int quality)
{
    if (!logString || strlen(logString)==0)
        return;
    quality=MIN(MAX(0, quality),7);
    
    Label* logLabel=Label::createWithSystemFont(logString, _defaultColorFormat.fontFamily,_defaultColorFormat.fontSize);
    logLabel->setColor(g_qualityColor[quality]);
    logLabel->enableOutline(Color4B::BLACK,2);
    
    ColorLogData* colorLogData=new ColorLogData;
    colorLogData->subNode=logLabel;
    colorLogData->subNode->retain();
    colorLogData->width=logLabel->getContentSize().width;
    colorLogData->height=logLabel->getContentSize().height;
    colorLogData->type=0;
    
    _colorLogDatasDeque.push_back(colorLogData);
    startShowLog();
}

void ColorLogManager::startShowLog()
{
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    
    if(!scheduler->isScheduled("ColorLogManager", this))
        scheduler->schedule(std::bind(&ColorLogManager::showLog,this,std::placeholders::_1),this,0.2f,CC_REPEAT_FOREVER,0.0f,false, "ColorLogManager");
}

void ColorLogManager::showLog(float delta)
{
    if (_colorLogDatasDeque.empty() && _colorLogDatasCachDeque.empty())
    {
        stopShowLog();
        return;
    }
    struct timeval now;
    gettimeofday(&now, nullptr);
    long currentMilliSecond=now.tv_sec%259200*1000+ (long)now.tv_usec/1000;
    
    int count=_colorLogDatasDeque.size()+_colorLogDatasCachDeque.size();
    int timeInterval=count<4?2000:(count<5?1500:(count<8?1000:500));
    
    bool isNeedAgain=false;
    bool isDataDirty=false;
    ColorLogData* tmpColorLogData;
    do{
        isNeedAgain=false;
        for (auto iter=_colorLogDatasCachDeque.begin(); iter!=_colorLogDatasCachDeque.end(); iter++)
        {
            tmpColorLogData=*iter;
            if (tmpColorLogData->lastTime+timeInterval<currentMilliSecond) {
                tmpColorLogData->subNode->removeFromParentAndCleanup(true);
                tmpColorLogData->subNode->autorelease();
                _colorLogDatasCachDeque.erase(iter);
                delete tmpColorLogData;
                isNeedAgain=true;
                isDataDirty=true;
                break;
            }

        }
    }while(isNeedAgain);
    
    if(!_colorLogDatasDeque.empty())
    {
        if (_colorLogDatasCachDeque.size()<3)
        {
            tmpColorLogData=_colorLogDatasDeque[0];
            _colorLogDatasDeque.pop_front();
            _colorLogDatasCachDeque.push_back(tmpColorLogData);
            tmpColorLogData->lastTime=currentMilliSecond;
            isDataDirty=true;
        }
    }
    
    if (_containerNode->getParent()==nullptr)
    {
        Scene* runningScene=Director::getInstance()->getRunningScene();
        Size winSize=Director::getInstance()->getWinSize();
        
        runningScene->addChild(_containerNode,_localZOrder);
        _containerNode->setPosition(_logPosition);
        _containerNode->removeAllChildrenWithCleanup(true);
        isDataDirty=true;
    }
    
    if (isDataDirty)
    {
        int positionY=0;
        Size contentSize;
        Node* subNode;
        for (auto iter=_colorLogDatasCachDeque.rbegin(); iter!=_colorLogDatasCachDeque.rend(); iter++)
        {
            tmpColorLogData=*iter;
            subNode=tmpColorLogData->subNode;
            if (subNode->getParent()==nullptr)
            {
                _containerNode->addChild(subNode);
            }
            positionY+=tmpColorLogData->height/2;
            subNode->setPosition(0,positionY);
            subNode->runAction(MoveTo::create(0.2,Vec2(0,positionY)));
            positionY+=tmpColorLogData->height/2;
            
            _bgWidth= MAX(_minBgWidth,tmpColorLogData->width);
        }
        _bgHeight=positionY;
        this->setBgContentSize();
    }
}

void ColorLogManager::stopShowLog()
{
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    scheduler->unschedule("ColorLogManager", this);
}

void ColorLogManager::setBgImgFile(const char* imgFile)
{
    _bgImgFile=imgFile;
    Node* scale9SpriteNode=_containerNode->getChildByTag(16846);
    if (scale9SpriteNode!=nullptr)
    {
        scale9SpriteNode->removeFromParentAndCleanup(true);
    }
}

void ColorLogManager::setPosition(Vec2 position)
{
    _logPosition=position;
    _containerNode->setPosition(position);
}

void ColorLogManager::setBgContentSize()
{
    if (_bgHeight==0) {
        _containerNode->setVisible(false);
        return;
    }
    _containerNode->setVisible(true);
    
    Node* scale9SpriteNode=_containerNode->getChildByTag(16846);
    if (scale9SpriteNode==nullptr)
    {
        if(!FileUtils::getInstance()->isFileExist(_bgImgFile))
            return;
        
        scale9SpriteNode=ui::Scale9Sprite::create(_bgImgFile);
        _containerNode->addChild(scale9SpriteNode,-1);
        scale9SpriteNode->setAnchorPoint(Vec2(0.5,0));
        scale9SpriteNode->setTag(16846);
        scale9SpriteNode->setPosition(0,-10);
        _minBgWidth=scale9SpriteNode->getContentSize().width;
        _bgWidth= MAX(_minBgWidth,_bgWidth);
    }
    scale9SpriteNode->setContentSize(Size(_bgWidth,20+_bgHeight));
}

void ColorLogManager::setLocalZOrder(int zOrder)
{
    _localZOrder=zOrder;
    if (_containerNode!=nullptr) {
        _containerNode->setLocalZOrder(_localZOrder);
    }
}
