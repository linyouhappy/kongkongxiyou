
#include "ItemBoxLayer.h"

//ItemBoxLayer
ItemBoxLayer::ItemBoxLayer()
:_itemBoxLayerState(ItemBoxLayerState::WAITING)
,_maxColumn(0)
,_maxRow(-1)
,_enableLock(false)
,_isCanScroll(true)
,_enableEvent(false)
,_limitRow(-1)
,_limitColumn(-1)
,_selectItemCallback(nullptr)
,_scrollType(1)
,_selectedItem(nullptr)
,_keepSelectEffect(true)
{
}

ItemBoxLayer::~ItemBoxLayer()
{
}

ItemBoxLayer* ItemBoxLayer::create()
{
	ItemBoxLayer *pRet = new ItemBoxLayer();
	if (pRet && pRet->init())
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

bool ItemBoxLayer::init()
{
	return true;
}

void ItemBoxLayer::enableEvent(bool enableEvent)
{
    if(enableEvent)
    {
        if(_enableEvent) return;
        
        auto touchListener = EventListenerTouchOneByOne::create();
        touchListener->setSwallowTouches(true);
        
        touchListener->onTouchBegan =[this](Touch* touch, Event* event)
        {
            if (_itemBoxLayerState!=ItemBoxLayerState::WAITING || ! _visible)
            {
                return false;
            }
            
            for (Node *c = this->_parent; c != nullptr; c = c->getParent())
            {
                if (c->isVisible() == false) return false;
            }
            
            touchRect.origin=getParent()->convertToWorldSpace(Vec2::ZERO);
            if (!touchRect.containsPoint(touch->getLocation()))
            {
                return false;
            }
            _isSrolling=false;
            
            if (_keepSelectEffect)
            {
                if (_selectedItem)
                    _selectedItem->unselected();
            }
            _selectedItem = this->getItemForTouch(touch);
            if (_selectedItem)
            {
                _selectedItem->selected();
                _itemBoxLayerState =ItemBoxLayerState::TRACKING_TOUCH;
                return true;
            }
            return true;
        };
        
        touchListener->onTouchEnded=[this](Touch* touch, Event* event)
        {
            this->retain();
            if (!_keepSelectEffect)
            {
                if (_selectedItem)
                    _selectedItem->unselected();
            }
            
            if (!_isSrolling && !!_selectedItem)
            {
                if (_selectItemCallback!=nullptr)
                {
                    _selectItemCallback(_selectedItem->getTag(),_selectedItem);
                }
            }
            
            _itemBoxLayerState =ItemBoxLayerState::WAITING;
            this->release();
        };
        
        touchListener->onTouchCancelled =[this](Touch* touch, Event* event)
        {
            this->retain();
            if (!_keepSelectEffect)
            {
                if (_selectedItem)
                    _selectedItem->unselected();
            }
            _itemBoxLayerState =ItemBoxLayerState::WAITING;
            this->release();
        };
        
        touchListener->onTouchMoved =[this](Touch* touch, Event* event)
        {
            if (_itemBoxLayerState==ItemBoxLayerState::MOVE_TOUCH || _isSrolling)
            {
                if(!_isCanScroll) return;
                if (_scrollType==1)
                {
                    Vec2 delta=touch->getDelta();
                    Vec2 position=getPosition();
                    position.y+=delta.y;
                    
                    position.y=MAX(position.y,_minYposition);
                    position.y=MIN(position.y,_maxYposition);
                    setPosition(position);
                }
                else
                {
                    Vec2 delta=touch->getDelta();
                    Vec2 position=getPosition();
                    position.x+=delta.x;
                    
                    position.x=MAX(position.x,_minXposition);
                    position.x=MIN(position.x,_maxXposition);
                    setPosition(position);
                }
                return;
            }
            ItemBox *currentItem = this->getItemForTouch(touch);
            Vec2 delta=touch->getLocation()-touch->getStartLocation();
            if (delta.length()>20.0f && currentItem != _selectedItem)
            {
                _isSrolling=true;
                if(_selectedItem)
                {
                    _selectedItem->unselected();
                    _selectedItem=nullptr;
                }
                _itemBoxLayerState = ItemBoxLayerState::MOVE_TOUCH;
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

bool ItemBoxLayer::isEnableEvent()
{
    return _enableEvent;
}

void ItemBoxLayer::setLimitRow(int limitRow)
{
    _limitRow=limitRow;
    _limitColumn=-1;
}

void ItemBoxLayer::setLimitColumn(int limitColumn)
{
    _limitRow=-1;
    _limitColumn=limitColumn;
}

void ItemBoxLayer::setViewSizeAndItemSize(Size viewSize, Size itemSize)
{
    _itemSize=itemSize;
    _viewSize=viewSize;
    
    //scroll vertical
    if (_limitColumn>0)
    {
        _minColumn=_limitColumn;
        _minRow=floor(viewSize.height*1.0f/itemSize.height);
    }
    else if(_limitRow>0)
    {
        _minColumn=floor(viewSize.width*1.0f/itemSize.width);
        _minRow=_limitRow;
    }
}

void ItemBoxLayer::setItemCount(int itemCount)
{
    int minItemCount=_minRow*_minColumn;
    if(itemCount<=minItemCount)
    {
        _maxRow=_minRow;
        _maxColumn=_minColumn;
    }
    else
    {
        if (_limitColumn>0)
        {
            _maxColumn=_minColumn;
            _maxRow=ceil(itemCount/_maxColumn);
        }
        else if(_limitRow>0)
        {
            _maxRow=_minRow;
            _maxColumn=ceil(itemCount/_maxRow);
        }
    }
    setContentSize(Size(_maxColumn*_itemSize.width,_maxRow*_itemSize.height));
    
    
    for (auto iter = _itemBoxsMap.begin(); iter != _itemBoxsMap.end(); ++iter)
    {
        iter->second->removeFromParent();
    }

    _itemCount=itemCount;
    
    int position=0;
    Vec2 point;
    ItemBox* itemBox=nullptr;
    Map<int,ItemBox*>::iterator findIter;
    for (int row=0; row<_maxRow; row++)
    {
        for (int column=0; column<_maxColumn; column++)
        {
            position=row*_maxColumn+column+1;
            findIter=_itemBoxsMap.find(position);
            if (findIter==_itemBoxsMap.end())
            {
                itemBox=ItemBox::create();
                itemBox->setDefaultSetting();
                _itemBoxsMap.insert(position, itemBox);
            }
            else
            {
                itemBox=findIter->second;
                itemBox->clearAllSetting();
                itemBox->removeFromParent();
            }
            this->addChild(itemBox);
            
            itemBox->setTag(position);
            
            point=Vec2(column*_itemSize.width+_itemSize.width/2,(_maxRow-row-1)*_itemSize.height+_itemSize.height/2);
            itemBox->setPosition(point);
        }
    }
    
    if (_scrollType==1)
    {
        float deltaHeight=_viewSize.height-_contentSize.height;
        if (deltaHeight>=0)
        {
            _isCanScroll=false;
            setPosition(Vec2(_position.x,deltaHeight));
        }
        else
        {
            _isCanScroll=true;
            _minYposition=deltaHeight;
            if(_itemBoxsMap.empty())
            {
                _maxYposition=0;
            }
            else
            {
                _maxYposition=_itemSize.height-_itemBoxsMap.at(1)->getContentSize().height;
            }
            setPosition(Vec2(_position.x,deltaHeight));
        }
    }else{
        float deltaWidth=_viewSize.width-_contentSize.width;
        if (deltaWidth>=0)
        {
            _isCanScroll=false;
            setPosition(Vec2(0,_position.y));
        }
        else
        {
            _isCanScroll=true;
            _minXposition=deltaWidth;
            if(_itemBoxsMap.empty())
            {
                _maxXposition=0;
            }
            else
            {
                _maxXposition=_itemSize.width-_itemBoxsMap.at(1)->getContentSize().width;
            }
            setPosition(Vec2(0,_position.y));
        }
    }
}

void ItemBoxLayer::setParent(Node* parent)
{
    Node::setParent(parent);
    
    touchRect.origin=parent->convertToWorldSpace(Vec2::ZERO);
    touchRect.size=parent->getContentSize();
}

void ItemBoxLayer::setIsCanScroll(bool isCanScroll)
{
	_isCanScroll=isCanScroll;
}

void ItemBoxLayer::setScrollType(int scrollType)
{
    _scrollType=scrollType;
}

void ItemBoxLayer::setKeepSelectEffect(bool enable)
{
    _keepSelectEffect=enable;
}

void ItemBoxLayer::cancelSelectEffect()
{
    if(_selectedItem)
    {
        _selectedItem->unselected();
    }
}

//void ItemBoxLayer::setLock(bool enableLock)
//{
//	_enableLock=enableLock;
//}

ItemBox* ItemBoxLayer::getItemBoxByPosition(int position)
{
    auto findIter=_itemBoxsMap.find(position);
    if (findIter==_itemBoxsMap.end())
        return nullptr;
    
    return findIter->second;
}

ItemBox* ItemBoxLayer::getItemBoxByItemId(int itemId)
{
    if (!_itemBoxsMap.empty())
    {
        ItemBox* child =nullptr;
        for (auto iter = _itemBoxsMap.begin(); iter != _itemBoxsMap.end(); ++iter)
        {
            child = dynamic_cast<ItemBox*>(iter->second);
            if (child && child->getItemId()==itemId)
            {
                return child;
            }
        }
    }
    return nullptr;
}

ItemBox* ItemBoxLayer::getItemForTouch(Touch *touch)
{
	if (!_itemBoxsMap.empty())
	{
        Vec2 touchLocation = touch->getLocation();
        Vec2 local;
        Size contentSize;
        Rect rect;
        ItemBox* child =nullptr;
        
		for (auto iter = _itemBoxsMap.begin(); iter != _itemBoxsMap.end(); ++iter)
		{
			child = dynamic_cast<ItemBox*>(iter->second);
			if (child && child->isVisible())
			{
                local = child->convertToNodeSpace(touchLocation);
                contentSize=child->getContentSize();
                rect.origin.x=-contentSize.width/2;
                rect.origin.y=-contentSize.height/2;
                rect.size.width=contentSize.width;
                rect.size.height=contentSize.height;
				if (rect.containsPoint(local))
				{
					return child;
				}
			}
		}
	}
	return nullptr;
}

void ItemBoxLayer::addEventListener(std::function<void(int,ItemBox*)> selectItemCallback)
{
    _selectItemCallback=selectItemCallback;
}
