
#include "CCRichText.h"
//#include "CCLuaEngine.h"
//#include <map>
#include <algorithm>

//#include "cocos-ext.h"
//USING_NS_CC_EXT;


static const Vec2 CCRichContentAnchor = Vec2(0.0f, 0.0f);

CCRichTextStyle::CCRichTextStyle()
: m_szFontFamily("Arial")
, m_fFontSize(22.0f)
, m_cFontColor(Color4B(255,255,255,255))
{
}

CCRichTextStyle &CCRichTextStyle::operator=(const CCRichTextStyle &rhs)
{
    m_szFontFamily.assign(rhs.m_szFontFamily);
    m_fFontSize = rhs.m_fFontSize;
    m_cFontColor = rhs.m_cFontColor;
    return *this;
}

bool CCRichTextStyle::operator==(const CCRichTextStyle &rhs) const
{
    do
    {
        CC_BREAK_IF(m_fFontSize != rhs.m_fFontSize);
//        CC_BREAK_IF(m_cFontColor.r != rhs.m_cFontColor.r);
//        CC_BREAK_IF(m_cFontColor.g != rhs.m_cFontColor.g);
//        CC_BREAK_IF(m_cFontColor.b != rhs.m_cFontColor.b);
//        CC_BREAK_IF(m_cFontColor.a != rhs.m_cFontColor.a);
        CC_BREAK_IF(m_szFontFamily.compare(rhs.m_szFontFamily) != 0);
        return true;
    }
    while (0);
    return false;
}

bool CCRichTextStyle::operator!=(const CCRichTextStyle &rhs) const
{
    return !(operator==(rhs));
}

bool CCRichTextStyle::operator<(const CCRichTextStyle &rhs) const
{
    do
    {
        CC_BREAK_IF(this->operator==(rhs));
        CC_BREAK_IF(m_fFontSize < rhs.m_fFontSize);
//        CC_BREAK_IF(m_cFontColor.r < rhs.m_cFontColor.r);
//        CC_BREAK_IF(m_cFontColor.g < rhs.m_cFontColor.g);
//        CC_BREAK_IF(m_cFontColor.b < rhs.m_cFontColor.b);
//        CC_BREAK_IF(m_cFontColor.a < rhs.m_cFontColor.a);
//        CC_BREAK_IF(m_szFontFamily.compare(rhs.m_szFontFamily) < 0);
        return true;
    }
    while (0);
    return false;
}

float CCRichTextMetric::getCharWidth(char ch)
{
    map<char, float>::iterator it = m_mapCharsWidth.find(ch);
    return it == m_mapCharsWidth.end() ? 0.0f : it->second;
}

CCRichTextMetric *CCRichTextStyleDataCache::getData(CCRichTextStyle &style)
{
    static map< CCRichTextStyle, CCRichTextMetric > mapTextMetrics;
    while (true)
    {
        map<CCRichTextStyle, CCRichTextMetric>::iterator it = mapTextMetrics.find(style);
        if( it != mapTextMetrics.end() )
            return &it->second;
        else
        {
            CCRichTextMetric textMetric;

            CCRichContentText txt("我", style);            
            Size wideCharSize = txt.getContentSize();
            textMetric.setWideCharWidth( wideCharSize.width );
            textMetric.setCharHeight( wideCharSize.height );
            for( int i = 0x21 ; i < 0x7f ; i++ )
            {
                char szStr[2] = { 0, 0 };
                szStr[0] = i;
                txt.setString(szStr);
                textMetric.m_mapCharsWidth[ (char)i ] = txt.getContentSize().width;
            }
            mapTextMetrics[ style ] = textMetric;
        }
    }
}

CCRichContentData::CCRichContentData(Ref *pObject)
: m_Data(NULL),
//m_pNodesArray(NULL),
m_animateName(nullptr),
m_bIsFinishInit(false)
{

    setData(pObject);
}

CCRichContentData::~CCRichContentData()
{
    CC_SAFE_RELEASE(m_Data);
    CC_SAFE_RELEASE_NULL(m_animateName);
//    CC_SAFE_RELEASE_NULL(m_pNodesArray);
}

//__Array* CCRichContentData::getNodesArray()
//{
//    if (!m_pNodesArray)
//    {
//        m_pNodesArray=__Array::create();
//        CC_SAFE_RETAIN(m_pNodesArray);
//    }
//    return m_pNodesArray;
//}

CCRichContentData *CCRichContentData::create(Ref *pObject)
{
    CCRichContentData *pRet = new CCRichContentData(pObject);
    if( pRet != NULL )
    {
        pRet->autorelease();
        return pRet;
    }
    else
    {
        CCLOG("CCRichContentData Create Error!");
        return NULL;
    }
}

CCRichContentText::CCRichContentText(const char *lpcszString, const CCRichTextStyle &var)
:Label(TextHAlignment::LEFT,TextVAlignment::CENTER),m_cStyle(var)
{
    CCReactContent::setLineNumber(0);
    
    setSystemFontName(m_cStyle.m_szFontFamily);
    setSystemFontSize(m_cStyle.m_fFontSize);
    setString(lpcszString);
    
    setColor(Color3B(m_cStyle.m_cFontColor.r, m_cStyle.m_cFontColor.g, m_cStyle.m_cFontColor.b));
    setOpacity(m_cStyle.m_cFontColor.a);
    setAnchorPoint(CCRichContentAnchor);
    setPosition(Point::ZERO);
}

