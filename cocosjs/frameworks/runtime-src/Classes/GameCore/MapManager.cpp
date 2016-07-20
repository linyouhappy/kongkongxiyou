#include "MapManager.h"
//#include "cocos-ext.h"


//void setAreaDataArrayData(AreaData* areaData,const rapidjson::Value &keys,const rapidjson::Value &values)
//{
//    std::string key="";
//    for (int i=0; i<values.Size(); ++i)
//    {
//        const rapidjson::Value &value=values[i];
//        if(keys[i].IsNull() || value.IsNull())
//            continue;
//        
//        key=keys[i].GetString();
//        if (key.compare("id")==0)
//            areaData->id=value.GetInt();
//        else if(key.compare("type")==0)
//            areaData->type=value.GetInt();
//        else if(key.compare("areaName")==0)
//            areaData->areaName=value.GetString();
//        else if(key.compare("level")==0)
//            areaData->level=value.GetInt();
//        else if(key.compare("tileW")==0)
//            areaData->tileW=value.GetInt();
//        else if(key.compare("tileH")==0)
//            areaData->tileH=value.GetInt();
//        else if(key.compare("width")==0)
//            areaData->width=value.GetInt();
//        else if(key.compare("height")==0)
//            areaData->height=value.GetInt();
//        else if(key.compare("pathId")==0)
//            areaData->pathId=value.GetInt();
//        else if(key.compare("resId")==0)
//            areaData->resId=value.GetInt();
//        else if(key.compare("resRow")==0)
//            areaData->resRow=value.GetInt();
//        else if(key.compare("resColumn")==0)
//            areaData->resColumn=value.GetInt();
//    }
//}
//
//bool readJson(const std::string &fileName, rapidjson::Document &doc)
//{
//    bool ret = false;
//    do {
//        std::string jsonpath = FileUtils::getInstance()->fullPathForFilename(fileName);
//        std::string contentStr = FileUtils::getInstance()->getStringFromFile(jsonpath);
//        doc.Parse<0>(contentStr.c_str());
//        CC_BREAK_IF(doc.HasParseError());
//        ret = true;
//    } while (0);
//    return ret;
//}

MapManager* MapManager::s_MapManager=nullptr;

MapManager::MapManager()
:_mapNode(nullptr)
,_farMapNode(nullptr)
,_currentResId(0)
,_mapWidth(0.0f)
,_mapHeight(0.0f)
,_currentFarResId(0)
,_farMapImgsMap(nullptr)
{
}

MapManager::~MapManager()
{
    CC_SAFE_RELEASE_NULL(_mapNode);
    CC_SAFE_DELETE(_farMapImgsMap);
//    for (auto& areaData:_areaDatasMap)
//    {
//        delete areaData.second;
//    }
//    _areaDatasMap.clear();
}

MapManager* MapManager::getInstance()
{
    if (s_MapManager==nullptr)
    {
        s_MapManager=MapManager::create();
        s_MapManager->retain();
    }
    return s_MapManager;
}

