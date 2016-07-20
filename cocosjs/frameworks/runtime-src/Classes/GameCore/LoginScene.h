
#ifndef __LoginScene__
#define __LoginScene__

#include "cocos2d.h"
#include "cocostudio/CocoStudio.h"
#include "ui/CocosGUI.h"


USING_NS_CC;
using namespace cocostudio;

class LoginScene:public Scene
{
public:
    static LoginScene *create();
    
    LoginScene();
    virtual ~LoginScene();
    
    void loginGame();
    void addEventListener(std::function<void(std::string,std::string)> callback);
    
protected:
    
    bool init();
    
    std::function<void(std::string,std::string)> _callback;
    
    ui::TextField* _nameTextField;
    ui::TextField* _psTextField;
    ui::TextField* _ipTextField;
    
};

#endif /* defined(__LoginScene__) */