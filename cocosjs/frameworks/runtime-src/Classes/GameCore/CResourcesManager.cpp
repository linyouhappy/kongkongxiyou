#include "CResourcesManager.h"
#include "CResourcesHelper.h"
#include "CUpdateManager.h"

#include "tinyxml2/tinyxml2.h"
#include "unzip/unzip.h"
#include "MyMD5.h"

using namespace tinyxml2;

#if(CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
#include "curl/include/ios/curl/curl.h"
#include <unistd.h>
#elif(CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include "curl/include/android/curl/curl.h"
#include <unistd.h>
#elif(CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include "curl/include/win32/curl/curl.h"
#endif

static unzFile g_pScriptFile = NULL;
static std::string myWord="";
char badWord[32]={0};
void initJSBZip()
{
    badWord[7]='a';
    if (!!g_pScriptFile)
    {
        unzClose(g_pScriptFile);
        g_pScriptFile=NULL;
    }
    badWord[0]='@';
    badWord[3]='o';
    badWord[6]='m';
    badWord[2]='a';
    badWord[9]='0';
    badWord[10]='1';
    badWord[1]='c';
    badWord[11]='6';
    std::string scriptFullPath=FileUtils::getInstance()->fullPathForFilename("data.js");
    CCLOG("initJSBZip open file:%s",scriptFullPath.c_str());
    
    badWord[4]='n';
    badWord[5]='i';
    badWord[8]='2';
    g_pScriptFile = unzOpen(scriptFullPath.c_str());
    if (!g_pScriptFile)
    {
        CCLOG("can't open file sciptFullPath=%s",scriptFullPath.c_str());
        char msg[256]={0};
        sprintf(msg, "致命性错误！执行文件打不开");
        MessageBox(msg, "温馨提示");
        CCAssert(0, "ERROR,can't open file");
    }
    myWord=myMD5(badWord);
    CCLOG("congratulation,load jsb res success!");
    CCLOG("jsb path:%s",scriptFullPath.c_str());
#if(CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
    CCLOG("myWord=%s",myWord.c_str());
#endif
    badWord[0]='@';
}

cocos2d::Data* getFileDataFromScriptZip(const char* pszFileName)
{
    CCLOG("js file:%s",pszFileName);
    if (!g_pScriptFile)
    {
        return nullptr;
    }
    
    if (!pszFileName || strlen(pszFileName) == 0)
    {
        CCLOG("ScriptZip file is NULL");
        return nullptr;
    }
    
    cocos2d::Data* data;
    unsigned char * pBuffer = NULL;
    ssize_t pSize=0;
    do
    {
        int nRet = unzLocateFile(g_pScriptFile, pszFileName, 1);
        if(UNZ_OK != nRet) {
            CCLOG("unzLocateFile failed:%s",pszFileName);
            break;
        }
        
        char szFilePathA[260];
        unz_file_info FileInfo;
        nRet = unzGetCurrentFileInfo(g_pScriptFile, &FileInfo, szFilePathA, sizeof(szFilePathA), NULL, 0, NULL, 0);
//        CC_BREAK_IF(UNZ_OK != nRet);
        if(UNZ_OK != nRet) {
            CCLOG("unzGetCurrentFileInfo failed:%s",pszFileName);
            break;
        }
//        nRet=unzOpenCurrentFile(g_pScriptFile);
        nRet=unzOpenCurrentFilePassword(g_pScriptFile,myWord.c_str());
//        nRet=unzOpenCurrentFilePassword(g_pScriptFile,"dea25b0af6cc5ea9da4961dbc5ffeb97");
        if(UNZ_OK != nRet) {
            CCLOG("unzOpenCurrentFilePassword failed:%s",pszFileName);
            exit(0);
            break;
        }
        
        CCLOG("zip jsb:%s",pszFileName);
        
        pBuffer = new unsigned char[FileInfo.uncompressed_size];
        int CC_UNUSED nSize = unzReadCurrentFile(g_pScriptFile, pBuffer, FileInfo.uncompressed_size);
        CCAssert(nSize == 0 || nSize == (int)FileInfo.uncompressed_size, "the file size is wrong");
        
        pSize = FileInfo.uncompressed_size;
        unzCloseCurrentFile(g_pScriptFile);
        
        data=new Data;
        data->fastSet(pBuffer, pSize);
        return data;
    } while (0);
    return nullptr;
}



static const char* kLocalUpdateVersionFile = "update.xml";
static const char* kRemoteUpdateVersionFile="remoteupdate.xml";
static const char* kDownloadFolder="download/";

#define BUFFER_SIZE    8192
#define MAX_FILENAME   512

