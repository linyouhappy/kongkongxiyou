#ifndef __GameBox__CResourcesManager__
#define __GameBox__CResourcesManager__

#include "cocos2d.h"

class CResourcesHelper;
class CUpdateDelegateProtocol;

extern void initJSBZip();
extern cocos2d::Data* getFileDataFromScriptZip(const char* pszFileName);

typedef enum
{
    kUpdateVesionFileNoExist=0,
    kUpdateNormal=1,
    kUpdateVesionFileError=2,
    kUpdateNeedApp=3,
    kUpdateForce=4,
    kUpdateNone=5
} kUpdateFileStatus;

struct CUpdateFileData
{
    std::string t;
    int s;
    std::string f;
    std::string m;
};

typedef enum
{
    kMessageUpdateNone=-1,
    kMessageUpdateSucceed=0,
    kMessageUpdateProgress=1,
    kMessageUpdateDownload=2,
    kMessageUpdateError=3,
    kMessageUncompress=4,
} kMessageType;

typedef std::map<std::string, CUpdateFileData> CUpdateVersionFileMap;

//extern
struct CUpdateVersionData
{
    int res;
    int ver;
    int force;
    std::string url;
    CUpdateVersionFileMap updateVersionFileMap;
};

class CFileDownloader:public cocos2d::Ref
{
public:
    CFileDownloader();
    ~CFileDownloader();
    static CFileDownloader *create();
    bool init();
    
    std::string t;
    int s;
    std::string f;
    std::string m;
    
    unsigned int requestFailedTimes;
    bool isFinish;
    
};

class CResourcesManager:public cocos2d::Ref
{
public:
    enum ErrorCode
    {
        kCreateFile,
        kNetwork,
        kNoNewVersion,
        kUncompress,
        kUpdateFailed
    };
    
    
    typedef struct _Message
    {
    public:
        _Message() : what(kMessageUpdateNone){}
        kMessageType what;
        
        CResourcesManager::ErrorCode code;
        CResourcesManager* manager;
        
        double totalToDownload;
        double nowDownloaded;
        
    } CMessage;
    
    
    class CHelper:public cocos2d::Ref
    {
    public:
        CHelper();
        ~CHelper();
        
        virtual void update(float dt);
        void sendMessage(CMessage *msg);
        
    private:
        void handleUpdateSucceed(CMessage *msg);
        
        std::list<CMessage*> *_messageQueue;
        std::mutex _messageQueueMutex;
    };

public:
    CResourcesManager();
    virtual ~CResourcesManager();
    
    static CResourcesManager * create();
    bool init();
    
    bool loadUpdateVersionFile(const char *lpcszFilePath,CUpdateVersionData* updateVersionData);
    
    void loadRemoteUpdateFile();
    void loadRemoteUpdateXML(const std::string* remoteUpdateXML);
    void saveCurrentUpdateVersionFile();
    
    void saveFileDownloader();
    
    bool downLoad();
    long getDownloadFileLenth(const char* downloadUrl);
    long getLocalFileLength(const char* filePath);
    void sendErrorMessage(CResourcesManager::ErrorCode code);
    
    bool uncompress();
    int getCurrentResourceVersion();
    int getCurrentAppVersion();

    kUpdateFileStatus chechUpdate();
    void startUpdate();
    void stopUpdate();
    
    void maskCurrentFileDownloaderFinish(bool isFinish);
    void resetCurrentFileDownloader();
    bool nextFileDownloader();
    void mainThreadProcess(float dt);
    
    void removeOldFile();
    
    int isForceUpdate(){
        return m_oRemoteUpdateVersionData.force;
    };
    
    CHelper* m_pHelper;
    class CUpdateManager* m_pDelegate; // weak reference
    
    std::thread* m_pThread;
    
    CFileDownloader* m_pCurrentFileDownloader;
    
    long m_lLocalFileLenth;
    int m_iCurrentPercent;
    
    
    bool m_bIsSdkOpen;
    std::string m_strSdkMsg;
    std::string m_sdk_url;
protected:
    std::string m_pDownloadUrl;
    
    std::string* m_strDownloadFolder;
    std::string* m_strAppResourcesFolder;
    std::string m_strDownloadCacheFolder;
    
    CUpdateVersionData m_oCurrentUpdateVersionData;
    CUpdateVersionData m_oRemoteUpdateVersionData;
    
    CResourcesHelper* m_pResourcesHelper;
    
    cocos2d::__Array* m_pFileDownloadersArray;
    
    void* m_pCurl;
    bool m_bIsHasRunDownload;
};
#endif /* defined(__GameBox__CResourcesManager__) */