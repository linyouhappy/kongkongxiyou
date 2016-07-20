#ifndef __ScrollLogManager__
#define __ScrollLogManager__

#include "cocos2d.h"
USING_NS_CC;
//using namespace cocos2d::ui;

class ScrollLogManager:public Ref
{
public:
    static ScrollLogManager* getInstance();
    
    void pushLog(const char* logString,int quality=0);
    void showLog(float);
    
protected:
    
    typedef struct _LogData
    {
        int quality;
        std::string logString;
    } LogData;
    
    static ScrollLogManager* create();
    
    ScrollLogManager();
    virtual ~ScrollLogManager();
    
    virtual bool init();
    
    void setPosition(Vec2 position);

    void startShowLog();
    void stopShowLog();
    void setLocalZOrder(int zOrder);
    
    static ScrollLogManager* s_ScrollLogManager;
    
    std::vector<LogData> _logDatasVector;

    int _localZOrder;
    int _delayInterval;
    long _lastMilliSecond;
    Vec2 _startPosition;
    
    Action* _runAction;

};

#endif /* defined(__ScrollLogManager__) */

