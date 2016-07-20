
#ifndef __WelcomeScene__
#define __WelcomeScene__

#include "cocos2d.h"
#include "cocostudio/CocoStudio.h"
#include "ui/CocosGUI.h"


USING_NS_CC;
using namespace cocostudio;

class WelcomeScene:public Scene
{
public:
    static WelcomeScene *create();
    
    WelcomeScene();
    virtual ~WelcomeScene();
    void addEventListener(std::function<void()> callback);

protected:
    bool init();
    
    std::function<void()> _callback;
};

#endif /* defined(__WelcomeScene__) */