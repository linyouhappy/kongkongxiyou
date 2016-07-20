#include "WelcomeScene.h"

WelcomeScene::WelcomeScene()
:_callback(nullptr)
{
}

WelcomeScene::~WelcomeScene()
{
}


WelcomeScene* WelcomeScene::create()
{
    WelcomeScene *pRet = new WelcomeScene();
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

bool WelcomeScene::init()
{
    LayerColor* layerColor=LayerColor::create(Color4B::BLACK);
    this->addChild(layerColor);
    
    Node* ccsNode=CSLoader::createNode("uiccs/WelcomeScene.csb");
    Size winSize=Director::getInstance()->getWinSize();
    ccsNode->setPosition(winSize.width/2,winSize.height/2);
    addChild(ccsNode);
    
    this->runAction(Sequence::create(DelayTime::create(3),CallFunc::create([this]{
        if (_callback) {
            _callback();
        }
    }), NULL));
	return true;
}

void WelcomeScene::addEventListener(std::function<void()> callback)
{
    _callback=callback;
}