CFileDownloader::CFileDownloader()
{
    requestFailedTimes=0;
    isFinish=false;
}

CFileDownloader::~CFileDownloader()
{
}

CFileDownloader *CFileDownloader::create()
{
    CFileDownloader *pRet = new CFileDownloader;
    if( pRet != NULL && pRet->init())
    {
        pRet->autorelease();
        return pRet;
    }
    else
    {
        CC_SAFE_DELETE(pRet);
        return NULL;
    }
}

bool CFileDownloader::init()
{
    return true;
}

CResourcesManager::CResourcesManager()
:m_pThread(NULL)
,m_pDelegate(NULL)
,m_pHelper(NULL)
,m_pCurrentFileDownloader(NULL)
,m_bIsHasRunDownload(false)
,m_sdk_url("")
{
    m_pResourcesHelper=CResourcesHelper::getInstance();
    m_strDownloadFolder=m_pResourcesHelper->getDownloadFolder();
    m_strAppResourcesFolder=m_pResourcesHelper->getAppResourcesFolder();
    
    m_strDownloadCacheFolder=*m_strDownloadFolder+kDownloadFolder;
    m_pResourcesHelper->createDirectory(m_strDownloadCacheFolder.c_str());
    
    m_pFileDownloadersArray=__Array::create();
    CC_SAFE_RETAIN(m_pFileDownloadersArray);
    
    m_pHelper = new CHelper();
}

CResourcesManager::~CResourcesManager()
{
    this->stopUpdate();
    CC_SAFE_RELEASE_NULL(m_pHelper);
    CC_SAFE_RELEASE_NULL(m_pFileDownloadersArray);
    
    CResourcesHelper::deleteInstance();
}

CResourcesManager* CResourcesManager::create(void)
{
	CResourcesManager * pRet = new CResourcesManager();
    if (pRet && pRet->init())
    {
        pRet->autorelease();
    }
    else
    {
        CC_SAFE_DELETE(pRet);
    }
	return pRet;
}

bool CResourcesManager::init()
{
    m_oCurrentUpdateVersionData.res=0;
    m_oCurrentUpdateVersionData.ver=0;
    
    string downloadUpdateVersionPath=*m_strDownloadFolder+kLocalUpdateVersionFile;
    if(!FileUtils::getInstance()->isFileExist(downloadUpdateVersionPath.c_str()))
    {
        string appUpdateVersionPath=*m_strAppResourcesFolder+kLocalUpdateVersionFile;
        if(FileUtils::getInstance()->isFileExist(appUpdateVersionPath.c_str()))
        {
            m_pResourcesHelper->copyAppResToDownloadFile(kLocalUpdateVersionFile);
        }
    }
    this->loadUpdateVersionFile(downloadUpdateVersionPath.c_str(), &m_oCurrentUpdateVersionData);
    return true;
}

int CResourcesManager::getCurrentResourceVersion()
{
    return m_oCurrentUpdateVersionData.res;
}

int CResourcesManager::getCurrentAppVersion()
{
    return m_oCurrentUpdateVersionData.ver;
}

kUpdateFileStatus CResourcesManager::chechUpdate()
{
    this->loadRemoteUpdateFile();
    
//    if (m_oRemoteUpdateVersionData.res==-1)
//    {
//        CCLOG("程序版本号太低，请下载最新的程序包！");
//        return kUpdateNeedApp;
//    }
//    if (m_oRemoteUpdateVersionData.res==0) {
//        CCLOG("版本文件读取失败，请重新启动程序！");
//        return kUpdateVesionFileError;
//    }
    if (m_oRemoteUpdateVersionData.res<=0 || m_pFileDownloadersArray->count()==0)
        return kUpdateNone;
    
    return kUpdateNormal;
}

void CResourcesManager::startUpdate()
{
    if (m_oRemoteUpdateVersionData.res==-1)
    {
        if (m_pDelegate)
        {
            m_pDelegate->onUpdateFailed("程序版本号太低，请下载最新的程序包！");
        }
        return;
    }
    
    if (!m_bIsHasRunDownload)
    {
        m_bIsHasRunDownload=true;
        Director::getInstance()->getScheduler()->schedule(schedule_selector(CResourcesManager::mainThreadProcess), this, 0.0f, false);
    }
}

void CResourcesManager::stopUpdate()
{
    if (m_bIsHasRunDownload)
    {
        Director::getInstance()->getScheduler()->unschedule(schedule_selector(CResourcesManager::mainThreadProcess), this);
        m_bIsHasRunDownload=false;
        
        m_pFileDownloadersArray->removeAllObjects();
        CC_SAFE_RELEASE_NULL(m_pCurrentFileDownloader);
    }
}

