#include "CResourcesHelper.h"
#include "cocos2d.h"

#include "tinyxml2/tinyxml2.h"
#include "unzip/unzip.h"

#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
#include <dirent.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <errno.h>
#endif


USING_NS_CC;
using namespace tinyxml2;

#define MAX_FILEBUFFER 1024

static const char* kRemoteUpdateFile = "remoteupdate.xml";
static const char* kUpdateFile = "update.xml";
static const char* kVersionFile="version";


#if(CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)

#include <unistd.h>
#include <sys/time.h>
#include <stdlib.h>
#include <fcntl.h>

void _copyFile(const char *lpcszResourcePath, const char *lpcszCachePath, const char *lpcszFilePath)
{
    char szSourceFile[1024] = {0};
    char szDestFile[1024] = {0};
    sprintf(szSourceFile, "%s%s", lpcszResourcePath, lpcszFilePath);
    sprintf(szDestFile, "%s%s", lpcszCachePath, lpcszFilePath);
    
    CCLOG("copyFile source:%s",szSourceFile);
    CCLOG("copyFile dest:%s",szDestFile);
    
    ssize_t nSize = 0;
    unsigned char* pBuffer = CCFileUtils::sharedFileUtils()->getFileData(szSourceFile, "rb", &nSize);
    if (pBuffer==NULL)
    {
        CCLOG("_copyFile failed open source file %s", szSourceFile);
        return;
    }
//    CCLOG("_copyFile success open source file %s", szSourceFile);
    
    FILE *_out = fopen(szDestFile, "wb");
    if( _out == NULL )
    {
        CCLOG("_copyFile failed open destination file %s", szDestFile);
        return;
    }
//    CCLOG("_copyFile success open destination file %s", szDestFile);

    fwrite(pBuffer, 1, nSize, _out);
    CC_SAFE_DELETE_ARRAY(pBuffer);
    fflush(_out);
    fclose(_out);
    
}

bool _saveFile(const char *lpcszFilePath, const char *lpcszFileData,const size_t fileSize)
{
    int file= open(lpcszFilePath, O_CREAT|O_RDWR, 0700);
    if (file == -1)
    {
        CCLOG("_saveFile can not open file %s", lpcszFilePath);
        return false;
    }
    int r=write(file,lpcszFileData,fileSize);

    if(r==-1)
    {
        CCLOG("_saveFile can not write file %s", lpcszFilePath);
        close(file);
        return false;
    }
    close(file);
    return true;
}

#elif(CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM ==CC_PLATFORM_MAC || CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)

void _copyFile(const char *lpcszResourcePath, const char *lpcszDestPath, const char *lpcszFileName)
{
    char szSourceFile[1024] = {0};
    char szDestFile[1024] = {0};
    sprintf(szSourceFile, "%s%s", lpcszResourcePath, lpcszFileName);
    sprintf(szDestFile, "%s%s", lpcszDestPath, lpcszFileName);
    
    CCLOG("copyFile source:%s",szSourceFile);
    CCLOG("copyFile dest:%s",szDestFile);
    
    ssize_t nSize = 0;
    unsigned char* pBuffer = FileUtils::getInstance()->getFileData(szSourceFile, "rb", &nSize);
    if (pBuffer==NULL)
    {
        CCLOG("_copyFile failed open source file %s", szSourceFile);
        return;
    }
//    CCLOG("_copyFile success open source file %s", szSourceFile);
    
    FILE *_out = fopen(szDestFile, "wb");
    if( _out == NULL )
    {
        CCLOG("_copyFile failed open destination file %s", szDestFile);
        return;
    }
//    CCLOG("_copyFile success open destination file %s", szDestFile);
    
    fwrite(pBuffer, 1, nSize, _out);
    CC_SAFE_DELETE_ARRAY(pBuffer);
    fflush(_out);
    fclose(_out);
}

bool _saveFile(const char *lpcszFilePath, const char *lpcszFileData,const size_t fileSize)
{
    FILE *file = fopen(lpcszFilePath, "wb");
    if( file == NULL )
    {
        CCLOG("_saveFile can not open file %s", lpcszFilePath);
        return false;
    }
    int r=fwrite(lpcszFileData, 1, fileSize, file);
    if(r==0)
    {
        CCLOG("_saveFile can not write file %s", lpcszFilePath);
        fclose(file);
        return false;
    }
    
    fflush(file);
    fclose(file);
    return true;
}
#endif

