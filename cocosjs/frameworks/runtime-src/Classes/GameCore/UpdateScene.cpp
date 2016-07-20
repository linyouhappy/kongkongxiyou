#include "UpdateScene.h"
#include "CUpdateManager.h"
#include "CommonLib.h"
//#include "CodeIDESupport.h"

#include "tinyxml2/tinyxml2.h"

using namespace tinyxml2;


void showTipsBox(const char* msg,std::function<void(bool)> callback)
{
    auto runningScene = Director::getInstance()->getRunningScene();
    auto nodeContainer = runningScene->getChildByTag(44138);
    if (!!nodeContainer)
        runningScene->removeChildByTag(74138, true);
    
    Size winSize=Director::getInstance()->getWinSize();

    auto ccsNode = CSLoader::createNode("uiccs/TipsBoxLayer.csb");
    runningScene->addChild(ccsNode);
    
    ccsNode->setLocalZOrder(1000);
    ccsNode->setTag(74138);
    ccsNode->setPosition(winSize.width / 2, winSize.height / 2);
    
    ui::Text* msgText = (ui::Text*)ccsNode->getChildByName("msgText");
    msgText->setString(msg);
    msgText->setTextAreaSize(Size(320,150));
    
    std::function<void()> closeTipsBox = [=](){
        runningScene->removeChildByTag(74138);
    };
    
    ui::Button* yesBtn = (ui::Button*)ccsNode->getChildByName("yesBtn");
    std::function<void(Ref*,ui::Widget::TouchEventType)> touchEvent = [=](Ref* sender,ui::Widget::TouchEventType type) {
        if (type ==ui::Widget::TouchEventType::ENDED) {
            if (callback) {
                callback(true);
            }
            closeTipsBox();
        }
    };
    yesBtn->addTouchEventListener(touchEvent);
    
    auto touchListener = EventListenerTouchOneByOne::create();
    touchListener->setSwallowTouches(true);
    touchListener->onTouchBegan =[=](Touch* touch, Event* event){
        return true;
    };

    auto eventDispatcher = Director::getInstance()->getEventDispatcher();
    eventDispatcher->addEventListenerWithSceneGraphPriority(touchListener, ccsNode);
}


UpdateScene::UpdateScene()
:_callback(nullptr)
,_updateType(0)
,_lastSecond(0.0)
{
}

UpdateScene::~UpdateScene()
{
}


