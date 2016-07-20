#include "CUpdateManager.h"
#include "network/HttpClient.h"



using namespace network;
using namespace std;


CUpdateManager* CUpdateManager::s_sharedUpdateManager = nullptr;

CUpdateManager* CUpdateManager::getInstance()
{
    if (! s_sharedUpdateManager)
        s_sharedUpdateManager = new (std::nothrow)CUpdateManager();
    return s_sharedUpdateManager;
}

void CUpdateManager::deleteInstance()
{
    if(s_sharedUpdateManager != nullptr)
    {
        delete s_sharedUpdateManager;
        s_sharedUpdateManager = nullptr;
    }
}

CUpdateManager::CUpdateManager()
:_updateCallback(nullptr)
{
    m_pResourcesManager=CResourcesManager::create();
    m_pResourcesManager->m_pDelegate=this;
    CC_SAFE_RETAIN(m_pResourcesManager);
    
    m_pResourcesManager->removeOldFile();
}

CUpdateManager::~CUpdateManager()
{
//	HttpClient::destroyInstance();
    CC_SAFE_RELEASE_NULL(m_pResourcesManager);
}

void CUpdateManager::checkResUpdate(const char* url)
{
//    MessageBox(url, "Tips");
    _url=url;
    char szUrl[1024]  = {0};
    int currentResVersion=m_pResourcesManager->getCurrentResourceVersion();
    int currentAppVersion=m_pResourcesManager->getCurrentAppVersion();
    currentResVersion=100*currentAppVersion+currentResVersion;
    sprintf(szUrl, "%s/update?ver=%d&os=android",url,currentResVersion);
    HttpRequest *pRequest = new HttpRequest;
    pRequest->setUrl(szUrl);
    
    CCLOG("checkResUpdate url:%s",szUrl);
    
    pRequest->setRequestType(HttpRequest::Type::GET);
    pRequest->setResponseCallback(std::bind((SEL_HttpResponse)&CUpdateManager::onResHttpCallback,this, std::placeholders::_1, std::placeholders::_2));
    
    auto httpClient= HttpClient::getInstance();
    httpClient->setTimeoutForConnect(30);
    httpClient->setTimeoutForRead(30);
    
    httpClient->send(pRequest);
    pRequest->release();
}

void CUpdateManager::onResHttpCallback(Node* httpClient, void* data)
{
    HttpResponse *pResponse =(HttpResponse*)(data);
    if( pResponse == NULL )
        return;

    long nStatusCode = pResponse->getResponseCode();
    if( nStatusCode != 200 || !pResponse->isSucceed() )    //HTTP 200 OK
    {
        CCLOG("[Update Module] Http Response(%ld) Error: %s", nStatusCode, pResponse->getErrorBuffer());
        char msg[256]={0};
        sprintf(msg, "发生网络故障，连接服务器失败！(%ld)",nStatusCode);
        
        if (!!_updateCallback) {
            _updateCallback(kCarryGetUpdateFailValue,0,0,msg);
        }
        return;
    }
    
    std::vector<char> *pBuffer = pResponse->getResponseData();
    std::string xmlData;
    xmlData.assign(pBuffer->begin(), pBuffer->end());
    
    CCLOG("xmlData=%s",xmlData.c_str());
    m_pResourcesManager->loadRemoteUpdateXML(&xmlData);
//    MessageBox(xmlData.c_str(), "Tips");
    this->prepareDownload();
}

void CUpdateManager::prepareDownload()
{
    m_iIsHasUpdate=m_pResourcesManager->chechUpdate();
    if (m_pResourcesManager->isForceUpdate()>0)
    {
        CCLOG("强制升级。。。");
        m_iIsHasUpdate=kUpdateForce;
    }
    string tipsContent="";
    switch (m_iIsHasUpdate)
    {
        case kUpdateVesionFileNoExist:
            tipsContent="遇致命错误，导致版本文件丢失，请重新启动游戏！";
            break;
        case kUpdateNormal:
            tipsContent="有资源更新，是否进行下载！";
            break;
        case kUpdateNeedApp:
            tipsContent="APP程序版本太低，需要更新到最新的APP程序！";
            break;
        case kUpdateVesionFileError:
            tipsContent="版本文件读取失败，请重新启动游戏！";
            break;
        case kUpdateForce:
            tipsContent="您好，需要下载资源更新，才能进入游戏！";
            break;
        case kUpdateNone:
            break;
        default:
            m_iIsHasUpdate=kUpdateNone;
            break;
    }
    if (!!_updateCallback)
        _updateCallback(kCarryUpdateTipsValue,m_iIsHasUpdate,0,tipsContent.c_str());
}

void CUpdateManager::startDownload()
{
    switch (m_iIsHasUpdate)
    {
        case kUpdateVesionFileNoExist:
            checkResUpdate(_url.c_str());
            break;
        case kUpdateNormal:
        case kUpdateForce:
            m_pResourcesManager->startUpdate();
            break;
            
        case kUpdateNeedApp:
            break;
        default:
            break;
    }
}

void CUpdateManager::onProgress(const char* fileName, double nowDownloaded, double totalToDownload)
{
    if (totalToDownload==0)
    {
        totalToDownload=1;
    }
    char sizeStr[128]={0};
    if (nowDownloaded<1048576)
    {
        sprintf(sizeStr, "%.2fKB",nowDownloaded/1024);
    }
    else
    {
        sprintf(sizeStr, "%.2fMB",nowDownloaded/1024/1024);
    }
    
    char totalSizeStr[128]={0};
    if (totalToDownload<1048576)
    {
        sprintf(totalSizeStr, "%.2fKB",totalToDownload/1024);
    }
    else
    {
        sprintf(totalSizeStr, "%.2fMB",totalToDownload/1024/1024);
    }
    
    char str[64]={0};
    sprintf(str, "正在下载%s[%s/%s]",fileName,sizeStr,totalSizeStr);
    if (!!_updateCallback) {
        _updateCallback(kCarryProgressValue,nowDownloaded,totalToDownload,str);
    }
}

void CUpdateManager::onUncompressProgress(const char* fileName, int nowDownloaded, int totalToDownload)
{
    if (totalToDownload==0)
    {
        totalToDownload=1;
    }
    char str[64]={0};
    sprintf(str, "正在解压%s[%d/%d]",fileName,nowDownloaded,totalToDownload);
    if (!!_updateCallback) {
        _updateCallback(kCarryProgressValue,nowDownloaded,totalToDownload,str);
    }
}

void CUpdateManager::onUpdateFinish()
{
//    this->loadResource();
//    CC_SAFE_RELEASE_NULL(m_pResourcesManager);
    if (!!_updateCallback) {
        _updateCallback(kCarryFinishValue,0,0,(char*)"");
    }
}

void CUpdateManager::onUpdateFailed(const char* fileName)
{
    char tips[64]={0};
    sprintf(tips, "更新失败，%s",fileName);
    if (!!_updateCallback) {
        _updateCallback(kCarryFailedValue,0,0,tips);
    }
}

void CUpdateManager::addEventListener(std::function<void(int,int,int,const char*)> updateCallback)
{
    _updateCallback=updateCallback;
}

//void CUpdateManager::loadResource()
//{
//    initJSBZip();
//    CCLOG("CUpdateManager::loadResource======>>>");
//}