int uncompressGzip(const char *lpcszFilePath,const char* pSrc, size_t srcSize)
{
    int err=0;
    z_stream d_stream;
    Byte compr[1024*1024]={0}, uncompr[1024*1024]={0};
    
    memcpy(compr,(Byte*)pSrc,srcSize);
    uLong comprLen, uncomprLen;
    comprLen = sizeof(compr) / sizeof(compr[0]);
    uncomprLen = comprLen;
    strcpy((char*)uncompr, "garbage");
    d_stream.zalloc = (alloc_func)0;
    d_stream.zfree = (free_func)0;
    d_stream.opaque = (voidpf)0;
    d_stream.next_in = compr;
    d_stream.avail_in = 0;
    d_stream.next_out = uncompr;
    err = inflateInit2(&d_stream,47);
    if(err!=Z_OK)
    {
        printf("inflateInit2 error:%d",err);
        return -1;
    }
    while (d_stream.total_out < uncomprLen && d_stream.total_in < comprLen)
    {
        d_stream.avail_in = d_stream.avail_out = 1; /* force small buffers */
        err = inflate(&d_stream,Z_NO_FLUSH);
        if(err == Z_STREAM_END) break;
        if(err!=Z_OK)
        {
            printf("inflate error:%d",err);
            return -1;
        }
    }
    err = inflateEnd(&d_stream);
    if(err!=Z_OK)
    {
        printf("inflateEnd error:%d",err);
        return -1;
    }
    
    size_t total_out=d_stream.total_out;
    char* uncompData = new char[total_out];
    
    memset(uncompData, 0, total_out);
//    bzero(uncompData,total_out);
    memcpy(uncompData,(char*)uncompr,total_out);
    
    err=_saveFile(lpcszFilePath,uncompData,total_out);
//    CC_SAFE_DELETE_ARRAY(uncompData);
    delete[] uncompData;
    return err;
}

void rm_dir(const char *path)
{
#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
    DIR *dir;
    struct dirent *dirp;
    struct stat buf;
    if((dir=opendir(path))==NULL)
    {
        CCLOG("opendir failed path=%s",path);
        return;
    }
    
    while((dirp=readdir(dir)))
    {
        if((strcmp(dirp->d_name,".")==0) || (strcmp(dirp->d_name,"..")==0))
            continue;
        
        char tempPath[512]={0};
        sprintf(tempPath, "%s%s",path,dirp->d_name);
        
        if(stat(tempPath,&buf)==-1)
        {
           CCLOG("file does not exist file=%s",dirp->d_name);
            continue;
        }
        
        if(remove(tempPath)==-1)
        {
            CCLOG("file remove failed file=%s",dirp->d_name);
            sprintf(tempPath, "%s%s/",path,dirp->d_name);
            rm_dir(tempPath);
        }
    }
    closedir(dir);
    
    if(rmdir(path)==-1)
    {
        CCLOG("remove path failed, path=%s",path);
    }
#endif
}


CResourcesHelper* CResourcesHelper::s_ResourcesHelper=nullptr;

CResourcesHelper* CResourcesHelper::getInstance()
{
    if (s_ResourcesHelper==nullptr)
    {
        s_ResourcesHelper=new CResourcesHelper();
    }
    return s_ResourcesHelper;
}

void CResourcesHelper::deleteInstance()
{
    if(s_ResourcesHelper != nullptr)
    {
        delete s_ResourcesHelper;
        s_ResourcesHelper = nullptr;
    }
}

CResourcesHelper::CResourcesHelper()
{
    this->init();
}

CResourcesHelper::~CResourcesHelper()
{
}