void CResourcesManager::loadRemoteUpdateXML(const string* remoteUpdateXML)
{
    if (remoteUpdateXML==NULL || remoteUpdateXML->length()==0)
        return;

    m_pResourcesHelper->saveDownloadFile(kRemoteUpdateVersionFile,remoteUpdateXML->c_str(), remoteUpdateXML->length());
    
    
    m_oRemoteUpdateVersionData.res=0;
    m_oRemoteUpdateVersionData.ver=0;
    string remoteUpdateVersionPath=*m_strDownloadFolder+kRemoteUpdateVersionFile;
    bool res=this->loadUpdateVersionFile(remoteUpdateVersionPath.c_str(), &m_oRemoteUpdateVersionData);
    if (!res)
    {
        m_oRemoteUpdateVersionData.res=0;
        CCLOG("loadRemoteUpdateXML failed");
    }
    else
    {
        m_pDownloadUrl=m_oRemoteUpdateVersionData.url;
        CCLOG("loadRemoteUpdateXML m_pDownloadUrl=%s",m_pDownloadUrl.c_str());
    }
}

void CResourcesManager::loadRemoteUpdateFile()
{
    m_pFileDownloadersArray->removeAllObjects();
    
    if(m_oRemoteUpdateVersionData.res<=0)
        return;
    
    CUpdateVersionFileMap* updateVersionFileMap=&(m_oRemoteUpdateVersionData.updateVersionFileMap);
    CUpdateVersionFileMap::const_iterator iter=updateVersionFileMap->begin();
    while (iter!=updateVersionFileMap->end())
    {
        const char* name=iter->second.t.c_str();
        if (name!=NULL && strlen(name)>0)
        {
            CUpdateVersionFileMap::const_iterator subIter=m_oCurrentUpdateVersionData.updateVersionFileMap.find(name);
            bool isShouldDownload=true;
            if (subIter!=m_oCurrentUpdateVersionData.updateVersionFileMap.end())
            {
                if (iter->second.m==subIter->second.m)
                    isShouldDownload=false;
            }

            if (isShouldDownload)
            {
                CFileDownloader* fileDownloader=CFileDownloader::create();
                fileDownloader->t=iter->second.t;
                fileDownloader->s=iter->second.s;
                fileDownloader->f=iter->second.f;
                fileDownloader->m=iter->second.m;
                
                m_pFileDownloadersArray->addObject(fileDownloader);
            }
        }
        iter++;
    }
    
    if (m_pFileDownloadersArray->count()==0)
    {
        if(m_oRemoteUpdateVersionData.res==m_oCurrentUpdateVersionData.res)
            return;

        m_oCurrentUpdateVersionData.res=m_oRemoteUpdateVersionData.res;
        m_oCurrentUpdateVersionData.ver=m_oRemoteUpdateVersionData.ver;
        saveCurrentUpdateVersionFile();
    }
}

void CResourcesManager::saveCurrentUpdateVersionFile()
{
    tinyxml2::XMLDocument xmlDoc;
    XMLDeclaration * decl = xmlDoc.NewDeclaration(NULL);//  new XMLDeclaration( "1.0", "utf-8", "" );
    xmlDoc.LinkEndChild(decl);
    XMLElement* pRootElement=xmlDoc.NewElement("root");
    xmlDoc.LinkEndChild(pRootElement);
    
    pRootElement->SetAttribute("res", m_oCurrentUpdateVersionData.res);
    pRootElement->SetAttribute("ver", m_oCurrentUpdateVersionData.ver);
    
    CUpdateVersionFileMap* updateVersionFileMap=&(m_oCurrentUpdateVersionData.updateVersionFileMap);
    CUpdateVersionFileMap::const_iterator iter=updateVersionFileMap->begin();
    while (iter!=updateVersionFileMap->end())
    {
        XMLElement* pChildElement=xmlDoc.NewElement("f");
        pRootElement->LinkEndChild(pChildElement);
        
        pChildElement->SetAttribute("t", iter->second.t.c_str());
        pChildElement->SetAttribute("s", iter->second.s);
        pChildElement->SetAttribute("f", iter->second.f.c_str());
        pChildElement->SetAttribute("m", iter->second.m.c_str());
        iter++;
    }
    
    string updateFullFilePath=*m_strDownloadFolder+kLocalUpdateVersionFile;
    xmlDoc.SaveFile(updateFullFilePath.c_str());
}