UpdateScene* UpdateScene::create()
{
    UpdateScene *pRet = new UpdateScene();
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

bool UpdateScene::init()
{
    Node* ccsNode=CSLoader::createNode("uiccs/UpdateScene.csb");
    Size winSize=Director::getInstance()->getWinSize();
    ccsNode->setPosition(winSize.width/2,winSize.height/2);
    addChild(ccsNode);
    
    _loadingText=(ui::Text*)ccsNode->getChildByName("loadingText");
    _loadingBar=(ui::LoadingBar*)ccsNode->getChildByName("loadingBar");
    _tipsText=(ui::Text*)ccsNode->getChildByName("tipsText");
    
    
    ui::TextField* textField=(ui::TextField*)ccsNode->getChildByName("textField");
    ui::Button* changeIdBtn=(ui::Button*)ccsNode->getChildByName("changeIdBtn");
//#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
    textField->removeFromParent();
    changeIdBtn->removeFromParent();
//#else
//    changeIdBtn->addTouchEventListener([=](Ref* sender,ui::Widget::TouchEventType eventType){
//        if(eventType==ui::Widget::TouchEventType::ENDED)
//        {
//            std::string ip=textField->getString();
//            if (ip.length()>0) {
//                UserDefault::getInstance()->setStringForKey("ip",ip);
//                CommonLib::setServerURL(ip.c_str());
//            }
//            this->startUpdate();
//        }
//    });
//    std::string ip=UserDefault::getInstance()->getStringForKey("ip");
//    if(ip.length()>0)
//    {
//        CommonLib::setServerURL(ip.c_str());
//    }
//#endif
    
    while (true)
    {
        std::string fullpath=FileUtils::getInstance()->fullPathForFilename("updateTips.xml");
        if (!FileUtils::getInstance()->isFileExist(fullpath))
            break;
        
        tinyxml2::XMLDocument xmlDoc;
        if(XML_SUCCESS!=xmlDoc.LoadFile(fullpath.c_str()))
            break;
        
        XMLElement *pRootObject = xmlDoc.RootElement();
        if( pRootObject == NULL )
            break;
        
        if( !pRootObject->NoChildren() )
        {
            for( XMLElement *pChildElement = pRootObject->FirstChildElement()
                ; pChildElement != NULL ; pChildElement = pChildElement->NextSiblingElement())
            {
                const char* word=pChildElement->Attribute("word");
                _tipsWordVector.push_back(word);
            }
        }
        break;
    }
	return true;
}

void UpdateScene::showUpdateInfo(float nowDown, float totalDown,const char* msg)
{
    float percent = nowDown * 100 / totalDown;
    _loadingBar->setPercent(percent);
    _loadingText->setString(msg);
}

void UpdateScene::checkResUpdate()
{
    _loadingText->setString("正在获取服务器信息。。。");
    double currentSecond=CommonLib::currentSecond();
    if (currentSecond<_lastSecond)
    {
        this->stopAllActions();
        this->runAction(Sequence::create(
                        DelayTime::create(_lastSecond-currentSecond),
                        CallFunc::create([=](){
                            this->checkResUpdate();
                        }),
                        NULL));
        
        return;
    }
    _lastSecond=currentSecond+2;
    const char* serverURL=CommonLib::getServerURL();
    char url[256]={};
    sprintf(url, "http://%s:3001",serverURL);
    CUpdateManager::getInstance()->checkResUpdate(url);
    
    this->schedule([=](float deltaTime){
        
        int count=_tipsWordVector.size();
        int index=floor(CCRANDOM_0_1()*count);
        if (count>0 && count>index) {
            std::string& word=_tipsWordVector.at(index);
            _tipsText->setString(word);
        }
        
    }, 2,"kUpdateScene");
}

void UpdateScene::startUpdate()
{
    CUpdateManager* updateManager=CUpdateManager::getInstance();
    updateManager->addEventListener([=](int carryType, int nowDown, int totalDown, const char* msg){
        if (carryType == kCarryGetUpdateFailValue)
        {
            showTipsBox(msg,[=](bool isYesOrNo){
                this->checkResUpdate();
            });
        }
        else if (carryType==kCarryUpdateTipsValue)
        {
            //kUpdateNone=5
            if (nowDown==5)
            {
                CCLOG("no update star the game===>>");
                this->runGameAPP(kCarryUpdateTipsValue);
                // kUpdateNormal=1,
            }
            else if (nowDown==1)
            {
                showTipsBox(msg,[=](bool isYesOrNo){
                    if (isYesOrNo)
                        updateManager->startDownload();
                    else
                        this->runGameAPP(kCarryUpdateTipsValue);
                });
                
                // kUpdateVesionFileNoExist=0,
                // kUpdateVesionFileError=2,
                // kUpdateNeedApp=3,
            }
            else if (nowDown == 0 || nowDown==2 || nowDown==3)
            {
                showTipsBox(msg,nullptr);
                
                // kUpdateForce=4,
            }else if (nowDown==4) {
                showTipsBox(msg,[=](bool isYesOrNo){
                    updateManager->startDownload();
                });
            }
        }
        else if (carryType ==kCarryProgressValue)
        {
            this->showUpdateInfo(nowDown, totalDown, msg);
        }
        else if (carryType == kCarryFinishValue)
        {
            this->runGameAPP(kCarryFinishValue);
        }
        else if (carryType == kCarryFailedValue)
        {
            showTipsBox(msg,[=](bool isYesOrNo){
                updateManager->startDownload();
            });
        }
    });
    this->checkResUpdate();
}

void UpdateScene::setUpdateType(int type)
{
    _updateType=type;
}

void UpdateScene::onEnter()
{
    Scene::onEnter();
    
    this->startUpdate();
}

void UpdateScene::runGameAPP(int updateCBType)
{
    CCLOG("runGameAPP========>>>");
    _loadingBar->setPercent(100);
    _loadingText->setString("连接服务器成功!");
    if(_callback)
        _callback(updateCBType);
    
    CUpdateManager::deleteInstance();
}

void UpdateScene::addEventListener(std::function<void(int)> callback)
{
    _callback=callback;
}