void CResourcesHelper::init()
{
    m_strDownloadFolder=FileUtils::getInstance()->getWritablePath();
#if (CC_TARGET_PLATFORM ==CC_PLATFORM_MAC)
    m_strDownloadFolder="/Users/linyou/Documents/res/";
#else
    m_strDownloadFolder+="res/";
#endif
    
    CCLOG("download folder:%s",m_strDownloadFolder.c_str());
    
    m_strAppResourcesFolder=FileUtils::getInstance()->fullPathForFilename("config.json");
    m_strAppResourcesFolder=m_strAppResourcesFolder.substr(0,m_strAppResourcesFolder.size()-11);
    m_strAppResourcesFolder+="res/";
    CCLOG("app folder:%s",m_strAppResourcesFolder.c_str());
    
    checkVersion();
}

string& CResourcesHelper::getResourcesUrl()
{
    return m_oRemoteUpdateData.resourcesUrl;
}

void CResourcesHelper::checkVersion()
{
    string downloadVersionPath=m_strDownloadFolder+kVersionFile;
    //about first run
    m_bIsFirstRunApp=false;
    if(FileUtils::getInstance()->isFileExist(downloadVersionPath.c_str()))
    {
        __String* localString=__String::createWithContentsOfFile(downloadVersionPath.c_str());
        string localStr=localString->getCString();
        
        string appVersionPath=m_strAppResourcesFolder+kVersionFile;
        __String* appString=__String::createWithContentsOfFile(appVersionPath.c_str());
        string appStr=appString->getCString();
        if (localStr!=appStr)
        {
            CCLOG("appStr=%s,localStr=%s",appStr.c_str(),localStr.c_str());
            string removeUpdateFileFilePath=m_strDownloadFolder+kRemoteUpdateFile;
            if (remove(removeUpdateFileFilePath.c_str()) != 0)
                CCLOG("can not remove removeUpdateFileFilePath %s", removeUpdateFileFilePath.c_str());
            
            rm_dir(m_strDownloadFolder.c_str());
            m_bIsFirstRunApp=true;
        }
    }
    else
    {
        m_bIsFirstRunApp=true;
    }
    
    if (m_bIsFirstRunApp)
    {
        createDirectory(m_strDownloadFolder.c_str());

        CCLOG("First run app========>>>");
        _copyFile(m_strAppResourcesFolder.c_str(), m_strDownloadFolder.c_str(), kVersionFile);
        _copyFile(m_strAppResourcesFolder.c_str(), m_strDownloadFolder.c_str(), kUpdateFile);
#if(CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
        _copyFile(m_strAppResourcesFolder.c_str(), m_strDownloadFolder.c_str(), "data.js");
#endif
    }
    string updateFullFilePath=m_strDownloadFolder+kUpdateFile;
    if (!FileUtils::getInstance()->isFileExist(updateFullFilePath.c_str()))
    {
        _copyFile(m_strAppResourcesFolder.c_str(), m_strDownloadFolder.c_str(), kUpdateFile);
    }
}

bool CResourcesHelper::copyAppResToDownloadFile(const char *lpcszFileName)
{
    _copyFile(m_strAppResourcesFolder.c_str(), m_strDownloadFolder.c_str(), lpcszFileName);
    return true;
}

bool CResourcesHelper::createDirectory(const char *path)
{
#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
    mode_t processMask = umask(0);
    int ret = mkdir(path, S_IRWXU | S_IRWXG | S_IRWXO);
    umask(processMask);
    if (ret != 0 && (errno != EEXIST))
    {
        return false;
    }
    
    return true;
#else
    BOOL ret = CreateDirectoryA(path, NULL);
	if (!ret && ERROR_ALREADY_EXISTS != GetLastError())
	{
		return false;
	}
    return true;
#endif
}

bool CResourcesHelper::saveDownloadFile(const char *lpcszFileName, const char *lpcszFileData,const size_t fileSize)
{
    string filename =lpcszFileName;
    size_t pos = filename.find_last_of("/");
    if (pos != std::string::npos)
    {
        string folderName = filename.substr(0, pos+1);
        folderName.insert(0, m_strDownloadFolder);
        createDirectory(folderName.c_str());
        
    }
    filename.insert(0, m_strDownloadFolder);
    return _saveFile(filename.c_str(), lpcszFileData, fileSize);
}

bool CResourcesHelper::saveFile(const char *lpcszFileName, const char *lpcszFileData,const size_t fileSize)
{
    return _saveFile(lpcszFileName, lpcszFileData, fileSize);
}

