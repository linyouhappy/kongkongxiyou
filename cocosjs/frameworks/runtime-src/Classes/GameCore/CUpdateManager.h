#ifndef __CUpdateManager__
#define __CUpdateManager__

#include "cocos2d.h"
#include "CResourcesManager.h"
USING_NS_CC;

//class CResourcesManager;

enum kUpdateCarryValueType
{
    kCarryGetUpdateFailValue=1,
    kCarryUpdateTipsValue=2,
    kCarryProgressValue=3,
    kCarryFinishValue=4,
    kCarryFailedValue=5
};

class CUpdateManager:public Ref
{
    CUpdateManager();
    virtual ~CUpdateManager();

public:
    static CUpdateManager* getInstance();
    static void deleteInstance();
    
    void checkResUpdate(const char* url);
    void onResHttpCallback(Node* httpClient, void* response);
    
    void prepareDownload();
    void startDownload();
//    void loadResource();
    
    void onProgress(const char* fileName, double nowDownloaded, double totalToDownload);
    void onUncompressProgress(const char* fileName, int nowDownloaded, int totalToDownload);
    void onUpdateFinish();
    void onUpdateFailed(const char* fileName);
    void onError(int errorCode) {}
    void onSuccess() {}
    
    void addEventListener(std::function<void(int,int,int,const char*)> updateCallback);
    
protected:
    
    std::function<void(int,int,int,const char*)> _updateCallback;
    
    int m_iIsHasUpdate;
//    bool m_bIsMustUpdate;
    std::string _url;
    
    CResourcesManager* m_pResourcesManager;
    
    static CUpdateManager* s_sharedUpdateManager;
};


#endif /* defined(__CUpdateManager__) */