CCRichContentText *CCRichContentText::create(const char *lpcszString, const CCRichTextStyle &var)
{
    CCRichContentText *pRet = new CCRichContentText(lpcszString, var);
    if( pRet != NULL )
    {
//        pRet->setSystemFontName(var.m_szFontFamily);
//        pRet->setSystemFontSize(var.m_fFontSize);
//        pRet->setString(lpcszString);
//        
//        pRet->setColor(Color3B(var.m_cFontColor.r, var.m_cFontColor.g, var.m_cFontColor.b));
//        pRet->setOpacity(var.m_cFontColor.a);
//        pRet->setAnchorPoint(CCRichContentAnchor);
//        pRet->setPosition(Point::ZERO);
        
        pRet->autorelease();
        return pRet;
    }
    else
    {
        CCLOG("CCRichContentText Create Error!");
        return NULL;
    }
}

const CCRichTextStyle &CCRichContentText::getStyle()
{
    return m_cStyle;
}

void CCRichContentText::setStyle(CCRichTextStyle &var)
{
    m_cStyle = var;
    setSystemFontName(m_cStyle.m_szFontFamily);
    setSystemFontSize(m_cStyle.m_fFontSize);
    setColor(Color3B(m_cStyle.m_cFontColor.r, m_cStyle.m_cFontColor.g, m_cStyle.m_cFontColor.b));
    setOpacity(m_cStyle.m_cFontColor.a);
    setAnchorPoint(CCRichContentAnchor);
    setPosition(Point::ZERO);
}

CCRichContentNode::CCRichContentNode(Node *pData)
: m_pData((Node *)pData)
{
    CCReactContent::setLineNumber(0);
    m_pData->ignoreAnchorPointForPosition(true);
    addChild(m_pData);
    setContentSize(m_pData->getContentSize());
    setAnchorPoint(Point::ZERO);
}

CCRichContentNode *CCRichContentNode::create(Node *pData)
{
    CCRichContentNode *pRet = new CCRichContentNode(pData);
    if( pRet != NULL )
    {
        pRet->autorelease();
        return pRet;
    }
    else
    {
        CCLOG("CCRichContentNode Create Error!");
        return NULL;
    }
}

CCRichText::CCRichText(int nWidth, int nHeight)
:m_bLayoutDirty(false)
, m_bTouchEnabled(false)
, m_pRichContentDatasArray(__Array::create())
//, m_touchPriority(kCCMenuHandlerPriority)
,m_nContentSizeWidth(nWidth)
,m_nContentSizeHeight(nHeight)
,m_fLineSpace(0.0f)
,m_oCallback(nullptr)
,_blankHeight(0)
,m_nMixContentWidth(0)
,_isDebug(false)
{
    m_pCanvas=Node::create();
    m_pCanvas->setPosition(Vec2(0.0f, nHeight));
    this->addChild(m_pCanvas);
    
    CC_SAFE_RETAIN(m_pRichContentDatasArray);
    
    m_pContentDatasCacheArray=__Array::create();
    CC_SAFE_RETAIN(m_pContentDatasCacheArray);
    m_pContentDatasArray=__Array::create();
    CC_SAFE_RETAIN(m_pContentDatasArray);
    
    m_currentStyle.m_szFontFamily = "Arial";
    m_currentStyle.m_fFontSize = 22;
    m_currentStyle.m_cFontColor =Color4B(255,255,255,255);
    
    init();
    setAnchorPoint(Point::ZERO);
    setTouchEnabled(true);
}

CCRichText::~CCRichText()
{
    setTouchEnabled(false);
    CC_SAFE_RELEASE_NULL(m_pRichContentDatasArray);
    CC_SAFE_RELEASE_NULL(m_pContentDatasCacheArray);
    CC_SAFE_RELEASE_NULL(m_pContentDatasArray);
}

CCRichText *CCRichText::create(int nWidth, int nHeight)
{
    CCRichText *pRet = new CCRichText(nWidth, nHeight);
    if( pRet != NULL )
    {
        pRet->autorelease();
        return pRet;
    }
    CCLOG("CRichTextView Create Error!");
    return NULL;
}

void CCRichText::visit(Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags)
{
    layoutChildren();
    Node::visit(renderer, parentTransform, parentFlags);
}

CCRichTextStyle &CCRichText::getCurrentStyle()
{
    return m_currentStyle;
}

void CCRichText::setCurrentStyle(CCRichTextStyle &rStyle)
{
    m_currentStyle = rStyle;
}

void CCRichText::setDetailStyle(const char *lpcszFontFamily, int fFontSize, Color4B &color)
{
    m_currentStyle.m_szFontFamily = lpcszFontFamily;
    m_currentStyle.m_fFontSize = fFontSize;
    m_currentStyle.m_cFontColor = color;
}

void CCRichText::setTextColor(Color4B &color)
{
    m_currentStyle.m_cFontColor = color;
}