bool CResourcesHelper::saveRecorderMp3File(const char *lpcszFileName2, const char *lpcszFileData2,const size_t fileSize2)
{
    string filename =lpcszFileName2;
    size_t pos = filename.find_last_of("/");
    if (pos != std::string::npos)
    {
        string folderName = filename.substr(0, pos+1);
        //folderName.insert(0, m_strDownloadFolder);
//        mkdir(folderName.c_str(), 0755);
        this->createDirectory(folderName.c_str());
    }
    //filename.insert(0, m_strDownloadFolder);
    return _saveFile(filename.c_str(), lpcszFileData2, fileSize2);
}

void CResourcesHelper::copyFile(const char *lpcszResourcePath, const char *lpcszDestPath, const char *lpcszFileName)
{
    _copyFile(lpcszResourcePath, lpcszDestPath, lpcszFileName);
}

bool CResourcesHelper::loadUpdateXMLFile(const char *lpcszFilePath, CUpdateData* updateData)
{
    bool isExists = FileUtils::getInstance()->isFileExist(lpcszFilePath);
    if (!isExists)
    {
        CCLOG("UpdateXMLFile is not exist = %s", lpcszFilePath);
        return false;
    }
    
    tinyxml2::XMLDocument xmlDoc;
    if( !xmlDoc.LoadFile(lpcszFilePath))
    {
//        CCMessageBox(lpcszFilePath, "loadUpdateXMLFile Not Found!");
        CCLOG("UpdateXMLFile is not exist = %s", lpcszFilePath);
        return false;
    }
    XMLElement *pRootObject = xmlDoc.RootElement();
    if( pRootObject == NULL )
    {
        return false;
    }
    if (pRootObject->Attribute("v"))
    {
        updateData->resourcesVersion=pRootObject->Attribute("v");
    }
    if (pRootObject->Attribute("url_res"))
    {
        updateData->resourcesUrl=pRootObject->Attribute("url_res");
    }
    if (pRootObject->Attribute("time_last"))
    {
        updateData->lastTime=pRootObject->Attribute("time_last");
    }
    
    if (updateData==&m_oCurrentUpdateData)
    {
        CCurrentUpdateFileMap* updateFileMap=&(updateData->currentUpdateMap);
        if( !pRootObject->NoChildren() )
        {
            for( XMLElement *pChildElement = pRootObject->FirstChildElement()
                ; pChildElement != NULL ; pChildElement = pChildElement->NextSiblingElement())
            {
                const char* path=pChildElement->Attribute("p");
                const char* version=pChildElement->Attribute("v");
                if (path!=NULL && version!=NULL)
                    updateFileMap->insert(std::make_pair(path, atoi(version)));
            }
        }
    }
    else if (updateData==&m_oRemoteUpdateData)
    {
        CRemoteUpdateFileMap* updateFileMap=&(updateData->remoteUpdateFileMap);
        if( !pRootObject->NoChildren() )
        {
            for(XMLElement *pChildElement = pRootObject->FirstChildElement()
                ; pChildElement != NULL ; pChildElement = pChildElement->NextSiblingElement())
            {
                const char* path=pChildElement->Attribute("p");
                const char* version=pChildElement->Attribute("v");
                const char* size=pChildElement->Attribute("s");
                VSData vsData;
                vsData.s=0;
                vsData.v=0;
                if (size!=NULL)
                    vsData.s=atoi(size);
                if (path!=NULL && version!=NULL)
                {
                     vsData.v=atoi(version);
                    updateFileMap->insert(std::make_pair(path,vsData));
                }
            }
        }
    }
    return true;
}

