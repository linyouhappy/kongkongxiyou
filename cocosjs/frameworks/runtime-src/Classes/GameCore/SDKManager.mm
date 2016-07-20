
#include "SDKManager.h"

#if (CC_TARGET_PLATFORM==CC_PLATFORM_IOS)
#import "AppController.h"

void showAdCallback(int skipped)
{
    SDKManager::getInstance()->onAdsCallback();
}


SDKManager* SDKManager::s_SDKManager=nullptr;

SDKManager::SDKManager()
:_sdkCallback(nullptr)
{
}

SDKManager::~SDKManager()
{
}

SDKManager* SDKManager::getInstance()
{
    if (s_SDKManager==nullptr)
    {
        s_SDKManager=SDKManager::create();
        s_SDKManager->retain();
    }
    return s_SDKManager;
}

SDKManager* SDKManager::create()
{
    SDKManager *pRet = new SDKManager();
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

bool SDKManager::init()
{
    _channelId=CHANNELTYPE;
    this->sdkInit();
	return true;
}

void SDKManager::addEventListener(std::function<void(int,int)> sdkCallback)
{
    _sdkCallback=sdkCallback;
}

void SDKManager::onAdsCallback()
{
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]{
        if (this->_sdkCallback)
        {
            this->_sdkCallback(kMSDKStateAdSuccess,0);
        }
    });
}

void SDKManager::onPayCallback(int payId)
{
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([=]{
        if (this->_sdkCallback)
        {
            this->_sdkCallback(kMSDKStatePaySuccess,payId);
        }
    });
}

void SDKManager::onLoginCallback(std::string username,std::string password)
{
    this->_userName=username;
    this->_password=password;
    
    Director::getInstance()->getScheduler()->performFunctionInCocosThread([this]{
        if (this->_sdkCallback)
        {
            this->_sdkCallback(kMSDKStateLoginSuccess,0);
        }
    });
    CCLOG("username=%s,password=%s",username.c_str(),password.c_str());
}

int SDKManager::getChannelId()
{
    return _channelId;
}

std::string SDKManager::getUserName()
{
    return _userName;
}

std::string SDKManager::getPassword()
{
    return _password;
}

std::string SDKManager::getDeviceModel()
{
    return "iOS";
}

void SDKManager::sdkInit()
{
    AppController* appController=(AppController*)[[UIApplication sharedApplication] delegate];
    RootViewController* rootViewController=appController.viewController;
    [rootViewController setAdCallback:showAdCallback];
}

void SDKManager::showAd()
{
    AppController* appController=(AppController*)[[UIApplication sharedApplication] delegate];
    RootViewController* rootViewController=appController.viewController;
    [rootViewController showAd];
}

void SDKManager::showRewardedAd()
{
    AppController* appController=(AppController*)[[UIApplication sharedApplication] delegate];
    RootViewController* rootViewController=appController.viewController;
    [rootViewController showRewardedAd];
}


#include "LoginScene.h"
void SDKManager::sdkLogin()
{
    LoginScene* loginScene=LoginScene::create();
    Director::getInstance()->replaceScene(loginScene);
    
    loginScene->addEventListener([this](std::string username,std::string password){
        this->onLoginCallback(username,password);
    });
}

void SDKManager::submitExtendData(const char* roleId,const char* roleName,int roleLevel)
{
    
}

void SDKManager::sdkLogout()
{
    
}

void SDKManager::sdkExit()
{
    
}

void SDKManager::sdkPay(int payId)
{
    CCLOG("sdkPay==========>>payId=%d",payId);
    onPayCallback(payId);
}

#endif