void CCRichText::layoutChildren()
{
    if(!m_bLayoutDirty)
        return;

    m_bLayoutDirty = false;
    
    m_pCanvas->removeAllChildrenWithCleanup(false);
    m_pContentDatasCacheArray->addObjectsFromArray(m_pContentDatasArray);
    m_pContentDatasArray->removeAllObjects();
    
    int nLineNum = 0;
    float fCurrentLineLeft = 0.0f;
    float fCurrentLineHeight = 0.0f;
    
    map<int, float> mapLineHeights;
    map<int, float>::iterator lineHeightIterator;
    CCRichContentData *pCurrentData;
    __String *pStringData;
    CCRichTextMetric *pTextMetric;
    string formattedSentence;
    float fIncreateLeft;
    int stringLength;
    int nCharWide;
    char szChar[4] = {0,0,0,0};
    float fCharWidth = 0.0f;
    bool isReachEnd=false;
    Size nodeSize;
    Node *pObjectNode;
    for( unsigned int i = 0 ; i < m_pRichContentDatasArray->count() ; i++ )
    {
        lineHeightIterator = mapLineHeights.find( nLineNum );
        if( lineHeightIterator != mapLineHeights.end() )
        {
            fCurrentLineHeight = lineHeightIterator->second;
        }
        
        pCurrentData = dynamic_cast<CCRichContentData *>(m_pRichContentDatasArray->getObjectAtIndex(i));
        pStringData = dynamic_cast<__String *>(pCurrentData->getData());
        if( pStringData != NULL )
        {
            pTextMetric = CCRichTextStyleDataCache::getData(pCurrentData->m_Style);
            if( pTextMetric == NULL )
                continue;
            
            formattedSentence = "";
            fIncreateLeft = 0.0f;
            stringLength=pStringData->length();
            for( unsigned j = 0 ; j<stringLength ; j++ )
            {
                string::const_reference charCode = pStringData->_string.at( j );
                nCharWide=(int)charCode;
                nCharWide = (nCharWide < 0 || nCharWide > 128) ? 2 : 1;
//                char szChar[4] = {0,0,0,0};
                memset(szChar, 0, sizeof(szChar));
                fCharWidth = 0.0f;
                if( nCharWide == 2 )
                {
                    szChar[0] = pStringData->_string.at( j );
                    isReachEnd=false;
                    if (j + 1<stringLength)
                        szChar[1] = pStringData->_string.at( j + 1 );
                    else
                        isReachEnd=true;

                    if (j + 2<stringLength)
                        szChar[2] = pStringData->_string.at( j + 2 );
                    else
                        isReachEnd=true;
                    
                    j += 2;
                    if (isReachEnd)
                        j=stringLength-1;

                    fCharWidth = pTextMetric->getWideCharWidth();
                }
                else
                {
                    szChar[0] = pStringData->_string.at( j );
                    fCharWidth = pTextMetric->getCharWidth(szChar[0]);
                }
                
                if( szChar[0] == '\n' )
                {
                    fIncreateLeft = m_nContentSizeWidth + 1;
                    j++;
                }
                
                if( fCurrentLineHeight < pTextMetric->getCharHeight()+m_fLineSpace)
                {
                    fCurrentLineHeight = pTextMetric->getCharHeight()+m_fLineSpace;
                    mapLineHeights[ nLineNum ] = fCurrentLineHeight;
                }
                
                fIncreateLeft += fCharWidth;
                
                if( fCurrentLineLeft + fIncreateLeft >= m_nContentSizeWidth )
                {
                    if( szChar[0] != '\n' )
                    {
                        if( nCharWide == 2 )
                            j -= 3;
                        else
                            j -= 1;
                        
                        if (formattedSentence.length()>0) {
                            fIncreateLeft=drawString(formattedSentence.c_str(), pCurrentData->m_Style, fCurrentLineLeft, -0.0f, nLineNum, pCurrentData);
                        }
                        
                        m_nMixContentWidth=m_nContentSizeWidth;
                    }
                    formattedSentence.clear();
                    nLineNum++;
                    fCurrentLineLeft = 0.0f;
                    fIncreateLeft = 0.0f;
                    fCurrentLineHeight = 0.0f;
                }
                else
                {
                    formattedSentence.append( szChar );
                    if( j == pStringData->length() - 1 )
                    {
                        fIncreateLeft=drawString(formattedSentence.c_str(), pCurrentData->m_Style, fCurrentLineLeft, -0.0f, nLineNum, pCurrentData);
                        fCurrentLineLeft += fIncreateLeft;
                        fIncreateLeft = 0.0f;
                        
                        if (fCurrentLineLeft>m_nMixContentWidth)
                        {
                            m_nMixContentWidth=fCurrentLineLeft;
                        }
                    }
                }
            }
            pCurrentData->m_bIsFinishInit=true;
            continue;
        }
        
        pObjectNode = dynamic_cast<Node *>(pCurrentData->getData());
        if( pObjectNode != NULL )
        {
            nodeSize = pObjectNode->getContentSize();
            if( fCurrentLineLeft + nodeSize.width < m_nContentSizeWidth )
            {
                if( fCurrentLineHeight < nodeSize.height+m_fLineSpace )
                {
                    fCurrentLineHeight = nodeSize.height+m_fLineSpace;
                    mapLineHeights[ nLineNum ] = fCurrentLineHeight;
                }
                drawNode(pObjectNode, fCurrentLineLeft, 0.0f, nLineNum, pCurrentData);
                fCurrentLineLeft += nodeSize.width;
            }
            else
            {
                nLineNum++;
                fCurrentLineLeft = 0.0f;
                mapLineHeights[ nLineNum ] = nodeSize.height;
                drawNode(pObjectNode, fCurrentLineLeft, 0.0f, nLineNum, pCurrentData);
                fCurrentLineLeft += nodeSize.width;
            }
            pCurrentData->m_bIsFinishInit=true;
            if (fCurrentLineLeft>m_nMixContentWidth)
            {
                m_nMixContentWidth=fCurrentLineLeft;
            }
            continue;
        }
    }
    
    Vector<Node*> pChildren = m_pCanvas->getChildren();
    
    m_nContentSizeHeight = _blankHeight;
    
    float fLineHeight = 0.0f;
    map<int, float>::iterator lineIter;
    for( int nLine = 0 ; nLine <= nLineNum ; nLine++ )
    {
        fLineHeight = 0.0f;
        lineIter = mapLineHeights.find(nLine);
        if( lineIter == mapLineHeights.end() )
            break;
        fLineHeight = lineIter->second;
        m_nContentSizeHeight += fLineHeight;
    }
    
    this->setContentSize(Size(m_nContentSizeWidth, m_nContentSizeHeight));
    
    
    float fLineOffset =m_nContentSizeHeight;
    CCRichContentText *pText;
    CCRichContentNode *pNode;
    for( int nLine = 0 ; nLine <= nLineNum ; nLine++ )
    {
        fLineHeight = 0.0f;
        lineIter = mapLineHeights.find(nLine);
        if( lineIter == mapLineHeights.end() )
            break;
        fLineHeight = lineIter->second;
        
//        m_nContentSizeHeight += fLineHeight;
        fLineOffset -= fLineHeight;
        for (auto child:pChildren)
        {
            pText = dynamic_cast<CCRichContentText *>(child);
            if( pText != NULL && pText->getLineNumber() == nLine )
            {
                pText->setPositionY(fLineOffset);
                continue;
            }
            pNode = dynamic_cast<CCRichContentNode *>(child);
            if( pNode != NULL && pNode->getLineNumber() == nLine )
            {
                pNode->setPositionY(fLineOffset);
                continue;
            }
        }
    }
    m_pContentDatasCacheArray->removeAllObjects();
    
    if (!!m_oCallback)
    {
        m_oCallback(kRichTextLoaded,0,0,0);
    }
    
    if (_isDebug) {
        this->showDebug();
    }
}

