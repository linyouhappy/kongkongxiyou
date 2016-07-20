
#ifndef __GameBox__ResourceHelper__
#define __GameBox__ResourceHelper__

//#include "cocos-ext.h"
#include "extensions/cocos-ext.h"
USING_NS_CC;
USING_NS_CC_EXT;
using namespace std;

struct VSData{
    int v;
    int s;
};

typedef std::map<std::string, VSData> CRemoteUpdateFileMap;
typedef std::map<std::string, int> CCurrentUpdateFileMap;

struct CUpdateData
{
    string resourcesVersion;
    string resourcesUrl;
    string luaVersion;
    string lastTime;
    CRemoteUpdateFileMap remoteUpdateFileMap;
    CCurrentUpdateFileMap currentUpdateMap;
};

typedef enum
{
    kFileVersionNo=0,
    kFileVersionOrigin=1,
    kFileVersionCurrent=3,
    kFileVersionSame=2,
} kFileVersionType;

extern bool _saveFile(const char *lpcszFilePath, const char *lpcszFileData,const size_t fileSize);

class CResourcesHelper:public Ref
{
public:
    static CResourcesHelper* getInstance();
    static void deleteInstance();
    
    void checkVersion();
    string& getResourcesUrl();
protected:
    static CResourcesHelper* s_ResourcesHelper;
    
    CResourcesHelper();
    virtual ~CResourcesHelper();
    
    string m_strServerTime;
    
    CCurrentUpdateFileMap* m_pCurrentUpdateMap;
    CRemoteUpdateFileMap* m_pRemoteUpdateMap;
    
    CUpdateData m_oCurrentUpdateData;
    CUpdateData m_oRemoteUpdateData;
    
protected:
    void init();
    
    //download folder
    string m_strDownloadFolder;
    
    string m_strAppResourcesFolder;
    
    bool m_bIsFirstRunApp;
    
public:
    
    bool getIsFirstRunApp(){return m_bIsFirstRunApp;}
    
    bool loadUpdateXMLFile(const char *lpcszFilePath,CUpdateData* updateData);
    bool loadUpdateXMLStr(const char *lpcszXMLStr, CUpdateData* updateData);
    
    void loadRemoteUpdateXML(const string* remoteUpdateXML);
    void loadRemoteUpdateXMLZip(const string* remoteUpdateXML);
    
    void updateCurrentVersion(const char *lpcszFilePath, int versionNum, bool isDelete=false);
    
    bool createDirectory(const char *path);
    bool copyAppResToDownloadFile(const char *lpcszFileName);
    bool saveDownloadFile(const char *lpcszFileName, const char *lpcszFileData,const size_t fileSize);
    bool saveRecorderMp3File(const char *lpcszFileName, const char *lpcszFileData,const size_t fileSize);
    void copyFile(const char *lpcszResourcePath, const char *lpcszDestPath, const char *lpcszFileName);
    bool saveFile(const char *lpcszFileName, const char *lpcszFileData,const size_t fileSize);
    
    
    void startSaveCurrentUpdate();
    void saveCurrentUpdateFile(float dt);
    
    void deleteFile(const char* lpcszFileName);
    int compareRemoteToCurrentVersion(const char* lpcszFileName);
    
    void saveVersion(CUpdateData* updateData);
    
    int getFileCurrentVersion(const char *lpcszFileName);
    VSData* getFileRometoVersion(const char *lpcszFileName);
    
    string* getAppResourcesFolder();
    string* getDownloadFolder();
};

#endif /* defined(__GameBox__ResourceHelper__) */
