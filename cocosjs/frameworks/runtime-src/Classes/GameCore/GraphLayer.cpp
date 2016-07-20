
#include "GraphLayer.h"

//GraphLayer
GraphLayer::GraphLayer()
:_enableEvent(false)
,_eventCallback(nullptr)
,_pointCount(25)
{
}

GraphLayer::~GraphLayer()
{
}

GraphLayer* GraphLayer::create(int width, int height)
{
	GraphLayer *pRet = new GraphLayer();
	if (pRet && pRet->init(width,height))
	{
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

bool GraphLayer::init(int width, int height)
{
    _width=width;
    _height=height;
    _amountHeight=100;
    _graphHeight=_height-_amountHeight;
//    LayerColor* layerColor=LayerColor::create(Color4B::BLUE, width, height);
//    this->addChild(layerColor);
    
    _drawNode = DrawNode::create();
    this->addChild(_drawNode);
    _amountDrawNode=DrawNode::create();
    this->addChild(_amountDrawNode);
    _boxDrawNode=DrawNode::create();
    this->addChild(_boxDrawNode);
    
    _labelMinY=Label::createWithSystemFont("0", "Arial", 22);
    _labelMinY->setAnchorPoint(Vec2(0, 0));
    _labelMinY->setPosition(Vec2(0, _amountHeight+5));
    this->addChild(_labelMinY);
    
    _labelMaxY=Label::createWithSystemFont("0", "Arial", 22);
    _labelMaxY->setAnchorPoint(Vec2(0, 1));
    _labelMaxY->setPosition(Vec2(0, height));
    this->addChild(_labelMaxY);
    
    _labelMinX=Label::createWithSystemFont("00:00", "Arial", 22);
    _labelMinX->setAnchorPoint(Vec2(0, 1));
    _labelMinX->setPosition(Vec2(0, -3));
    this->addChild(_labelMinX);
    
    _labelMaxX=Label::createWithSystemFont("00:00", "Arial", 22);
    _labelMaxX->setAnchorPoint(Vec2(1, 1));
    _labelMaxX->setPosition(Vec2(width, -3));
    this->addChild(_labelMaxX);
    
	return true;
}

void GraphLayer::setPointCount(int pointCount)
{
    _pointCount=pointCount;
}

void GraphLayer::addEventListener(const std::function<void(int)>& callback)
{
    _eventCallback=callback;
}

void GraphLayer::setAmountHeight(int amountHeight)
{
    _amountHeight=amountHeight;
    _graphHeight=_height-_amountHeight;
    _labelMinY->setPosition(Vec2(0, _amountHeight+5));
}

void GraphLayer::setMinXString(const char* minXString)
{
    _labelMinX->setString(minXString);
}

void GraphLayer::setMaxXString(const char* maxXString)
{
    _labelMaxX->setString(maxXString);
}

void GraphLayer::addData(int x,int openValue,int closeValue,int minValue,int maxValue,int amount)
{
    MarketData marketData;
    marketData.x=x;
    marketData.openValue=openValue;
    marketData.closeValue=closeValue;
    marketData.maxValue=maxValue;
    marketData.minValue=minValue;
    marketData.amount=amount;
    marketData.average=(int)round((maxValue+minValue)/2);
    _marketDatasMap[x]=marketData;
}

void GraphLayer::clearData()
{
    _marketDatasMap.clear();
}

//void GraphLayer::clearDraw()
//{
//    _drawNode->clear();
//    _amountDrawNode->clear();
//    _boxDrawNode->clear();
//}

void GraphLayer::enableEvent(bool enableEvent)
{
    if(enableEvent)
    {
        if(_enableEvent) return;
        
        auto touchListener = EventListenerTouchOneByOne::create();
        touchListener->setSwallowTouches(true);
        touchListener->onTouchBegan =[this](Touch* touch, Event* event)
        {
            for (Node *c = this->_parent; c != nullptr; c = c->getParent())
            {
                if (c->isVisible() == false)
                {
                    return false;
                }
            }
            Vec2 nodePoint=_boxDrawNode->convertTouchToNodeSpace(touch);
            if (nodePoint.x>0 && nodePoint.x<_width && nodePoint.y>0 && nodePoint.y<_height) {
                return true;
            }
            return false;
        };
        touchListener->onTouchCancelled=[this](Touch* touch, Event* event)
        {
        };
        touchListener->onTouchEnded=[this](Touch* touch, Event* event)
        {
            Vec2 nodePoint=_boxDrawNode->convertTouchToNodeSpace(touch);
            this->drawTouchPoint(nodePoint);
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

void GraphLayer::refreshData()
{
    _drawNode->clear();
    _amountDrawNode->clear();
    _boxDrawNode->clear();
    int curPointCount=_marketDatasMap.size();
    if(curPointCount==0)
    {
        Color4F whiteColor=Color4F::WHITE;
        _boxDrawNode->drawRect(Vec2::ZERO, Vec2(_width,_height), whiteColor);
        _boxDrawNode->drawLine(Vec2(0,_amountHeight), Vec2(_width,_amountHeight),whiteColor);
        return;
    }
    
    _minX=99999999;
    _maxX=0;
    _minY=99999999;
    _maxY=0;
    _maxAmount=0;
    
    for(auto iter:_marketDatasMap)
    {
        _minX=std::min(iter.second.x,_minX);
        _maxX=std::max(iter.second.x,_maxX);
        _minY=std::min(iter.second.minValue,_minY);
        _maxY=std::max(iter.second.maxValue,_maxY);
        _maxAmount=std::max(iter.second.amount,_maxAmount);
    }
    
    if(_minX==_maxX)
        _maxX=_minX+100;
    
    if (_maxY==_minY)
        _maxY=_minY+100;
    
    float valueX=(_maxX-_minX)*_pointCount/curPointCount;
    float valueY=_maxY-_minY;
    
    _deltaX=(_width-20)/valueX;
    _deltaY=(_graphHeight-20)/valueY;
    _drawNode->setPosition(Vec2(10,10+_amountHeight));
    _amountDrawNode->setPosition(Vec2(10, 0));
    
    float deltaAmount=(_amountHeight-10)*1.0/_maxAmount;
    
    _deltaPointX=valueX/(_width-20);
    _deltaPointY=valueY/(_graphHeight-20);
    
    char chars[64]={};
    sprintf(chars, "%d",_minY);
    _labelMinY->setString(chars);
    sprintf(chars, "%d",_maxY);
    _labelMaxY->setString(chars);
    
    Vec2 fromPoint;
    Vec2 toPoint;
    Color4F greenColor=Color4F::GREEN;
    Color4F redColor=Color4F::RED;
    Color4F whiteColor=Color4F::WHITE;
    MarketData* marketData;
    Vec2 origin;
    Vec2 destination;

    map<int,MarketData>::iterator nextIter;
    for(auto iter=_marketDatasMap.begin();iter!=_marketDatasMap.end();iter++)
    {
        marketData=&iter->second;
        
        fromPoint.x=(marketData->x-_minX)*_deltaX;
        toPoint.x=fromPoint.x;
        if (marketData->closeValue>=marketData->openValue)
        {
            if (marketData->openValue>marketData->minValue)
            {
                fromPoint.y=(marketData->minValue-_minY)*_deltaY;
                toPoint.y=(marketData->openValue-_minY)*_deltaY;
                _drawNode->drawLine(fromPoint, toPoint,redColor);
            }
            
            if (marketData->closeValue<marketData->maxValue)
            {
                fromPoint.y=(marketData->closeValue-_minY)*_deltaY;
                toPoint.y=(marketData->maxValue-_minY)*_deltaY;
                _drawNode->drawLine(fromPoint, toPoint,redColor);
            }
            
            origin.y=(marketData->closeValue-_minY)*_deltaY;
            destination.y=(marketData->openValue-_minY)*_deltaY;
            
            origin.x=fromPoint.x-5;
            destination.x=toPoint.x+5;
            _drawNode->drawRect(origin, destination, redColor);
//            _drawNode->drawSolidRect(origin, destination, redColor);
            
            origin.y=0;
            destination.y=marketData->amount*deltaAmount;
            _amountDrawNode->drawRect(origin, destination, redColor);
//            _amountDrawNode->drawSolidRect(origin, destination, redColor);
        }
        else
        {
            if (marketData->closeValue>marketData->minValue)
            {
                fromPoint.y=(marketData->minValue-_minY)*_deltaY;
                toPoint.y=(marketData->closeValue-_minY)*_deltaY;
                _drawNode->drawLine(fromPoint, toPoint,greenColor);
            }
            
            if (marketData->openValue<marketData->maxValue)
            {
                fromPoint.y=(marketData->openValue-_minY)*_deltaY;
                toPoint.y=(marketData->maxValue-_minY)*_deltaY;
                _drawNode->drawLine(fromPoint, toPoint,greenColor);
            }
            
            origin.y=(marketData->openValue-_minY)*_deltaY;
            destination.y=(marketData->closeValue-_minY)*_deltaY;
            
            origin.x=fromPoint.x-5;
            destination.x=toPoint.x+5;
            _drawNode->drawSolidRect(origin, destination, greenColor);
            
            origin.y=0;
            destination.y=marketData->amount*deltaAmount;
            _amountDrawNode->drawSolidRect(origin, destination, greenColor);
        }
        nextIter=iter;
        nextIter++;
        if (nextIter!=_marketDatasMap.end())
        {
            fromPoint.y=(marketData->average-_minY)*_deltaY;
            
            marketData=&nextIter->second;
            toPoint.x=(marketData->x-_minX)*_deltaX;
            toPoint.y=(marketData->average-_minY)*_deltaY;
             _drawNode->drawLine(fromPoint, toPoint,whiteColor);
        }
    }
    
    _boxDrawNode->drawRect(Vec2::ZERO, Vec2(_width,_height), whiteColor);
    _boxDrawNode->drawLine(Vec2(0,_amountHeight), Vec2(_width,_amountHeight),whiteColor);
}

void GraphLayer::drawTouchPoint(Vec2& point)
{
    _boxDrawNode->clear();
    
    Color4F whiteColor=Color4F::WHITE;
    _boxDrawNode->drawRect(Vec2::ZERO, Vec2(_width,_height), whiteColor);
    _boxDrawNode->drawLine(Vec2(0,_amountHeight), Vec2(_width,_amountHeight),whiteColor);

    Vec2 origin=point-Vec2(10, 10);
    int searchX=round(origin.x*_deltaPointX+_minX);
    auto nextIter=_marketDatasMap.find(searchX);
    if (nextIter!=_marketDatasMap.end())
    {
        point.x=(searchX-_minX)*_deltaX;
        point=point+Vec2(10,0);
        point.y=std::max(point.y,0.0f);
        point.y=std::min(point.y,(float)_height);
        
        Color4F blueColor=Color4F::ORANGE;
        _boxDrawNode->drawRect(Vec2(0,point.y), Vec2(_width,point.y), blueColor);
        _boxDrawNode->drawRect(Vec2(point.x,0), Vec2(point.x,_height), blueColor);
        
        if(_eventCallback)
            _eventCallback(searchX);
    }
}