int CCRichText::drawString(const char *lpcszString, CCRichTextStyle &style, float fPosX, float fPosY, int nLineNum, CCRichContentData *pData)
{
    Ref* pObject=NULL;
    CCRichContentText *pLabelText =NULL;
    CCRichContentText* pRichContentText;
    CCARRAY_FOREACH(m_pContentDatasCacheArray, pObject)
    {
        pRichContentText =dynamic_cast<CCRichContentText*>(pObject);
        if (pRichContentText!=NULL && pRichContentText->m_nNodeId==pData->m_nNodeId)
        {
            pLabelText=pRichContentText;
            m_pContentDatasArray->addObject(pLabelText);
            m_pContentDatasCacheArray->removeObject(pRichContentText);
            break;
        }
    }
    
    if (pLabelText==NULL)
    {
        pLabelText = CCRichContentText::create(lpcszString, style);
        m_pContentDatasArray->addObject(pLabelText);
    }
    if( pLabelText != NULL )
    {
        pLabelText->m_nEventId=pData->m_nEventId;
        pLabelText->m_nNodeId=pData->m_nNodeId;
        
        pLabelText->setPosition(Vec2(fPosX, fPosY));
        pLabelText->setLineNumber(nLineNum);
        m_pCanvas->addChild(pLabelText);
    }
    
    Size labelContentSize=pLabelText->getContentSize();
    if(pData->m_eTextStyle==kTextStyleNormal)
    {
    }
    else if(pData->m_eTextStyle==kTextStyleBracketHerf)
    {
        LayerColor* layerColor=LayerColor::create(style.m_cFontColor, labelContentSize.width-8, 1.5);
        layerColor->setPosition(Vec2(8,1));
        pLabelText->addChild(layerColor);
    }
    else if(pData->m_eTextStyle==kTextStyleHerf)
    {
        LayerColor* layerColor=LayerColor::create(style.m_cFontColor, labelContentSize.width-2, 1.5);
        layerColor->setPosition(Vec2(2,1));
        pLabelText->addChild(layerColor);
    }
    if( pLabelText != NULL )
        return labelContentSize.width;
    else
        return 1;
}