MapManager* MapManager::create()
{
    MapManager *pRet = new MapManager();
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

bool MapManager::init()
{
    _mapNode=Node::create();
    CC_SAFE_RETAIN(_mapNode);
    
	return true;
}

void MapManager::loadMap(int resId,int mapResRow,int mapResColumn)
{
    if(_currentResId==resId)
        return;
    
    _currentResId=resId;
    _mapNode->removeFromParent();
    
    std::stringstream myStringStream;
    myStringStream<<"map/"<<resId;
    std::string mapDir=myStringStream.str();
    
    char mapImgPath[256]={0};
    float offsetX=0.0f;
    float offsetY=0.0f;
    Sprite* spriteNode=nullptr;
    bool isPictureExist=false;
    for (int row =1;row<=mapResRow;row++)
    {
        for (int column=1;column<=mapResColumn;column++)
        {
            sprintf(mapImgPath, "%s/%d%03d.jpg",mapDir.c_str(),row,column);
            isPictureExist=FileUtils::getInstance()->isFileExist(mapImgPath);
            if (!isPictureExist)
            {
                sprintf(mapImgPath, "%s/%d%03d.png",mapDir.c_str(),row,column);
                isPictureExist=FileUtils::getInstance()->isFileExist(mapImgPath);
            }
            if(isPictureExist)
            {
                spriteNode=Sprite::create(mapImgPath);
                spriteNode->setAnchorPoint(Vec2::ZERO);
                _mapNode->addChild(spriteNode);
                spriteNode->setPosition(offsetX,offsetY);
                
                offsetX=offsetX+spriteNode->getContentSize().width;
                
                _mapImgsMap[mapImgPath]=true;
            }
            else
            {
                offsetX=offsetX+512;
                CCLOG("file no exist:%s",mapImgPath);
            }
        }
        if (_mapWidth<=1) {
            _mapWidth=offsetX;
        }
        offsetX=0.0f;
        if (spriteNode) {
            offsetY=offsetY+spriteNode->getContentSize().height;
        }else{
            offsetY=offsetY+512;
        }
    }
    _mapHeight=offsetY;
//    loadFarMap(resId,mapResRow,mapResColumn);
}

void MapManager::clearMap(int newResId)
{
    if(!_currentResId || _currentResId==newResId)
        return;
    
    _mapWidth=0.0f;
    _mapHeight=0.0f;
    _currentResId=0;
    _mapNode->removeFromParent();
    _mapNode->removeAllChildren();
    TextureCache* textureCache=Director::getInstance()->getTextureCache();
    for (auto& mapImgIter:_mapImgsMap)
    {
        textureCache->removeTextureForKey(mapImgIter.first);
    }
    
    clearFarMap(newResId);
}

void MapManager::loadFarMap(int resId,int mapResRow,int mapResColumn)
{
    if(_currentFarResId==resId)
        return;
//    if (floor(resId/1000)!=3) return;
    
    _currentFarResId=resId;
    if(_farMapNode)
    {
        _farMapNode->removeFromParent();
    }
    else
    {
        _farMapNode=Node::create();
        CC_SAFE_RETAIN(_farMapNode);
    }
    if (_farMapImgsMap)
    {
        _farMapImgsMap->clear();
    }
    else
    {
        _farMapImgsMap=new std::map<std::string,bool>;
    }
   
    std::stringstream myStringStream;
    myStringStream<<"map/"<<resId;
    std::string mapDir=myStringStream.str();
    
    char mapImgPath[256]={0};
    float offsetX=0.0f;
//    float offsetY=0.0f;
    Sprite* spriteNode=nullptr;
    bool isPictureExist=false;
    Size contentSize;
    for (int row =1;row<=mapResRow;row++)
    {
        for (int column=1;column<=mapResColumn;column++)
        {
            sprintf(mapImgPath, "%s/m%d%03d.jpg",mapDir.c_str(),row,column);
            isPictureExist=FileUtils::getInstance()->isFileExist(mapImgPath);
            if (!isPictureExist)
            {
                sprintf(mapImgPath, "%s/m%d%03d.png",mapDir.c_str(),row,column);
                isPictureExist=FileUtils::getInstance()->isFileExist(mapImgPath);
            }
            if(isPictureExist)
            {
                spriteNode=Sprite::create(mapImgPath);
                spriteNode->setAnchorPoint(Vec2::ANCHOR_TOP_LEFT);
                _farMapNode->addChild(spriteNode);
                spriteNode->setPosition(offsetX,_mapHeight);
                
                contentSize=spriteNode->getContentSize();
                offsetX=offsetX+contentSize.width;
                
                (*_farMapImgsMap)[mapImgPath]=true;
            }
            else
            {
                offsetX=offsetX+512;
                CCLOG("far map file no exist:%s",mapImgPath);
            }
        }
    }
}

void MapManager::clearFarMap(int newResId)
{
    if(!_currentFarResId || _currentFarResId==newResId)
        return;
    
    _currentFarResId=0;
    if (_farMapNode)
    {
        _farMapNode->removeFromParent();
        _farMapNode->removeAllChildren();
        CC_SAFE_RELEASE_NULL(_farMapNode);
    }
    if (_farMapImgsMap)
    {
        TextureCache* textureCache=Director::getInstance()->getTextureCache();
        for (auto& mapImgIter:(*_farMapImgsMap))
        {
            textureCache->removeTextureForKey(mapImgIter.first);
        }
        CC_SAFE_DELETE(_farMapImgsMap);
    }
}

int MapManager::getCurrentResId()
{
    return _currentResId;
}

Node* MapManager::getMapNode()
{
    return _mapNode;
}

Node* MapManager::getFarMapNode()
{
    return _farMapNode;
}

int MapManager::getMapWidth()
{
    return floor(_mapWidth);
}

int MapManager::getMapHeight()
{
    return floor(_mapHeight);
}