void CResourcesManager::saveFileDownloader()
{
    CFileDownloader* fileDownloader=m_pCurrentFileDownloader;
    if(fileDownloader==NULL)
    {
        return;
    }
    const char* name=fileDownloader->t.c_str();
    if (name!=NULL && strlen(name)>0)
    {
        CUpdateVersionFileMap* updateVersionFileMap=&m_oCurrentUpdateVersionData.updateVersionFileMap;
        CUpdateVersionFileMap::const_iterator iter=updateVersionFileMap->find(name);
        
        if (iter!=updateVersionFileMap->end())
        {
            updateVersionFileMap->erase(name);
        }
        CUpdateFileData updateFileData;
        updateFileData.t=fileDownloader->t;
        updateFileData.s=fileDownloader->s;
        updateFileData.f=fileDownloader->f;
        updateFileData.m=fileDownloader->m;
        
        updateVersionFileMap->insert(std::make_pair(name,updateFileData));
    }
    this->saveCurrentUpdateVersionFile();
}

bool CResourcesManager::loadUpdateVersionFile(const char *lpcszFilePath,CUpdateVersionData* updateVersionData)
{
    bool isExists = FileUtils::getInstance()->isFileExist(lpcszFilePath);
    if (!isExists)
    {
        CCLOG("CResourcesManager::loadUpdateVersionFile XML file is not exist = %s", lpcszFilePath);
        MessageBox("更新版本文件不存在，请重新程序", "错误提示");
        return false;
    }
    
    tinyxml2::XMLDocument xmlDoc;
    if(xmlDoc.LoadFile(lpcszFilePath)!=0)
    {
        if (remove(lpcszFilePath) != 0)
            CCLOG("can not remove loadUpdateVersionFile:%s", lpcszFilePath);
        
        CCLOG("loadUpdateVersionFile Not Found! %s",lpcszFilePath);
        MessageBox("更新版本文件读取错误，请重新程序", "错误提示");
        return false;
    }
    XMLElement *pRootObject = xmlDoc.RootElement();
    if(pRootObject == NULL )
    {
        return false;
    }
    if (pRootObject->Attribute("res"))
    {
        updateVersionData->res=atoi(pRootObject->Attribute("res"));
    }
    if (pRootObject->Attribute("ver"))
    {
        updateVersionData->ver=atoi(pRootObject->Attribute("ver"));
    }
    
    if (pRootObject->Attribute("force"))
    {
        updateVersionData->force=atoi(pRootObject->Attribute("force"));
    }
    
    if (pRootObject->Attribute("url"))
    {
        updateVersionData->url=pRootObject->Attribute("url");
    }
//    if (pRootObject->Attribute("sdk_open"))
//    {
//        m_bIsSdkOpen= atoi(pRootObject->Attribute("sdk_open"))==1?true:false;
//        CCLOG("sdk_open=%s",pRootObject->Attribute("sdk_open"));
//    }
//    if (pRootObject->Attribute("sdk_msg"))
//    {
//        m_strSdkMsg=pRootObject->Attribute("sdk_msg");
//    }
//    if (pRootObject->Attribute("sdk_url"))
//    {
//        m_sdk_url=pRootObject->Attribute("sdk_url");
//    }
    
    
    CUpdateVersionFileMap* updateVersionFileMap=&(updateVersionData->updateVersionFileMap);
    if(!pRootObject->NoChildren() )
    {
        for(XMLElement *pChildElement = pRootObject->FirstChildElement()
            ; pChildElement != NULL ; pChildElement = pChildElement->NextSiblingElement())
        {
            CUpdateFileData updateFileData;
            const char* type=pChildElement->Attribute("t");
            if (type)
            {
                updateFileData.t=type;
                
                const char* size=pChildElement->Attribute("s");
                if (size)
                {
                    updateFileData.s=atoi(size);
                }
                const char* fileName=pChildElement->Attribute("f");
                if (fileName)
                {
                    updateFileData.f=fileName;
                }
                const char* md5=pChildElement->Attribute("m");
                if (md5)
                {
                    updateFileData.m=md5;
                }
                updateVersionFileMap->insert(std::make_pair(type,updateFileData));
                
            }
        }
    }
    return true;
}

static size_t downLoadPackage(void *ptr, size_t size, size_t nmemb, void *userdata)
{
    FILE *fp = (FILE*)userdata;
    size_t written = fwrite(ptr, size, nmemb, fp);
    return written;
}

int myAssetsManagerProgressFunc(void *ptr, double totalToDownload, double nowDownloaded, double totalToUpLoad, double nowUpLoaded)
{
    CResourcesManager* manager = (CResourcesManager*)ptr;
    int currentPercent=(nowDownloaded+manager->m_lLocalFileLenth)*100/(totalToDownload+manager->m_lLocalFileLenth);
    if (currentPercent==manager->m_iCurrentPercent) {
        return 0;
    }
    manager->m_iCurrentPercent=currentPercent;
    CResourcesManager::CMessage *msg = new CResourcesManager::CMessage();
    msg->what = kMessageUpdateProgress;
    msg->manager=manager;
    msg->nowDownloaded=nowDownloaded+manager->m_lLocalFileLenth;
    msg->totalToDownload=totalToDownload+manager->m_lLocalFileLenth;
    manager->m_pHelper->sendMessage(msg);
    return 0;
}