void CCRichText::drawNode(Node *pNode, float fPosX, float fPosY, int nLineNum, CCRichContentData *pData)
{
    Ref* pObject=NULL;
    CCRichContentNode *pObjectNode =NULL;
    CCRichContentNode* pRichContentNode;
    CCARRAY_FOREACH(m_pContentDatasCacheArray, pObject)
    {
        pRichContentNode =dynamic_cast<CCRichContentNode*>(pObject);
        if (pRichContentNode!=NULL && pRichContentNode->m_nNodeId==pData->m_nNodeId)
        {
            pObjectNode=pRichContentNode;
            if (pData->getAnimateName()==nullptr)
            {
                m_pContentDatasArray->addObject(pObjectNode);
            }
            m_pContentDatasCacheArray->removeObject(pRichContentNode);
            break;
        }
    }
    
    if (pObjectNode==NULL)
    {
        pObjectNode = CCRichContentNode::create(pNode);
        if (pData->getAnimateName()==nullptr)
        {
            m_pContentDatasArray->addObject(pObjectNode);
        }
//        m_pContentDatasArray->addObject(pObjectNode);
    }
    
    if( pObjectNode != NULL )
    {
        pObjectNode->m_nEventId=pData->m_nEventId;
        pObjectNode->m_nNodeId=pData->m_nNodeId;
        
        pObjectNode->setPosition(Vec2(fPosX, fPosY));
        pObjectNode->setLineNumber(nLineNum);
        m_pCanvas->addChild(pObjectNode);
        
        if (pData->getAnimateName()!=nullptr)
        {
            pNode->stopAllActions();
            auto animationCache=AnimationCache::getInstance();
            Animation* animation=animationCache->getAnimation(pData->getAnimateName()->getCString());
            if (animation)
            {
                pNode->runAction(RepeatForever::create(Animate::create(animation)));
            }
        }
    }
}

void CCRichText::appendRichText(const char *lpcszData, kTextStyle textStyle, int nodeId, int eventId)
{
    Ref* pObject;
    CCRichContentData* pData;
    CCARRAY_FOREACH(m_pRichContentDatasArray, pObject)
    {
        pData=dynamic_cast<CCRichContentData*>(pObject);
        if (pData->m_nNodeId==nodeId)
            return;
    }
    pData = CCRichContentData::create(__String::create(lpcszData));
    if( pData != NULL )
    {
        pData->m_Style = m_currentStyle;
        pData->m_eTextStyle=textStyle;
        pData->m_nEventId=eventId;
        pData->m_nNodeId=nodeId;
    }
    m_pRichContentDatasArray->addObject(pData);
    m_bLayoutDirty = true;
}

void CCRichText::appendRichNode(Node *lpcData, int nodeId, int eventId)
{
    Ref* pObject;
    CCRichContentData* pData;
    CCARRAY_FOREACH(m_pRichContentDatasArray, pObject)
    {
        pData=dynamic_cast<CCRichContentData*>(pObject);
        if (pData->m_nNodeId==nodeId)
            return;
    }
    pData = CCRichContentData::create((Ref *)lpcData);
    if( pData != NULL )
    {
        pData->m_Style = m_currentStyle;
        pData->m_nEventId=eventId;
        pData->m_nNodeId=nodeId;
    }
    m_pRichContentDatasArray->addObject(pData);
    m_bLayoutDirty = true;
}

void CCRichText::appendRichSprite(const char *spriteFrameName, int nodeId, int eventId)
{
    Ref* pObject;
    CCRichContentData* pData;
    CCARRAY_FOREACH(m_pRichContentDatasArray, pObject)
    {
        pData=dynamic_cast<CCRichContentData*>(pObject);
        if (pData->m_nNodeId==nodeId)
            return;
    }
    
    SpriteFrame* spriteFrame=SpriteFrameCache::getInstance()->getSpriteFrameByName(spriteFrameName);
    if(!spriteFrame) return;
    
    Sprite* sprite=Sprite::createWithSpriteFrame(spriteFrame);
    if(!sprite) return;
    
    pData = CCRichContentData::create((Ref *)sprite);
    if( pData != NULL )
    {
        pData->m_Style = m_currentStyle;
        pData->m_nEventId=eventId;
        pData->m_nNodeId=nodeId;
    }
    m_pRichContentDatasArray->addObject(pData);
    m_bLayoutDirty = true;
}

void CCRichText::appendRichSpriteFile(const char *spriteFileName, int nodeId, int eventId)
{
    Ref* pObject;
    CCRichContentData* pData;
    CCARRAY_FOREACH(m_pRichContentDatasArray, pObject)
    {
        pData=dynamic_cast<CCRichContentData*>(pObject);
        if (pData->m_nNodeId==nodeId)
            return;
    }
    Sprite* sprite=Sprite::create(spriteFileName);
    if(!sprite) return;
    
    pData = CCRichContentData::create((Ref *)sprite);
    if( pData != NULL )
    {
        pData->m_Style = m_currentStyle;
        pData->m_nEventId=eventId;
        pData->m_nNodeId=nodeId;
    }
    m_pRichContentDatasArray->addObject(pData);
    m_bLayoutDirty = true;
}

