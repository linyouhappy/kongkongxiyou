#include "LoginScene.h"
#include "CommonLib.h"

LoginScene::LoginScene()
{
}

LoginScene::~LoginScene()
{
    CommonLib::removeRes("uiimg/app_login.plist");
}

LoginScene* LoginScene::create()
{
    LoginScene *pRet = new LoginScene();
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

bool LoginScene::init()
{
    Node* ccsNode=CSLoader::createNode("uiccs/LoginLayer.csb");
    Size winSize=Director::getInstance()->getWinSize();
    ccsNode->setPosition(winSize.width/2,winSize.height/2);
    addChild(ccsNode);
    
    _nameTextField=(ui::TextField*)ccsNode->getChildByName("_nameTextField");
    _psTextField=(ui::TextField*)ccsNode->getChildByName("_psTextField");
    _ipTextField=(ui::TextField*)ccsNode->getChildByName("_ipTextField");
    
    std::function<void(const char*,const char*,ui::TextField*)> restoreData;
    restoreData=[](const char* key,const char* defaultValue,ui::TextField* textField){
        std::string userName=UserDefault::getInstance()->getStringForKey(key);
        if (userName.length()==0)
        {
            UserDefault::getInstance()->setStringForKey(key,defaultValue);
            textField->setString(defaultValue);
        }
        else
        {
            textField->setString(userName);
        }
    };

    restoreData("userName","",_nameTextField);
    restoreData("password","",_psTextField);
//    restoreData("ip","0.0.0.0",_ipTextField);

    ui::Button* _loginButton=(ui::Button*)ccsNode->getChildByName("_loginButton");
    _loginButton->setPressedActionEnabled(true);
    _loginButton->addTouchEventListener([=](Ref* sender,ui::Widget::TouchEventType eventType){
        if(eventType==ui::Widget::TouchEventType::ENDED)
        {
            this->loginGame();
        }
    });
    
	return true;
}

void LoginScene::loginGame()
{
    std::string username=_nameTextField->getString();
    std::string password=_psTextField->getString();
    UserDefault::getInstance()->setStringForKey("userName",username);
    UserDefault::getInstance()->setStringForKey("password",password);
//    std::string ip=_ipTextField->getString();
//    if (ip!="0.0.0.0")
//    {
//        UserDefault::getInstance()->setStringForKey("ip",ip);
//        CommonLib::setServerURL(ip.c_str());
//    }
    if (_callback)
    {
        _callback(username,password);
    }
}

void LoginScene::addEventListener(std::function<void(std::string,std::string)> callback)
{
    _callback=callback;
}


