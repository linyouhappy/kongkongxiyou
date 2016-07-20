#ifndef __MapManager__
#define __MapManager__

#include "cocos2d.h"

USING_NS_CC;

struct AreaData
{
    AreaData():id(-1){}
    int id;
    int type;
    int level;
    int tileW;
    int tileH;
    int width;
    int height;
    int pathId;
    int resId;
    int resRow;
    int resColumn;
    
    std::string areaName;
};

class MapManager:public Ref
{
public:
    static MapManager* getInstance();
    
    void loadMap(int resId,int mapResRow,int mapResColumn);
    void clearMap(int newResId);
    
    void loadFarMap(int resId,int mapResRow,int mapResColumn);
    void clearFarMap(int newResId);

    Node* getMapNode();
    Node* getFarMapNode();
    
    int getMapWidth();
    int getMapHeight();
    int getCurrentResId();
    
protected:
    
    static MapManager* create();
    
    MapManager();
    virtual ~MapManager();
    virtual bool init();
    
    static MapManager* s_MapManager;
    
    int _currentResId;
    std::map<std::string,bool> _mapImgsMap;
    
    Node* _mapNode;
    Node* _farMapNode;
    
    int _currentFarResId;
    std::map<std::string,bool>* _farMapImgsMap;
    
    
    float _mapWidth;
    float _mapHeight;
    
};

#endif /* defined(__MapManager__) */