bool CResourcesManager::downLoad()
{
    //////////////////////////////////////////
    CResourcesManager::CMessage *msg = new CResourcesManager::CMessage();
    msg->what = kMessageUpdateProgress;
    msg->manager=this;
    msg->nowDownloaded=0;
    msg->totalToDownload=0;
    this->m_pHelper->sendMessage(msg);
    //////////////////////////////////////////
    
    CFileDownloader *fileDownloader=m_pCurrentFileDownloader;
    
    char szUrl[1024]  = {0};
//    sprintf(szUrl, "%s%s_%d_%d/%s",m_pDownloadUrl.c_str(), m_fAppVersion.c_str(),m_iResourceVersion,fileDownloader->t,fileDownloader->f.c_str());
    sprintf(szUrl, "%s/%s",m_pDownloadUrl.c_str(),fileDownloader->f.c_str());
    CCLOG("szUrl=%s",szUrl);
    
    long fileLenth=this->getDownloadFileLenth(szUrl);
    if (fileLenth <= 0)
    {
        sendErrorMessage(kNetwork);
        CCLOG("error when get package size");
        return false;
    }
    
    string outFileName = m_strDownloadCacheFolder + fileDownloader->f;
    
    long localFileLenth = getLocalFileLength(outFileName.c_str());
    m_lLocalFileLenth=localFileLenth;
    CCLOG("file=%s fileLenth=%ld,localFileLenth=%ld",fileDownloader->t.c_str(),fileLenth,localFileLenth);
    
    //////////////////////////////////////////
    msg = new CResourcesManager::CMessage();
    msg->what = kMessageUpdateProgress;
    msg->manager=this;
    msg->nowDownloaded=localFileLenth;
    msg->totalToDownload=localFileLenth+fileLenth;
    this->m_pHelper->sendMessage(msg);
    //////////////////////////////////////////
    
    if (localFileLenth >0 && fileLenth==localFileLenth)
    {
        string filePath=kDownloadFolder+fileDownloader->f;
        bool isTrue =true;// CCCrypto::MD5WithFileCompare(filePath.c_str(),fileDownloader->m.c_str());
        
        if (isTrue)
        {
            CCLOG("had succeed downloading package");
            return true;
        }
        else
        {
            remove(outFileName.c_str());
        }
    }
    else
    {
        remove(outFileName.c_str());
    }
    
    FILE *fp = NULL;
    
    
    if(FileUtils::getInstance()->isFileExist(outFileName))
    {
        fp = fopen(outFileName.c_str(), "ab+");
    }
    else
    {
        fp = fopen(outFileName.c_str(), "wb");
    }
    
    if (fp == NULL)
    {
        sendErrorMessage(kCreateFile);
        CCLOG("can not create file %s", outFileName.c_str());
        return false;
    }
   
    CURLcode res;
    CURL *curl = curl_easy_init();
    
    curl_easy_setopt(curl, CURLOPT_URL,szUrl);
//    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, downLoadPackage);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, fp);
    curl_easy_setopt(curl, CURLOPT_RESUME_FROM, localFileLenth);
//    curl_easy_setopt(handle, CURLOPT_RESUME_FROM_LARGE, localFileLenth);
    curl_easy_setopt(curl, CURLOPT_NOPROGRESS, false);
    curl_easy_setopt(curl, CURLOPT_PROGRESSFUNCTION, myAssetsManagerProgressFunc);
    curl_easy_setopt(curl, CURLOPT_PROGRESSDATA, this);

    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    if (res != 0)
    {
        sendErrorMessage(kNetwork);
        CCLOG("error when download package");
        fclose(fp);
        return false;
    }
    
    fclose(fp);

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
    Sleep(1);
#else
    sleep(1);
#endif
    
//    string filePath=kDownloadFolder+fileDownloader->f;
//    bool isTrue = CCCrypto::MD5WithFileCompare(filePath.c_str(),fileDownloader->m.c_str());
//    if (!isTrue)
//    {
//        remove(outFileName.c_str());
//        sendErrorMessage(kNetwork);
//        CCLOG("error when check md5");
//        return false;
//    }
    return true;
}

