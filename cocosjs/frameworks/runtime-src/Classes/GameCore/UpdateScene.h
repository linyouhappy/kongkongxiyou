
#ifndef __UpdateScene__
#define __UpdateScene__

#include "cocos2d.h"
#include "cocostudio/CocoStudio.h"
#include "ui/CocosGUI.h"


USING_NS_CC;
using namespace cocostudio;

class UpdateScene:public Scene
{
public:
    
    static UpdateScene *create();
    
    UpdateScene();
    virtual ~UpdateScene();
    
    void showUpdateInfo(float nowDown, float totalDown,const char* msg);
    
    virtual void onEnter();
    
    void addEventListener(std::function<void(int)> callback);
    void setUpdateType(int type);
    
protected:
    bool init();
    
    void runGameAPP(int updateCBType);
    
    void startUpdate();
    void checkResUpdate();
    
    ui::Text* _tipsText;
    ui::Text* _loadingText;
    ui::LoadingBar* _loadingBar;
    std::function<void(int)> _callback;
    std::vector<std::string> _tipsWordVector;
    int _updateType;
    
    double _lastSecond;
};

#endif /* defined(__UpdateScene__) */