bool CResourcesHelper::loadUpdateXMLStr(const char *lpcszXMLStr, CUpdateData* updateData)
{
    tinyxml2::XMLDocument xmlDoc;
    if( !xmlDoc.Parse(lpcszXMLStr,0))
    {
        MessageBox("CResourcesHelper::loadUpdateXMLStr", "ERROR!");
        return false;
    }
    
    XMLElement *pRootObject = xmlDoc.RootElement();
    if( pRootObject == NULL )
    {
        return false;
    }
    
    if (pRootObject->Attribute("v"))
    {
        updateData->resourcesVersion=pRootObject->Attribute("v");
    }
    if (pRootObject->Attribute("url_res"))
    {
        updateData->resourcesUrl=pRootObject->Attribute("url_res");
    }
    if (pRootObject->Attribute("time_last"))
    {
        updateData->lastTime=pRootObject->Attribute("time_last");
    }
    if (pRootObject->Attribute("is_new"))
    {
        int isNew=atoi(pRootObject->Attribute("is_new"));
        if (isNew==0)
        {
            CCLOG("版本文件无更新，无需下载");
            return false;
        }
    }
//    CCMessageBox("版本文件有更新!", "测试提醒");
    
    CRemoteUpdateFileMap* updateFileMap=&(updateData->remoteUpdateFileMap);
    
    if( !pRootObject->NoChildren() )
    {
        for(XMLElement *pChildElement = pRootObject->FirstChildElement()
            ; pChildElement != NULL ; pChildElement = pChildElement->NextSiblingElement())
        {
            const char* path=pChildElement->Attribute("p");
            const char* version=pChildElement->Attribute("v");
            const char* size=pChildElement->Attribute("s");
            VSData vsData;
            vsData.s=0;
            vsData.v=0;
            if (size!=NULL)
                vsData.s=atoi(size);
            if (path!=NULL && version!=NULL)
            {
                vsData.v=atoi(version);
                updateFileMap->insert(std::make_pair(path,vsData));
            }
        }
    }
    return true;
}

void CResourcesHelper::saveVersion(CUpdateData* updateData)
{
    string tmpStr=updateData->resourcesVersion+"||"+updateData->lastTime;
    CCLOG("saveVersion:%s",tmpStr.c_str());
    this->saveDownloadFile(kVersionFile,tmpStr.c_str(), tmpStr.length());
}

void CResourcesHelper::loadRemoteUpdateXML(const string* remoteUpdateXML)
{
    string resourcesUrl="";
    string lastTime="";
    
    if (this->loadUpdateXMLStr(remoteUpdateXML->c_str(),&m_oRemoteUpdateData))
    {
        string remoteUpdatePath=m_strDownloadFolder+kRemoteUpdateFile;
        if(remoteUpdateXML!=NULL && remoteUpdateXML->length()>0)
        {
            _saveFile(remoteUpdatePath.c_str(), remoteUpdateXML->c_str(), remoteUpdateXML->length());
        }
        m_pRemoteUpdateMap=&(m_oRemoteUpdateData.remoteUpdateFileMap);
        this->saveVersion(&m_oRemoteUpdateData);
    }
    else
    {
        resourcesUrl=m_oRemoteUpdateData.resourcesUrl;
        lastTime=m_oRemoteUpdateData.lastTime;
        string remoteUpdatePath=m_strDownloadFolder+kRemoteUpdateFile;
        if(loadUpdateXMLFile(remoteUpdatePath.c_str(), &m_oRemoteUpdateData))
        {
            m_oRemoteUpdateData.resourcesUrl=resourcesUrl;
            m_oRemoteUpdateData.lastTime=lastTime;
            m_pRemoteUpdateMap=&(m_oRemoteUpdateData.remoteUpdateFileMap);
            this->saveVersion(&m_oRemoteUpdateData);
        }

    }
}

void CResourcesHelper::loadRemoteUpdateXMLZip(const string* remoteUpdateXML)
{
    std:string remoteUpdatePath=m_strDownloadFolder+kRemoteUpdateFile;

    uncompressGzip(remoteUpdatePath.c_str(),remoteUpdateXML->c_str(),remoteUpdateXML->length());

    if(loadUpdateXMLFile(remoteUpdatePath.c_str(), &m_oRemoteUpdateData))
    {
        m_pRemoteUpdateMap=&(m_oRemoteUpdateData.remoteUpdateFileMap);
        this->saveVersion(&m_oRemoteUpdateData);
    }
}

void CResourcesHelper::deleteFile(const char *lpcszFileName)
{
    string fullPath=m_strDownloadFolder+lpcszFileName;
    int result=remove(fullPath.c_str());
    CCLOG("deleteFile result=%d lpcszFileName=%s",result,fullPath.c_str());
}