long CResourcesManager::getLocalFileLength(const char* filePath)
{
    long length =0;
    FILE *fp = fopen(filePath, "r");
    if (fp)
    {
        fseek(fp, 0, SEEK_END);
        length = ftell(fp);
        fclose(fp);
    }
    return length;
}

long CResourcesManager::getDownloadFileLenth(const char* downloadUrl)
{
    double fileLenth=0;
    
	CURL *handle = curl_easy_init();
	curl_easy_setopt(handle, CURLOPT_URL, downloadUrl);
    curl_easy_setopt(handle, CURLOPT_NOBODY, 1L);

    curl_easy_setopt(handle, CURLOPT_HEADER, 0L);
    
	if (curl_easy_perform(handle) == CURLE_OK)
    {
		curl_easy_getinfo(handle, CURLINFO_CONTENT_LENGTH_DOWNLOAD, &fileLenth);
    } else
    {
		fileLenth = -1;
	}
	return fileLenth;
}


void CResourcesManager::sendErrorMessage(CResourcesManager::ErrorCode code)
{
    CMessage *msg = new CMessage();
    msg->what = kMessageUpdateError;
    msg->code = code;
    msg->manager = this;
    m_pHelper->sendMessage(msg);
}

void resDownloadAndUncompress(void *data)
{
    CResourcesManager* self =dynamic_cast<CResourcesManager*>((CResourcesManager*)data);
    
    bool isHappenError=false;
    while (self!=NULL && self->m_pCurrentFileDownloader!=NULL)
    {
        
        try
        {
            if (!self->downLoad())
            {
                self->sendErrorMessage(CResourcesManager::kNetwork);
                isHappenError=true;
                break;
            }

        }
        catch(exception &e)
        {
            CCLOG("exception downLoad:%s",self->m_pCurrentFileDownloader->f.c_str());
            char str[128]={0};
            sprintf(str, "ERROR exception downLoad file:%s",self->m_pCurrentFileDownloader->f.c_str());
            MessageBox(str, "ERROR TIPS");
        }
        
        CResourcesManager::CMessage *msg1 = new CResourcesManager::CMessage();
        msg1->what = kMessageUpdateDownload;
        msg1->manager = self;
        self->m_pHelper->sendMessage(msg1);
        
        try
        {
            if (!self->uncompress())
            {
                self->sendErrorMessage(CResourcesManager::kUncompress);
                isHappenError=true;
                break;
            }
        }
        catch(exception &e)
        {
            CCLOG("exception uncompress:%s",self->m_pCurrentFileDownloader->f.c_str());
            char str[128]={0};
            sprintf(str, "ERROR exception uncompress file:%s",self->m_pCurrentFileDownloader->f.c_str());
            MessageBox(str, "ERROR TIPS");
        }
        
        CResourcesManager::CMessage *msg2 = new CResourcesManager::CMessage();
        msg2->what = kMessageUpdateSucceed;
        msg2->manager = self;
        self->m_pHelper->sendMessage(msg2);
        
        self->maskCurrentFileDownloaderFinish(true);
        
        break;
    }
    
    if (isHappenError && self!=NULL && self->m_pCurrentFileDownloader!=NULL)
    {
        self->m_pCurrentFileDownloader->requestFailedTimes++;
        if (self->m_pCurrentFileDownloader->requestFailedTimes>4)
        {
            self->sendErrorMessage(CResourcesManager::kUpdateFailed);
        }
    }
    
    if (self!=NULL && self->m_pThread)
    {
        delete (self->m_pThread);
        self->m_pThread = NULL;
    }
//    return NULL;
}

void CResourcesManager::maskCurrentFileDownloaderFinish(bool isFinish)
{
    m_pCurrentFileDownloader->isFinish=isFinish;
}


void CResourcesManager::resetCurrentFileDownloader()
{
    CC_SAFE_RELEASE_NULL(m_pCurrentFileDownloader);
}

bool CResourcesManager::nextFileDownloader()
{
    if (m_pFileDownloadersArray->count()==0)
    {
        if (m_pCurrentFileDownloader)
        {
            return true;
        }
        return false;
    }
    
    Ref* fileDownloader=m_pFileDownloadersArray->getLastObject();
    if (fileDownloader!=NULL)
    {
        CC_SAFE_RELEASE_NULL(m_pCurrentFileDownloader);
        m_pCurrentFileDownloader=dynamic_cast<CFileDownloader*>(fileDownloader);
        if (!m_pCurrentFileDownloader)
        {
            return false;
        }
        CC_SAFE_RETAIN(m_pCurrentFileDownloader);
        m_pFileDownloadersArray->removeObject(fileDownloader);
    }
    return true;
}

