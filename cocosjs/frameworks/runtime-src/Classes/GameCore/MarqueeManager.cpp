#include "MarqueeManager.h"
#include "cocos-ext.h"
#include "CCRichText.h"
#include "CommonLib.h"
USING_NS_CC_EXT;

MarqueeManager* MarqueeManager::s_MarqueeManager=nullptr;

//CCRichTextStyle* m_oCurrentStyle;

MarqueeManager::MarqueeManager()
:_bgImgFile("update/chat_marquee_bg.png")
,m_pCurRichContentDatasArray(nullptr)
,_lastMilliSecond(0)
,_localZOrder(999999)
{
    m_pRichContentDataGroupsArray=__Array::create();
    CC_SAFE_RETAIN(m_pRichContentDataGroupsArray);
    
    m_pCurrentStyle=new CCRichTextStyle;
    m_pCurrentStyle->m_szFontFamily = "Arial";
    m_pCurrentStyle->m_fFontSize = 22;
    m_pCurrentStyle->m_cFontColor =Color4B(255,255,255,255);
    
    _delayInterval=2000;
    _actionInterval=1000;
}

MarqueeManager::~MarqueeManager()
{
    CC_SAFE_DELETE(m_pCurrentStyle);
    
    CC_SAFE_RELEASE_NULL(m_pRichContentDataGroupsArray);
}

MarqueeManager* MarqueeManager::getInstance()
{
    if (s_MarqueeManager==nullptr)
    {
        s_MarqueeManager=MarqueeManager::create();
        s_MarqueeManager->retain();
    }
    return s_MarqueeManager;
}

