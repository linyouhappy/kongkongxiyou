
#include "ItemBox.h"

std::string ItemBox::_defaultBgSpriteName="bg_box.png";
std::string ItemBox::_defaultArrowSpriteName="arrow_big_green.png";
std::string ItemBox::_defaultSelectSpriteName="box_select.png";

//ItemBox
ItemBox::ItemBox()
:_arrowSprite(nullptr)
,_lockSprite(nullptr)
,_enableEvent(false)
,_rightUpLabel(nullptr)
,_rightDownLabel(nullptr)
,_bgSprite(nullptr)
,_colorSprite(nullptr)
,_iconSprite(nullptr)
,_bgContentSize(Size(82,82))
,_nameLabel(nullptr)
,_selectSprite(nullptr)
,_itemId(-1)
,_itemBoxCallback(nullptr)
,_isKeepSelect(false)
,_jobSprite(nullptr)
{
}

ItemBox::~ItemBox()
{
}

ItemBox* ItemBox::create()
{
	ItemBox *pRet = new ItemBox();
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

bool ItemBox::init()
{    
//    auto label=Label::createWithSystemFont("+","Arial",32);
//    this->addChild(label);
	return true;
}

void ItemBox::setItemId(int itemId)
{
    _itemId=itemId;
}

int ItemBox::getItemId()
{
    return _itemId;
}


void ItemBox::setDefaultSetting()
{
    setBgSprite(ItemBox::_defaultBgSpriteName.c_str());
}

void ItemBox::setGeneralLabelString(Label*& label,const char* labelString)
{
    if (!labelString)
    {
        if (!!label)
            label->setVisible(false);
        
        return;
    }
    
    if (!label)
    {
        label=Label::createWithSystemFont(labelString,"Arial",20);
        this->addChild(label);
        label->enableOutline(Color4B(0,0,0,255),3);
    }
    else
    {
        label->setString(labelString);
        label->setVisible(true);
    }
}

void ItemBox::setGeneralSprite(Sprite*& sprite,const char* spriteName)
{
    while (true)
    {
        if (!spriteName)
            break;
        
        char* findChars=strstr(spriteName,"/");
        if (findChars==NULL)
        {
            SpriteFrame* spriteFrame=SpriteFrameCache::getInstance()->getSpriteFrameByName(spriteName);
            if (!spriteFrame)
                break;
            
//            if (!!sprite)
//            {
//                sprite->setVisible(true);
//                sprite->setSpriteFrame(spriteFrame);
//            }
//            else
//            {
                if(!!sprite)
                    this->removeChild(sprite);
            
                sprite=Sprite::createWithSpriteFrame(spriteFrame);
                this->addChild(sprite);
//            }
        }
        else
        {
            Texture2D* texture2D=Director::getInstance()->getTextureCache()->addImage(spriteName);
            if(!texture2D)
                break;
            
            if(!!sprite)
                this->removeChild(sprite);
            
            sprite=Sprite::createWithTexture(texture2D);
            this->addChild(sprite);
        }
        return;
    }
    
    if (!!sprite)
        sprite->setVisible(false);
}

void ItemBox::setColorSprite(const char* colorSpriteName)
{
    setGeneralSprite(_colorSprite,colorSpriteName);
    if (!!_colorSprite && _colorSprite->isVisible())
    {
        _colorSprite->setName("colorSprite");
//        _colorSprite->setPosition(_bgContentSize.width/2,_bgContentSize.height/2);
        _colorSprite->setLocalZOrder(1);
//        _colorSprite->setOpacity(200);
    }
}

void ItemBox::setBgSprite(const char* bgSpriteName)
{
    setGeneralSprite(_bgSprite,bgSpriteName);
    if (!!_bgSprite && _bgSprite->isVisible())
    {
        _bgSprite->setName("bgSprite");
        _bgContentSize=_bgSprite->getContentSize();
        setContentSize(_bgContentSize);
//        _bgSprite->setAnchorPoint(Vec2(0.0f,0.0f));
    }
}

void ItemBox::setIconSprite(const char* iconSpriteName)
{
    setGeneralSprite(_iconSprite,iconSpriteName);
    if (!!_iconSprite && _iconSprite->isVisible())
    {
        _iconSprite->setName("iconSprite");
//        _iconSprite->setPosition(_bgContentSize.width/2,_bgContentSize.height/2);
        _iconSprite->setLocalZOrder(3);
    }
}

void ItemBox::setArrowSprite(const char* spriteName)
{
    setGeneralSprite(_arrowSprite,spriteName);
    if (!!_arrowSprite && _arrowSprite->isVisible())
    {
        _arrowSprite->setName("arrowSprite");
        Vec2 position=Vec2(_bgContentSize.width/2-18.0f,_bgContentSize.height/2-20.0f);
        _arrowSprite->setPosition(position);
        _arrowSprite->stopAllActions();
        _arrowSprite->setLocalZOrder(5);
        
        MoveTo* moveTo=MoveTo::create(0.2f,position);
        MoveTo* reverseMoveTo=MoveTo::create(0.5f,position-Vec2(0.0f,12.0f));
        _arrowSprite->runAction(RepeatForever::create(Sequence::create(moveTo,reverseMoveTo,nullptr)));
    }
}

void ItemBox::setLockSprite(const char* spriteName)
{
    setGeneralSprite(_lockSprite,spriteName);
    if (!!_lockSprite && _lockSprite->isVisible())
    {
        _lockSprite->setName("lockSprite");
//        _lockSprite->setPosition(_bgContentSize.width/2,_bgContentSize.height/2);
        _lockSprite->setLocalZOrder(5);
    }
}

void ItemBox::setSelectSprite(const char* spriteName)
{
    setGeneralSprite(_selectSprite,spriteName);
    if (!!_selectSprite && _selectSprite->isVisible())
    {
        _selectSprite->setName("selectSprite");
//        _selectSprite->setPosition(_bgContentSize.width/2,_bgContentSize.height/2);
        _selectSprite->setLocalZOrder(4);
    }
}

void ItemBox::setRightUpLabelString(const char* labelString)
{
    setGeneralLabelString(_rightUpLabel,labelString);
    if (!!_rightUpLabel && _rightUpLabel->isVisible())
    {
        _rightUpLabel->setName("rightUpLabel");
        _rightUpLabel->setPosition(_bgContentSize.width/2-3.0f,_bgContentSize.height/2-2.0f);
        _rightUpLabel->setAnchorPoint(Vec2(1.0f,1.0f));
        _rightUpLabel->setLocalZOrder(4);
    }
}

void ItemBox::setRightDownLabelString(const char* labelString)
{
    setGeneralLabelString(_rightDownLabel,labelString);
    if (!!_rightDownLabel && _rightDownLabel->isVisible())
    {
        _rightDownLabel->setName("rightDownLabel");
        _rightDownLabel->setPosition(_bgContentSize.width/2-5.0f,-_bgContentSize.height/2+2.0f);
        _rightDownLabel->setAnchorPoint(Vec2(1.0f,0.0f));
        _rightDownLabel->setLocalZOrder(4);
    }
}

void ItemBox::enableIconSprite(bool enable)
{
    if(!!_iconSprite)
    {
        if (enable)
            _iconSprite->setVisible(true);
        else
            _iconSprite->setVisible(false);
    }
}

void ItemBox::enableColorSprite(bool enable)
{
    if(!!_colorSprite)
    {
        if (enable)
            _colorSprite->setVisible(true);
        else
            _colorSprite->setVisible(false);
    }
}

void ItemBox::enableArrowSprite(bool enable)
{
    if(!!_arrowSprite)
    {
        if (enable)
            _arrowSprite->setVisible(true);
        else
            _arrowSprite->setVisible(false);
    }
    else if(enable)
    {
        this->setArrowSprite(ItemBox::_defaultArrowSpriteName.c_str());
    }
}

void ItemBox::enableLockSprite(bool enable)
{
    if(!!_lockSprite)
    {
        if (enable)
            _lockSprite->setVisible(true);
        else
            _lockSprite->setVisible(false);
    }
}

void ItemBox::enableSelectSprite(bool enable)
{
    if(!!_selectSprite)
    {
        if (enable)
            _selectSprite->setVisible(true);
        else
            _selectSprite->setVisible(false);
    }
    else if(enable)
    {
        this->setSelectSprite(ItemBox::_defaultSelectSpriteName.c_str());
    }
}

void ItemBox::enableRightDownLabel(bool enable)
{
    if(!!_rightDownLabel)
    {
        if (enable)
            _rightDownLabel->setVisible(true);
        else
            _rightDownLabel->setVisible(false);
    }
}

void ItemBox::enableRightUpLabel(bool enable)
{
    if(!!_rightUpLabel)
    {
        if (enable)
            _rightUpLabel->setVisible(true);
        else
            _rightUpLabel->setVisible(false);
    }
}

void ItemBox::enableKeepSelect(bool enable)
{
    _isKeepSelect=enable;
    enableSelectSprite(enable);
}

void ItemBox::setNameLabelString(const char* labelString)
{
    setGeneralLabelString(_nameLabel,labelString);
    if (!!_nameLabel && _nameLabel->isVisible())
    {
        _nameLabel->setName("nameLabel");
        _nameLabel->setPosition(_bgContentSize.width/2,-10.0f);
    }
}

void ItemBox::activate()
{
	if(_itemBoxCallback!=nullptr)
	{
		_itemBoxCallback(this);
	}
}

void ItemBox::selected()
{
    if (_isKeepSelect) return;
    
    enableSelectSprite(true);
}

void ItemBox::unselected()
{
    if (_isKeepSelect) return;
    
    enableSelectSprite(false);
}

void ItemBox::enableEvent(bool enableEvent)
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
			Vec2 nodePoint=this->convertTouchToNodeSpace(touch);
			Rect rect(-_contentSize.width/2, -_contentSize.height/2, _contentSize.width, _contentSize.height);
			if (rect.containsPoint(nodePoint))
			{
				this->selected();
				return true;
			}
			return false;
		};
		touchListener->onTouchCancelled=[this](Touch* touch, Event* event)
		{
			this->unselected();
		};
		touchListener->onTouchEnded=[this](Touch* touch, Event* event)
		{
			this->activate();
			this->unselected();
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

bool ItemBox::isEnableEvent()
{
    return _enableEvent;
}

void ItemBox::addEventListener(std::function<void(ItemBox*)> itemBoxCallback)
{
    _itemBoxCallback=itemBoxCallback;
}

void ItemBox::setDefaultBgSprite(const char* spriteName)
{
    ItemBox::_defaultBgSpriteName=spriteName;
}

void ItemBox::setDefaultArrowSprite(const char* spriteName)
{
    ItemBox::_defaultArrowSpriteName=spriteName;
}

void ItemBox::setDefaultSelectSprite(const char* spriteName)
{
    ItemBox::_defaultSelectSpriteName=spriteName;
}

Sprite* ItemBox::getIconSprite()
{
    return _iconSprite;
}

void ItemBox::adjustIconSprite(int iconSize)
{
    _iconSprite->setScale(iconSize/_iconSprite->getContentSize().width);
}

void ItemBox::clearAllSetting()
{
    _itemId=-1;
    _isKeepSelect=false;
    enableIconSprite(false);
    enableColorSprite(false);
    enableArrowSprite(false);
    enableLockSprite(false);
    enableSelectSprite(false);
    enableRightDownLabel(false);
    enableRightUpLabel(false);
    enableEvent(false);
    enableJobSprite(false);
}

void ItemBox::enableJobSprite(bool enable)
{
    if(!!_jobSprite)
    {
        if (enable)
            _jobSprite->setVisible(true);
        else
            _jobSprite->setVisible(false);
    }
}

void ItemBox::showJobId(int jobId)
{
    char spriteFrameName[128]={};
    sprintf(spriteFrameName, "icon_job_%d.png",jobId);
    setGeneralSprite(_jobSprite,spriteFrameName);
    if (!!_jobSprite && _jobSprite->isVisible())
    {
        _jobSprite->setName("jobSprite");
        _jobSprite->setPosition(_bgContentSize.width/2-5.0f,-_bgContentSize.height/2+4.0f);
        _jobSprite->setAnchorPoint(Vec2(1.0f,0.0f));
        _jobSprite->setLocalZOrder(4);
    }
}