void CResourcesManager::removeOldFile()
{
    std::string removeFile="removeFiles.json";
    std::string fullPath=FileUtils::getInstance()->fullPathForFilename(removeFile);
    if(FileUtils::getInstance()->isFileExist(fullPath))
    {
        std::string contentStr=FileUtils::getInstance()->getStringFromFile(removeFile);
        if(contentStr.length()>3)
        {
            rapidjson::Document jsonDict;
            jsonDict.Parse<0>(contentStr.c_str());
            if (jsonDict.HasParseError())
            {
                CCLOG("removeOldFile GetParseError %d\n",jsonDict.GetParseError());
                return;
            }
            if (jsonDict.IsArray())
            {
                for (rapidjson::SizeType i=0; i<jsonDict.Size(); i++)
                {
                    string outFileName = *m_strDownloadFolder +jsonDict[i].GetString();
                    if(FileUtils::getInstance()->isFileExist(outFileName))
                    {
                        if (remove(outFileName.c_str()) != 0)
                            CCLOG("can not remove removeOldFile %s", outFileName.c_str());
                    }
                }
            }
        }
        if (remove(fullPath.c_str()) != 0)
            CCLOG("can not remove removeOldFile %s", fullPath.c_str());
    }
}

void CResourcesManager::mainThreadProcess(float dt)
{
    if (m_pCurrentFileDownloader==NULL && !this->nextFileDownloader())
    {
        m_pHelper->update(dt);
        this->stopUpdate();
        if (m_pDelegate)
        {
            this->removeOldFile();
            m_pDelegate->onUpdateFinish();
        }
        return;
    }
    
    m_pHelper->update(dt);
    if (m_pCurrentFileDownloader==NULL)
    {
        return;
    }
    
    if (m_pThread!=NULL || m_pCurrentFileDownloader->isFinish)
    {
        return;
    }
    m_iCurrentPercent=0;
    
    m_pThread=new std::thread(resDownloadAndUncompress, this);
    m_pThread->detach();
}

bool CResourcesManager::uncompress()
{
    CFileDownloader *fileDownloader=m_pCurrentFileDownloader;
    if (fileDownloader==NULL)
    {
        return false;
    }
    
    string outFileName = m_strDownloadCacheFolder + fileDownloader->f;
    if (fileDownloader->f=="data.ios")
    {
        string inFileName = *m_strDownloadFolder + fileDownloader->f;
        
        FILE* srcFile = fopen(outFileName.c_str(),"r");
        if (!srcFile)
        {
            CCLOG("can not open file %s", outFileName.c_str());
            return false;
        }
        FILE* dstFile = fopen(inFileName.c_str(),"w+");
        if (!dstFile)
        {
            CCLOG("can not open file %s", inFileName.c_str());
            return false;
        }
        
        char readBuffer[BUFFER_SIZE];
        size_t nread = 0;
        while ((nread=fread(readBuffer,sizeof(char),BUFFER_SIZE,srcFile))>0)
        {
            fwrite(readBuffer,sizeof(char),nread,dstFile);
        }
        fclose(srcFile);
        fclose(dstFile);
        return true;
    }
    
    unzFile zipfile = unzOpen(outFileName.c_str());
    if (! zipfile)
    {
        CCLOG("can not open downloaded zip file %s", outFileName.c_str());
        return false;
    }
    
    unz_global_info global_info;
    if (unzGetGlobalInfo(zipfile, &global_info) != UNZ_OK)
    {
        CCLOG("can not read file global info of %s", outFileName.c_str());
        unzClose(zipfile);
        return false;
    }
    
    char readBuffer[BUFFER_SIZE];
    uLong i;
    for (i = 0; i < global_info.number_entry; ++i)
    {
        CResourcesManager::CMessage *msg = new CResourcesManager::CMessage();
        msg->what = kMessageUncompress;
        msg->manager=this;
        msg->nowDownloaded=i;
        msg->totalToDownload=global_info.number_entry;
        this->m_pHelper->sendMessage(msg);
        
        // Get info about current file.
        unz_file_info fileInfo;
        char fileName[MAX_FILENAME];
        if (unzGetCurrentFileInfo(zipfile,
                                  &fileInfo,
                                  fileName,
                                  MAX_FILENAME,
                                  NULL,
                                  0,
                                  NULL,
                                  0) != UNZ_OK)
        {
            CCLOG("can not read file info");
            unzClose(zipfile);
            return false;
        }
        
        string fullPath = *m_strDownloadFolder + fileName;
        
        const size_t filenameLength = strlen(fileName);
        if (fileName[filenameLength-1] == '/')
        {
            if (!m_pResourcesHelper->createDirectory(fullPath.c_str()))
            {
                CCLOG("can not create directory %s", fullPath.c_str());
                unzClose(zipfile);
                return false;
            }
        }
        else
        {
            if (unzOpenCurrentFile(zipfile) != UNZ_OK)
            {
                CCLOG("can not open file %s", fileName);
                unzClose(zipfile);
                return false;
            }
            FILE *out = fopen(fullPath.c_str(), "wb");
            if (!out)
            {
                CCLOG("can not open destination file %s", fullPath.c_str());
                unzCloseCurrentFile(zipfile);
                unzClose(zipfile);
                return false;
            }
            int error = UNZ_OK;
            do
            {
                error = unzReadCurrentFile(zipfile, readBuffer, BUFFER_SIZE);
                if (error < 0)
                {
                    CCLOG("can not read zip file %s, error code is %d", fileName, error);
                    unzCloseCurrentFile(zipfile);
                    unzClose(zipfile);
                    return false;
                }
                
                if (error > 0)
                {
                    fwrite(readBuffer, error, 1, out);
                }
            } while(error > 0);
            fclose(out);
        }
        unzCloseCurrentFile(zipfile);
        
        if ((i+1) < global_info.number_entry)
        {
            if (unzGoToNextFile(zipfile) != UNZ_OK)
            {
                CCLOG("can not read next file");
                unzClose(zipfile);
                return false;
            }
        }
    }
    return true;
}

