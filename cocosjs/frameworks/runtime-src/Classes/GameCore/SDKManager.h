#ifndef __SDKManager__
#define __SDKManager__

#include "cocos2d.h"

USING_NS_CC;


#if CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID
#include "jni/JniHelper.h"
#include <jni.h>
#include <cstring>
#include <android/log.h>

#if defined(SDKUC)

static const char* appActivity="com/linyou/kongkongxiyou/uc/AppActivity";
#define SDKFUNCITION(__FUNCNAME__) Java_com_linyou_kongkongxiyou_uc_AppActivity_##__FUNCNAME__
#define CHANNELTYPE kMChannelUCAndroid

#else

static const char* appActivity="com/linyou/kongkongxiyou/AppActivity";
#define SDKFUNCITION(__FUNCNAME__) Java_com_linyou_kongkongxiyou_AppActivity_##__FUNCNAME__
#define CHANNELTYPE kMChannelNone

#endif

#else

#define CHANNELTYPE kMChannelNone

#endif


enum kMSDKStateType
{
    kMSDKStateNone=0,
    kMSDKStateLoginSuccess=1,
    kMSDKStatePaySuccess=2,
    kMSDKStateAdSuccess=3
};

enum kMChannelType
{
    kMChannelNone=0,
    kMChannelAppStore=2000,
    kMChannelUCAndroid=5000
};

class SDKManager:public Ref
{
public:
    static SDKManager* getInstance();
    
    void sdkInit();
    void sdkLogin();
    void sdkLogout();
    void sdkExit();
    void sdkPay(int payId);
    
    std::string getUserName();
    std::string getPassword();
    std::string getDeviceModel();
    int getChannelId();
    
    void submitExtendData(const char* roleId,const char* roleName,int roleLevel);
    
    void onAdsCallback();
    void onPayCallback(int payId);
    void onLoginCallback(std::string username,std::string password);
    
//    void onSDKCallback(int msgType,int param1,std::string param2);
    void addEventListener(std::function<void(int,int)> sdkCallback);
    
    void showAd();
    void showRewardedAd();
    
protected:
    
    static SDKManager* create();
    
    SDKManager();
    virtual ~SDKManager();
    virtual bool init();
    
    static SDKManager* s_SDKManager;
    
    std::string _userName;
    std::string _password;
    
    kMChannelType _channelId;
    std::function<void(int,int)> _sdkCallback;
    
};

#endif /* defined(__SDKManager__) */