MarqueeManager* MarqueeManager::create()
{
    MarqueeManager *pRet = new MarqueeManager();
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

bool MarqueeManager::init()
{
    m_pRichContentDataGroupsArray->removeAllObjects();
    
    Size winSize=Director::getInstance()->getWinSize();
    _startPosition=Vec2(winSize.width/2,winSize.height/2+180);
    _endPosition=Vec2(winSize.width/2,winSize.height+50);
    
	return true;
}

void MarqueeManager::appendRichText(const char *lpcszData)
{
    CCRichContentData *pData = CCRichContentData::create(__String::create(lpcszData));
    if( pData != NULL )
    {
        pData->m_Style = *m_pCurrentStyle;
    }
    __Array* curRichContentDatasArray=getCurRichContentDatasArray();
    curRichContentDatasArray->addObject(pData);
}

void MarqueeManager::appendRichSprite(const char *spriteFrameName)
{
    SpriteFrame* spriteFrame=SpriteFrameCache::getInstance()->getSpriteFrameByName(spriteFrameName);
    if(!spriteFrame) return;
    
    Sprite* sprite=Sprite::createWithSpriteFrame(spriteFrame);
    appendRichNode(sprite);
}

void MarqueeManager::appendRichNode(Node *lpcData)
{
    CCRichContentData *pData = CCRichContentData::create((Ref *)lpcData);
    __Array* curRichContentDatasArray=getCurRichContentDatasArray();
    curRichContentDatasArray->addObject(pData);
}

void MarqueeManager::setDetailStyle(const char *lpcszFontFamily, int fFontSize, Color4B &color)
{
    m_pCurrentStyle->m_szFontFamily = lpcszFontFamily;
    m_pCurrentStyle->m_fFontSize = fFontSize;
    m_pCurrentStyle->m_cFontColor = color;
}

void MarqueeManager::setTextColor(Color4B &color)
{
    m_pCurrentStyle->m_cFontColor = color;
}

void MarqueeManager::setStartPosition(Vec2 position)
{
    _startPosition=position;
}

void MarqueeManager::setInterval(int delayInterval,int actionInterval)
{
    _delayInterval=delayInterval;
    _actionInterval=actionInterval;
}

__Array* MarqueeManager::getCurRichContentDatasArray()
{
    if (m_pCurRichContentDatasArray==nullptr)
    {
        m_pCurRichContentDatasArray=__Array::create();
        m_pRichContentDataGroupsArray->addObject(m_pCurRichContentDatasArray);
    }
    return m_pCurRichContentDatasArray;
}

void MarqueeManager::startMarquee()
{
    if (m_pRichContentDataGroupsArray->count()==0)
    {
        m_pRichContentDataGroupsArray->removeObject(m_pCurRichContentDatasArray);
        m_pCurRichContentDatasArray=nullptr;
        return;
    }
    else if(m_pRichContentDataGroupsArray->count()>10)
    {
        m_pRichContentDataGroupsArray->removeObjectAtIndex(0);
    }
    m_pCurRichContentDatasArray=nullptr;
    
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    if(!scheduler->isScheduled("MarqueeManager", this))
        scheduler->schedule(std::bind(&MarqueeManager::updateMarquee,this,std::placeholders::_1),this,0.1f,CC_REPEAT_FOREVER,0.0f,false, "MarqueeManager");
}

void MarqueeManager::updateMarquee(float delta)
{
    int count=m_pRichContentDataGroupsArray->count();
    if (count==0) {
        stopMarquee();
        return;
    }
    
    struct timeval now;
    gettimeofday(&now, nullptr);
    long curMilliSecond=now.tv_sec%259200*1000+ (long)now.tv_usec/1000;
    
    if (_lastMilliSecond+_delayInterval+_actionInterval>curMilliSecond) {
        return;
    }
    _lastMilliSecond=curMilliSecond;
    Ref* pObject=m_pRichContentDataGroupsArray->getObjectAtIndex(0);
    pObject->retain();
    pObject->autorelease();
    m_pRichContentDataGroupsArray->removeObject(pObject);

    __Array* curRichContentDatasArray=dynamic_cast<__Array*>(pObject);
    if (curRichContentDatasArray==nullptr) {
        return;
    }
    
    showMarquee(curRichContentDatasArray);
}

void MarqueeManager::showMarquee(__Array* curRichContentDatasArray)
{
    Vector<Node*> nodeVector;
    int totalWidth=0;
    int totalHeight=0;
    Size contentSize;
    for(unsigned int i = 0 ; i < curRichContentDatasArray->count() ; i++ )
    {
        CCRichContentData *pCurrentData = dynamic_cast<CCRichContentData *>(curRichContentDatasArray->getObjectAtIndex(i));
        if (pCurrentData==nullptr) {
            continue;
        }
        
        __String *pStringData = dynamic_cast<__String *>(pCurrentData->getData());
        if( pStringData != NULL )
        {
            CCRichTextStyle& m_cStyle=pCurrentData->m_Style;
            Label* label=Label::createWithSystemFont(pStringData->getCString(),m_cStyle.m_szFontFamily,m_cStyle.m_fFontSize);
            label->setColor(Color3B(m_cStyle.m_cFontColor.r, m_cStyle.m_cFontColor.g, m_cStyle.m_cFontColor.b));
            label->setOpacity(m_cStyle.m_cFontColor.a);
            label->setAnchorPoint(Vec2::ANCHOR_MIDDLE_LEFT);
            
            nodeVector.pushBack(label);
            
            contentSize=label->getContentSize();
            totalWidth+=contentSize.width;
            if (contentSize.height>totalHeight) {
                totalHeight=contentSize.height;
            }
            continue;
        }
        
        Node *pObjectNode = dynamic_cast<Node *>(pCurrentData->getData());
        if( pObjectNode != NULL )
        {
            pObjectNode->setAnchorPoint(Vec2::ANCHOR_MIDDLE_LEFT);
            
            nodeVector.pushBack(pObjectNode);
            
            contentSize=pObjectNode->getContentSize();
            totalWidth+=contentSize.width;
            if (contentSize.height>totalHeight) {
                totalHeight=contentSize.height;
            }
            continue;
        }
    }
    
    Node* containerNode=Node::create();
    if (FileUtils::getInstance()->isFileExist(_bgImgFile)) {
        ui::Scale9Sprite* scale9Sprite=ui::Scale9Sprite::create(_bgImgFile);
        contentSize=scale9Sprite->getContentSize();
        contentSize.height=totalHeight+14;
        scale9Sprite->setContentSize(contentSize);
        containerNode->addChild(scale9Sprite);
    }
    
    int startPosX=-totalWidth/2;
    for(auto child:nodeVector)
    {
        containerNode->addChild(child);
        child->setPosition(Vec2(startPosX, 0));
        startPosX+=child->getContentSize().width;
    }
    
    Scene* runningScene=Director::getInstance()->getRunningScene();    
    runningScene->addChild(containerNode,_localZOrder);
    containerNode->setPosition(_startPosition);
    
    Sequence* sequence=Sequence::create(FadeIn::create(_delayInterval/1000.0f),MoveTo::create(_actionInterval/1000.0f,_endPosition),RemoveSelf::create(), NULL);
    
    containerNode->runAction(sequence);
}

void MarqueeManager::stopMarquee()
{
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    scheduler->unschedule("MarqueeManager", this);
}

void MarqueeManager::setBgImgFile(const char* imgFile)
{
    _bgImgFile=imgFile;
}

void MarqueeManager::setLocalZOrder(int zOrder)
{
    _localZOrder=zOrder;
}