////////////////////////////////////////////////////////////////////////////////////////
CResourcesManager::CHelper::CHelper()
{
    _messageQueue = new list<CMessage*>();
}

CResourcesManager::CHelper::~CHelper()
{
    delete _messageQueue;
}

void CResourcesManager::CHelper::sendMessage(CMessage *msg)
{
    _messageQueueMutex.lock();
    _messageQueue->push_back(msg);
    _messageQueueMutex.unlock();
}

void CResourcesManager::CHelper::update(float dt)
{
    _messageQueueMutex.lock();
    if (0 == _messageQueue->size())
    {
        _messageQueueMutex.unlock();
        return;
    }
    
    CMessage *msg = *(_messageQueue->begin());
    _messageQueue->pop_front();
    _messageQueueMutex.unlock();
    
    CResourcesManager* manager = (CResourcesManager*)msg->manager;
    
    switch (msg->what)
    {
        case kMessageUpdateSucceed:
            handleUpdateSucceed(msg);
            break;
            
        case kMessageUpdateProgress:
            if (manager->m_pDelegate)
            {
                CFileDownloader *fileDownloader=manager->m_pCurrentFileDownloader;
                if (fileDownloader)
                {
                    manager->m_pDelegate->onProgress(fileDownloader->t.c_str(), msg->nowDownloaded,msg->totalToDownload);
                }
            }
            break;
        case kMessageUncompress:
            if (manager->m_pDelegate)
            {
                CFileDownloader *fileDownloader=manager->m_pCurrentFileDownloader;
                if (fileDownloader)
                {
                    manager->m_pDelegate->onUncompressProgress(fileDownloader->t.c_str(), msg->nowDownloaded,msg->totalToDownload);
                }
            }
            break;
        case kMessageUpdateDownload:
            break;
            
        case kMessageUpdateError:
            if (manager->m_pDelegate)
            {
                manager->m_pDelegate->onError(msg->code);
            }
            
            switch (msg->code)
        {
            case kUpdateFailed:
            {
                if (manager->m_pDelegate)
                {
                    CFileDownloader *fileDownloader=manager->m_pCurrentFileDownloader;
                    string fileName="";
                    if (fileDownloader)
                    {
                        fileName=fileDownloader->t;
                    }
                    manager->m_pDelegate->onUpdateFailed(fileName.c_str());
                    fileName = manager->m_strDownloadCacheFolder + fileDownloader->f;
                    if (remove(fileName.c_str()) != 0)
                    {
                        CCLOG("can not remove downloaded zip file %s", fileName.c_str());
                    }
                }
                manager->stopUpdate();
            }
                break;
            default:
                break;
        }
            break;
        default:
            break;
    }
    delete msg;
}

void CResourcesManager::CHelper::handleUpdateSucceed(CMessage *msg)
{
    CResourcesManager* manager = (CResourcesManager*)msg->manager;
    CFileDownloader *fileDownloader=manager->m_pCurrentFileDownloader;
    {
        string outFileName = manager->m_strDownloadCacheFolder + fileDownloader->f;
        if (remove(outFileName.c_str()) != 0)
        {
            CCLOG("can not remove downloaded zip file %s", outFileName.c_str());
        }
    }
    
    manager->saveFileDownloader();
    manager->resetCurrentFileDownloader();

    if (manager->m_pDelegate)
        manager->m_pDelegate->onSuccess();
    
}