void CCRichText::appendRichAnimate(const char *animateName, int nodeId, int eventId)
{
    Ref* pObject;
    CCRichContentData* pData;
    CCARRAY_FOREACH(m_pRichContentDatasArray, pObject)
    {
        pData=dynamic_cast<CCRichContentData*>(pObject);
        if (pData->m_nNodeId==nodeId)
            return;
    }
    char frameNames[128]={};
    sprintf(frameNames, "%s_%d.png",animateName,1);
    SpriteFrame* spriteFrame=SpriteFrameCache::getInstance()->getSpriteFrameByName(frameNames);
    if(!spriteFrame) return;
    
    Sprite* sprite=Sprite::createWithSpriteFrame(spriteFrame);
    
    auto animationCache=AnimationCache::getInstance();
    Animation* animation=animationCache->getAnimation(animateName);
    if (!animation)
    {
        Vector<SpriteFrame*> arrayOfSpriteFrames;
        SpriteFrame* spriteFrame;
        auto spriteFrameCache=SpriteFrameCache::getInstance();
        int index=1;
        while (true)
        {
            sprintf(frameNames, "%s_%d.png",animateName,index++);
            spriteFrame=spriteFrameCache->getSpriteFrameByName(frameNames);
            if (!spriteFrame)
            {
                break;
            }
            arrayOfSpriteFrames.pushBack(spriteFrame);
        }
        if (arrayOfSpriteFrames.size()>0)
        {
            animation=Animation::createWithSpriteFrames(arrayOfSpriteFrames,0.15f,-1);
            animationCache->addAnimation(animation, animateName);
        }
    }

    pData = CCRichContentData::create((Ref *)sprite);
    if( pData != NULL )
    {
        pData->m_Style = m_currentStyle;
        pData->m_nEventId=eventId;
        pData->m_nNodeId=nodeId;
        pData->setAnimateName(__String::create(animateName));
        
        m_pRichContentDatasArray->addObject(pData);
        m_bLayoutDirty = true;
//        if (animation)
//        {
//            sprite->runAction(Animate::create(animation));
//        }
    }
}

void CCRichText::removeRichNode(int nodeId)
{
    Ref* pObject;
    CCRichContentData* pData;
    CCARRAY_FOREACH(m_pRichContentDatasArray, pObject)
    {
        pData=dynamic_cast<CCRichContentData*>(pObject);
        if (pData!=NULL && pData->m_nNodeId==nodeId)
        {
            m_bLayoutDirty = true;
            
//            CCObject* pSubObject;
//            CCARRAY_FOREACH(pData->m_pNodesArray, pSubObject)
//            {
//                CCNode* pNode=dynamic_cast<CCNode*>(pSubObject);
//                if (pNode!=NULL)
//                {
//                    pNode->removeFromParentAndCleanup(true);
//                }
//            }
            m_pRichContentDatasArray->removeObject(pData);
        }
    }
}

void CCRichText::setNodeSprite(const char *lpcszResourceName, int eventId)
{
    Vector<Node*>& pChildren = m_pCanvas->getChildren();
    if( pChildren.size() == 0 )
        return;
    
    for (auto pElement:pChildren)
    {
        CCRichContentNode *pNode = dynamic_cast<CCRichContentNode *>(pElement);
        if(pNode != NULL && pNode->m_nEventId==eventId)
        {
//            CGraySprite*  graySprite= dynamic_cast<CGraySprite*>(pNode->getData());
//            if (graySprite!=NULL)
//            {
//                graySprite->setImageWithSpriteFrameName(lpcszResourceName);
//                return;
//            }
        }
    }

}

bool CCRichText::getTouchEnabled()
{
    return m_bTouchEnabled;
}

void CCRichText::setTouchEnabled(bool bTouchEnabled)
{
    if( m_bTouchEnabled)
    {
        if (bTouchEnabled)
            return;

        _eventDispatcher->removeEventListenersForTarget(this);
    }
    else
    {
        if (!bTouchEnabled)
            return;
        
        auto listener = EventListenerTouchOneByOne::create();
        listener->setSwallowTouches(false);
        listener->onTouchBegan = CC_CALLBACK_2(CCRichText::onTouchBegan, this);
        listener->onTouchEnded = CC_CALLBACK_2(CCRichText::onTouchEnded, this);
        _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
    }
    m_bTouchEnabled=bTouchEnabled;
}

bool CCRichText::onTouchBegan(Touch *pTouch, Event *pEvent)
{
    if( !isVisible() )
        return false;
    
    if (!!m_oCallback)
    {
        Vec2 touchPoint=convertTouchToNodeSpaceAR(pTouch);
        return m_oCallback(kRichTextTouchBegan,0,touchPoint.x,touchPoint.y);
    }

    return false;
}

void CCRichText::onTouchEnded(Touch *pTouch, Event *pEvent)
{
    Point pTouchPoint=convertTouchToNodeSpaceAR(pTouch);
//    CCLOG("pTouchPoint.x=%f,pTouchPoint.y=%f",pTouchPoint.x,pTouchPoint.y);
    
    Vector<Node*>& pChildren = m_pCanvas->getChildren();
    if(pChildren.empty())
        return;
    
    CCRichContentText *pText;
    CCRichContentNode *pNode;
    for(auto pElement:pChildren)
    {
        pText = dynamic_cast<CCRichContentText *>(pElement);
        if(pText != NULL)
        {
            if(pText->m_nEventId>0 && pText->getBoundingBox().containsPoint(pTouchPoint))
            {
                if (!!m_oCallback)
                {
                    m_oCallback(kRichTextTouchEnded,pText->m_nEventId,pTouchPoint.x,pTouchPoint.y);
                }
                return;
            }
            continue;
        }
        
        pNode = dynamic_cast<CCRichContentNode *>(pElement);
        if(pNode != NULL)
        {
            if(pNode->m_nEventId>0 && pNode->getBoundingBox().containsPoint(pTouchPoint))
            {
                if (!!m_oCallback)
                {
                    m_oCallback(kRichTextTouchEnded,pNode->m_nEventId,pTouchPoint.x,pTouchPoint.y);
                }
                return;
            }
            continue;
        }
    }
}

