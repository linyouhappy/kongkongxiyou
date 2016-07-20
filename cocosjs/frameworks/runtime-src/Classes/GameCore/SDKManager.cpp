

#include "SDKManager.h"

#if (CC_TARGET_PLATFORM!=CC_PLATFORM_IOS)


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
	return true;
}

void SDKManager::showAd()
{
    SDKManager::getInstance()->onAdsCallback();
}

void SDKManager::showRewardedAd()
{
    SDKManager::getInstance()->onAdsCallback();
}

void SDKManager::onAdsCallback()
{
    
}

void SDKManager::addEventListener(std::function<void(int,int)> sdkCallback)
{
    _sdkCallback=sdkCallback;
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


#if (CC_TARGET_PLATFORM==CC_PLATFORM_ANDROID)

extern "C" {
    JNIEXPORT void JNICALL SDKFUNCITION(nativeLoginCallback)(JNIEnv* env, jobject thiz,jstring sid) {
        const char* pszText = env->GetStringUTFChars(sid, NULL);
        SDKManager::getInstance()->onLoginCallback(pszText,pszText);
        env->ReleaseStringUTFChars(sid, pszText);
    }
    
    JNIEXPORT void JNICALL SDKFUNCITION(nativePayCallback)(JNIEnv* env, jobject thiz,int payId) {
        SDKManager::getInstance()->onPayCallback(payId);
    }
}

#if defined(SDKUC)

std::string SDKManager::getDeviceModel()
{
    JniMethodInfo methodInfo;
    if( JniHelper::getStaticMethodInfo(methodInfo, appActivity, "getDeviceModel", "()Ljava/lang/String;") )
    {
        jobject jStringResult = methodInfo.env->CallStaticObjectMethod(methodInfo.classID, methodInfo.methodID);
        std::string strResult = JniHelper::jstring2string((jstring)jStringResult);
        methodInfo.env->DeleteLocalRef( jStringResult );
        return strResult;
    }
    else
    {
        CCLOG("SDKManager::getDeviceModel method missed!");
    }
    return "";
}

void SDKManager::sdkInit()
{
    
}

void SDKManager::sdkLogin()
{
    JniMethodInfo methodInfo;
    if (JniHelper::getStaticMethodInfo(methodInfo,appActivity,"sdkLogin", "()V"))
    {
        methodInfo.env->CallStaticVoidMethod(methodInfo.classID,methodInfo.methodID);
        methodInfo.env->DeleteLocalRef(methodInfo.classID);
    }
    else
    {
        CCLOG("%s %d: error to get methodInfo", __FILE__, __LINE__);
    }
}

void SDKManager::submitExtendData(const char* roleId,const char* roleName,int roleLevel)
{
    JniMethodInfo methodInfo;
    if (JniHelper::getStaticMethodInfo(methodInfo,appActivity,"submitExtendData", "(Ljava/lang/String;Ljava/lang/String;I)V"))
    {
        jstring stringRoleId = methodInfo.env->NewStringUTF(roleId);
        jstring stringRoleName = methodInfo.env->NewStringUTF(roleName);
        methodInfo.env->CallStaticVoidMethod(methodInfo.classID,methodInfo.methodID, stringRoleId,stringRoleName,roleLevel);
        methodInfo.env->DeleteLocalRef(stringRoleId);
        methodInfo.env->DeleteLocalRef(stringRoleName);
        methodInfo.env->DeleteLocalRef(methodInfo.classID);
    }
    else
    {
        CCLOG("%s %d: error to get methodInfo", __FILE__, __LINE__);
    }
}

void SDKManager::sdkLogout()
{
    JniMethodInfo methodInfo;
    if (JniHelper::getStaticMethodInfo(methodInfo,appActivity,"sdkLogout", "()V"))
    {
        methodInfo.env->CallStaticVoidMethod(methodInfo.classID,methodInfo.methodID);
        methodInfo.env->DeleteLocalRef(methodInfo.classID);
    }
    else
    {
        CCLOG("%s %d: error to get methodInfo", __FILE__, __LINE__);
    }
}

void SDKManager::sdkExit()
{
    JniMethodInfo methodInfo;
    if (JniHelper::getStaticMethodInfo(methodInfo,appActivity,"sdkExit", "()V"))
    {
        methodInfo.env->CallStaticVoidMethod(methodInfo.classID,methodInfo.methodID);
        methodInfo.env->DeleteLocalRef(methodInfo.classID);
    }
    else
    {
        CCLOG("%s %d: error to get methodInfo", __FILE__, __LINE__);
    }
}

void SDKManager::sdkPay(int payId)
{
    CCLOG("sdkPay==========>>payId=%d",payId);
    JniMethodInfo methodInfo;
    if (JniHelper::getStaticMethodInfo(methodInfo,appActivity,"sdkPay", "(I)V"))
    {
        methodInfo.env->CallStaticVoidMethod(methodInfo.classID,methodInfo.methodID,payId);
        methodInfo.env->DeleteLocalRef(methodInfo.classID);
    }
    else
    {
        CCLOG("%s %d: error to get methodInfo", __FILE__, __LINE__);
    }
}
#else

std::string SDKManager::getDeviceModel()
{
    return "AndroidDemo";
}

#include "LoginScene.h"
void SDKManager::sdkInit()
{
}

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
    CCLOG("submitExtendData roleId=%s,roleName=%s,roleLevel=%d",roleId,roleName,roleLevel);
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

#else

std::string SDKManager::getDeviceModel()
{
    return "MAC";
}

#include "LoginScene.h"
void SDKManager::sdkInit()
{
}

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
    CCLOG("submitExtendData roleId=%s,roleName=%s,roleLevel=%d",roleId,roleName,roleLevel);
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

#endif
