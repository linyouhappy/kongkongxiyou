#include "AppDelegate.h"
#include "SimpleAudioEngine.h"

#if (CC_TARGET_PLATFORM != CC_PLATFORM_LINUX)
#include "ide-support/CodeIDESupport.h"
#endif

#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
#include "runtime/Runtime.h"
#include "ide-support/RuntimeJsImpl.h"
#else
#include "js_module_register.h"
#endif

#include "GameCore.h"
#include "UpdateScene.h"
#include "WelcomeScene.h"

USING_NS_CC;
using namespace CocosDenshion;

AppDelegate::AppDelegate()
:_lastDayInteger(0)
,_isInit(false)
{
}

AppDelegate::~AppDelegate()
{
	SimpleAudioEngine::end();
    ScriptEngineManager::destroyInstance();
    
#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)
    // NOTE:Please don't remove this call if you want to debug with Cocos Code IDE
    RuntimeEngine::getInstance()->end();
#endif
}

//if you want a different context,just modify the value of glContextAttrs
//it will takes effect on all platforms
void AppDelegate::initGLContextAttrs()
{
    //set OpenGL context attributions,now can only set six attributions:
    //red,green,blue,alpha,depth,stencil
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};
    GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{
    // initialize director
    auto director = Director::getInstance();

    // set FPS. the default value is 1.0/60 if you don't call this
    director->setAnimationInterval(1.0 / 60);
    
    std::string writeAblePath=FileUtils::getInstance()->getWritablePath();
    FileUtils::getInstance()->addSearchPath(writeAblePath+"res",true);
    FileUtils::getInstance()->addSearchPath("res");
    
    CommonLib::initCommonLib();
    
    cocos2d::ui::Button::setDefaultSoundEffectFile("sound/ui/button_touch.mp3");
    cocos2d::ui::Button::setSoundEffectFunc([](const char* effectFile){
        CommonLib::playEffectSound(effectFile);
    });

    
#if (COCOS2D_DEBUG > 0) && (CC_CODE_IDE_DEBUG_SUPPORT > 0)

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    // for getIPAddress
    extern void setActivityPathForAndroid(const std::string &path);
    setActivityPathForAndroid("org/cocos2dx/javascript/AppActivity");
#endif
    
    auto runtimeEngine = RuntimeEngine::getInstance();
    auto jsRuntime = RuntimeJsImpl::create();
    runtimeEngine->addRuntime(jsRuntime, kRuntimeEngineJs);
    runtimeEngine->start();
    
    // js need special debug port
    if (runtimeEngine->getProjectConfig().getDebuggerType() != kCCRuntimeDebuggerNone)
    {
        jsRuntime->startWithDebugger();
    }
#else
    js_module_register();
    ScriptingCore* sc = ScriptingCore::getInstance();
//    CUpdateManager::getInstance();
    
    sc->exterScriptFunc=[](const char* scriptFile)->Data*{
        return getFileDataFromScriptZip(scriptFile);
    };
    
    auto enterGameFun=[=](int updateCBType){
        CCLOG("enterGameFun==========>>0");
        _isInit=true;
        _lastDayInteger=CommonLib::getTodayInteger();

        initJSBZip();
        
        sc->start();
        sc->runScript("script/jsb_boot.js");
#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
        sc->enableDebugger();
#endif
        ScriptEngineProtocol *engine = ScriptingCore::getInstance();
        ScriptEngineManager::getInstance()->setScriptEngine(engine);
        ScriptingCore::getInstance()->runScript("src/main.js");
    };
    if(_lastDayInteger>0)
    {
        EntitySprite::clearAllRes();
        enterGameFun(0);
        return true;
    }
    
    auto glview = director->getOpenGLView();
    glview->setDesignResolutionSize(960,640, ResolutionPolicy::NO_BORDER);
    
    WelcomeScene* welcomeScene=WelcomeScene::create();
    Director::getInstance()->pushScene(welcomeScene);

    welcomeScene->addEventListener([=](){
        UpdateScene* updateScene=UpdateScene::create();
        Director::getInstance()->replaceScene(updateScene);
        updateScene->addEventListener(enterGameFun);
    });

#endif
    
    return true;
}

// This function will be called when the app is inactive. When comes a phone call,it's be invoked too
void AppDelegate::applicationDidEnterBackground()
{
    auto director = Director::getInstance();
    director->stopAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_hide");
    SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
    SimpleAudioEngine::getInstance()->pauseAllEffects();    
}

// this function will be called when the app is active again
void AppDelegate::applicationWillEnterForeground()
{
    auto director = Director::getInstance();
    director->startAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_show");
    SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
    SimpleAudioEngine::getInstance()->resumeAllEffects();
    
    if(!_isInit) return;
    
    int curTodayInteger=CommonLib::getTodayInteger();
    if(curTodayInteger!=_lastDayInteger)
    {
        auto enterGameFun=[=](int updateCBType){
            CCLOG("enterGameFun===========>>1");
            if (kCarryFinishValue==updateCBType)
            {
                CommonLib::stopBgMusic(true);
                Director::getInstance()->restart();
            }
            else
            {
                Director::getInstance()->popScene();
            }
        };
        UpdateScene* updateScene=UpdateScene::create();
        Director::getInstance()->pushScene(updateScene);
        updateScene->addEventListener(enterGameFun);
    }
}