void CCRichText::clearAll()
{
    m_pCanvas->removeAllChildrenWithCleanup(true);
    m_pRichContentDatasArray->removeAllObjects();
    m_bLayoutDirty = true;
}

void CCRichText::addEventListener(std::function<bool(kRichTextState richTextState, int eventId, int x, int y)> callback)
{
    m_oCallback=callback;
}

void CCRichText::setLineSpace(int lineSpace)
{
    m_fLineSpace=lineSpace;
}

void CCRichText::setBlankHeight(int blankHeight)
{
    _blankHeight=blankHeight;
}

int CCRichText::getMixContentWidth()
{
    return m_nMixContentWidth;
}

void CCRichText::showDebug()
{
    LayerColor* layerColor=(LayerColor*)this->getChildByTag(748138);
    if (layerColor)
    {
        layerColor->setContentSize(Size(m_nContentSizeWidth, m_nContentSizeHeight));
        return;
    }
    layerColor=LayerColor::create(Color4B(255,0,0,150), m_nContentSizeWidth, m_nContentSizeHeight);
    this->addChild(layerColor);
    layerColor->setLocalZOrder(100);
    layerColor->setTag(748138);
    
    _isDebug=true;
}

////////
RichLabelsLayer::RichLabelsLayer()
:_curRichLabelData(NULL)
,_divideLineColor4B(Color4B(253,214,0,255))
,_enableEvent(false)
,_labelSpace(0)
,m_oCallback(nullptr)
,_selectRichLabelData(nullptr)
{
}

RichLabelsLayer::~RichLabelsLayer()
{
    RichLabelData* richLabelData;
    for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
    {
        richLabelData=iter->second;
        delete richLabelData;
    }
    _richLabelDatasMap.clear();
}

RichLabelsLayer* RichLabelsLayer::create(int nWidth, int nHeight)
{
    RichLabelsLayer *pRet = new RichLabelsLayer();
    if( pRet != NULL && pRet->initWithViewSize(Size(nWidth,nHeight)))
    {
        pRet->autorelease();
        return pRet;
    }
    CCLOG("RichLabelsLayer Create Error!");
    return NULL;
}

bool RichLabelsLayer::initWithViewSize(Size size)
{
    ScrollView::initWithViewSize(size);
    
    _containerNode=Node::create();
    this->addChild(_containerNode);
    
    _width=size.width;
    _height=size.height;
    
    setContentSize(Size(_width, _height));
    setTouchEnabled(false);
    return true;
}

void RichLabelsLayer::resetRichLabels()
{
    RichLabelData* richLabelData;
    for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
    {
        richLabelData=iter->second;
        richLabelData->newMask=false;
    }
}

void RichLabelsLayer::setDivideLineColor(Color4B &color)
{
    _divideLineColor4B=color;
}

void RichLabelsLayer::setCurRichLabel(int richLabelId)
{
    auto findIter=_richLabelDatasMap.find(richLabelId);
    if (findIter!=_richLabelDatasMap.end())
    {
        _curRichLabelData=findIter->second;
    }
    else
    {
        _curRichLabelData=new RichLabelData;
        _curRichLabelData->richText=CCRichText::create(_width,0);
        _curRichLabelData->richText->setBlankHeight(0);
        _containerNode->addChild(_curRichLabelData->richText);
        
        _curRichLabelData->lineColor=LayerColor::create(_divideLineColor4B,_width,1);
        _containerNode->addChild(_curRichLabelData->lineColor);
        
        _curRichLabelData->richLabelId=richLabelId;
        _richLabelDatasMap[richLabelId]=_curRichLabelData;
    }
    _curRichLabelData->newMask=true;
}

void RichLabelsLayer::removeRichLabel(int richLabelId)
{
    auto findIter=_richLabelDatasMap.find(richLabelId);
    if (findIter!=_richLabelDatasMap.end())
    {
        if (_curRichLabelData==findIter->second)
            _curRichLabelData=nullptr;
        
        RichLabelData* richLabelData=findIter->second;
        _richLabelDatasMap.erase(findIter);
        
        richLabelData->richText->removeFromParent();
        richLabelData->lineColor->removeFromParent();
        delete richLabelData;
    }
}

void RichLabelsLayer::appendRichText(const char *lpcszData, kTextStyle textStyle,int nodeId)
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->appendRichText(lpcszData, textStyle, nodeId, 0);
}

void RichLabelsLayer::appendRichSprite(const char *spriteFrameName,int nodeId)
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->appendRichSprite(spriteFrameName, nodeId, 0);
}

void RichLabelsLayer::appendRichAnimate(const char *animateName,int nodeId)
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->appendRichAnimate(animateName, nodeId, 0);
}

void RichLabelsLayer::setDetailStyle(const char *lpcszFontFamily, int fFontSize, Color4B &color)
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->setDetailStyle(lpcszFontFamily, fFontSize,color);
}

void RichLabelsLayer::setTextColor(Color4B &color)
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->setTextColor(color);
}

void RichLabelsLayer::layoutCurRichLabel()
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->layoutChildren();
    _curRichLabelData->size=_curRichLabelData->richText->getContentSize();
}

void RichLabelsLayer::clearCurRichLabel()
{
    if (!_curRichLabelData) return;
    
    _curRichLabelData->richText->clearAll();
}