int CResourcesHelper::compareRemoteToCurrentVersion(const char* lpcszFileName)
{
    unsigned int curentVersion=0;
    unsigned int remoteVersion=0;
    curentVersion =CResourcesHelper::getInstance()->getFileCurrentVersion(lpcszFileName);
    VSData* vsData=CResourcesHelper::getInstance()->getFileRometoVersion(lpcszFileName);
    if(vsData==NULL)
    {
        remoteVersion=0;
    }
    else
    {
        remoteVersion=vsData->v;
    }
    return remoteVersion-curentVersion;
}

void CResourcesHelper::saveCurrentUpdateFile(float dt)
{
    if (m_pCurrentUpdateMap!=NULL)
    {
        tinyxml2::XMLDocument xmlDoc;
        XMLDeclaration * decl =xmlDoc.NewDeclaration(NULL);
        xmlDoc.LinkEndChild(decl);
        XMLElement* pRootElement=xmlDoc.NewElement("root");
        xmlDoc.LinkEndChild(pRootElement);
        
        CCurrentUpdateFileMap::const_iterator iter=m_pCurrentUpdateMap->begin();
        while (iter!=m_pCurrentUpdateMap->end())
        {
            XMLElement* pChildElement=xmlDoc.NewElement("f");
            pRootElement->LinkEndChild(pChildElement);
            
            pChildElement->SetAttribute("v", iter->second);
            pChildElement->SetAttribute("p", iter->first.c_str());
            iter++;
        }

        string updateFullFilePath=m_strDownloadFolder+kUpdateFile;
        xmlDoc.SaveFile(updateFullFilePath.c_str());
//        xmlDoc.Print();
    }
//    m_bIsCurrentUpdateChange=false;
//    CCDirector::sharedDirector()->getScheduler()->unscheduleAllForTarget(this);
}

void CResourcesHelper::startSaveCurrentUpdate()
{
    saveCurrentUpdateFile(0);
//    if (!m_bIsCurrentUpdateChange)
//    {
//        m_bIsCurrentUpdateChange=true;
//        CCDirector::sharedDirector()->getScheduler()->scheduleSelector(schedule_selector(CResourcesHelper::saveCurrentUpdateFile), this, 5,1,5,false);
//    }
}

void CResourcesHelper::updateCurrentVersion(const char *lpcszFilePath, int versionNum, bool isDelete)
{
    if (isDelete)
	{
		if (m_pCurrentUpdateMap->find(lpcszFilePath) != m_pCurrentUpdateMap->end())
		{
			m_pCurrentUpdateMap->erase(lpcszFilePath);
		}
	}
	else
	{
		CCurrentUpdateFileMap::const_iterator iter = m_pCurrentUpdateMap->find(lpcszFilePath);
		if (iter == m_pCurrentUpdateMap->end() || iter->second != versionNum)
		{
			(*m_pCurrentUpdateMap)[lpcszFilePath] = versionNum;
		}
	}
}

string* CResourcesHelper::getAppResourcesFolder()
{
    return &m_strAppResourcesFolder;
}

string* CResourcesHelper::getDownloadFolder()
{
    return &m_strDownloadFolder;
}

//string* CResourcesHelper::getRecorderFolder()
//{
//    return &m_strRecorderFolder;
//}

int CResourcesHelper::getFileCurrentVersion(const char *lpcszFileName)
{
    if (m_pCurrentUpdateMap)
    {
        CCurrentUpdateFileMap::const_iterator currentIter=m_pCurrentUpdateMap->find(lpcszFileName);
        if (currentIter != m_pCurrentUpdateMap->end())
        {
            return currentIter->second;
        }
    }
    return 0;
}

VSData* CResourcesHelper::getFileRometoVersion(const char *lpcszFileName)
{
    if (m_pRemoteUpdateMap)
    {
        CRemoteUpdateFileMap::const_iterator remoteIter=m_pRemoteUpdateMap->find(lpcszFileName);
        if (remoteIter!=m_pRemoteUpdateMap->end())
        {
            return (VSData*)&(remoteIter->second);
        }
    }
    return NULL;
}