CCRichText* RichLabelsLayer::getCurRichLabelText()
{
    if (!_curRichLabelData) return nullptr;
    
    return _curRichLabelData->richText;
}

void RichLabelsLayer::clearAllRichLabels()
{
    RichLabelData* richLabelData;
    for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
    {
        richLabelData=iter->second;
        delete richLabelData;
    }
    _richLabelDatasMap.clear();
    _curRichLabelData=nullptr;
    _containerNode->removeAllChildrenWithCleanup(true);
}

void RichLabelsLayer::layoutRichLabels()
{
    RichLabelData* richLabelData=nullptr;
    while (true)
    {
        richLabelData=nullptr;
        for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
        {
            if (!iter->second->newMask)
            {
                richLabelData=iter->second;
                _richLabelDatasMap.erase(iter);
                break;
            }
        }
        if (richLabelData==nullptr)
            break;

        delete richLabelData;
    }
    justLayout();
}

void RichLabelsLayer::justLayout()
{
    int totalHeight=0;
    RichLabelData* richLabelData=nullptr;
    for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
    {
        richLabelData=iter->second;
        richLabelData->richText->layoutChildren();
        richLabelData->size=richLabelData->richText->getContentSize();
        totalHeight+=richLabelData->size.height+_labelSpace;
    }
    int positionY=totalHeight;
    for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
    {
        richLabelData=iter->second;
        positionY-=richLabelData->size.height+_labelSpace;
        richLabelData->position=Vec2(0,positionY+ceil(_labelSpace/2));
        richLabelData->richText->setPosition(richLabelData->position);
        
        richLabelData->lineColor->setPosition(0,richLabelData->position.y-2);
    }
    
    _totalHeight=totalHeight;
    _minYposition=-totalHeight+_height;
    _maxYposition=0;
    
    Vec2 position=_containerNode->getPosition();
    position.y=_minYposition;
    _containerNode->setPosition(position);
}

void RichLabelsLayer::resetSelectRichLabelData()
{
    if (_selectRichLabelData)
    {
        _selectRichLabelData->lineColor->setContentSize(Size(_width,1));
        _selectRichLabelData->lineColor->setOpacity(255);
        _selectRichLabelData=NULL;
    }
}

void RichLabelsLayer::setLabelSpace(int labelSpace)
{
    _labelSpace=labelSpace;
}

void RichLabelsLayer::enableEvent(bool enableEvent)
{
    if(enableEvent)
    {
        if(_enableEvent) return;
        
        auto touchListener = EventListenerTouchOneByOne::create();
        touchListener->setSwallowTouches(true);
        touchListener->onTouchBegan =[this](Touch* touch, Event* event)
        {
            if (! _visible)
                return false;
            
            for (Node *c = this->_parent; c != nullptr; c = c->getParent())
            {
                if (c->isVisible() == false) return false;
            }
            Rect touchRect;
            touchRect.size=getContentSize();
            touchRect.origin=this->convertToWorldSpace(Vec2::ZERO);
            if (!touchRect.containsPoint(touch->getLocation()))
                return false;

            _isSrolling=false;
            Vec2 touchPoint=_containerNode->convertTouchToNodeSpace(touch);
            RichLabelData* richLabelData;
            for (auto iter=_richLabelDatasMap.begin(); iter!=_richLabelDatasMap.end(); iter++)
            {
                richLabelData=iter->second;
                touchRect.origin=richLabelData->position;
                touchRect.size=richLabelData->size;
                if (touchRect.containsPoint(touchPoint))
                {
                    if (!!m_oCallback)
                    {
                        m_oCallback(richLabelData->richLabelId);
                    }
                    _selectRichLabelData=richLabelData;
                    richLabelData->lineColor->setContentSize(richLabelData->size);
                    richLabelData->lineColor->setOpacity(100);
                    break;
                }
            }
            
            return true;
        };
        
        touchListener->onTouchEnded=[this](Touch* touch, Event* event)
        {
            this->retain();
            this->resetSelectRichLabelData();
            this->release();
        };
        
        touchListener->onTouchCancelled =[this](Touch* touch, Event* event)
        {
            this->retain();
            this->resetSelectRichLabelData();
            this->release();
        };
        
        touchListener->onTouchMoved =[this](Touch* touch, Event* event)
        {
            if (_isSrolling)
            {
                Vec2 delta=touch->getDelta();
                Vec2 position=_containerNode->getPosition();
                position.y+=delta.y;

                position.y=MAX(position.y,_minYposition);
                position.y=MIN(position.y,_maxYposition);
                _containerNode->setPosition(position);
 
                return;
            }
            if (_totalHeight<_height) {
                return;
            }
            
            Vec2 delta=touch->getLocation()-touch->getStartLocation();
            if (delta.length()>20.0f)
            {
                this->resetSelectRichLabelData();
                _isSrolling=true;
            }
        };
        
        _eventDispatcher->addEventListenerWithSceneGraphPriority(touchListener, this);
    }
    else
    {
        if(!_enableEvent) return;
        _eventDispatcher->removeEventListenersForTarget(this);
    }
    _enableEvent=enableEvent;
}

bool RichLabelsLayer::isEnableEvent()
{
    return _enableEvent;
}

void RichLabelsLayer::addEventListener(std::function<void(int richLabelId)> callback)
{
    m_oCallback=callback;
}



