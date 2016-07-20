
#ifndef __EffectManager__
#define __EffectManager__

#include "cocos2d.h"
USING_NS_CC;

class ShaderEffect:public cocos2d::Ref
{
public:
    ShaderEffect();
    virtual ~ShaderEffect();
    
    static ShaderEffect* createWithFragmentFile(const char* fragmentFilename);
    static ShaderEffect* create(const char* fragmentSource);
    
    cocos2d::GLProgramState* getGLProgramState() const { return _glprogramstate; }
    virtual void setTarget(Sprite *sprite){}
    
protected:
    virtual bool initWithFragmentFile(const char* fragmentFilename);
    virtual bool initWithFragmentSource(const char* fragmentSource);
    
    cocos2d::GLProgramState* _glprogramstate;
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
    std::string _fragSource;
    cocos2d::EventListenerCustom* _backgroundListener;
#endif
};

class EffectManager:public Ref
{
public:
    static EffectManager* getInstance();
    
    EffectManager();
    virtual ~EffectManager();
    
    void registerShaderEffect(const char* shaderKey,ShaderEffect* shaderEffect);
    void useShaderEffect(Sprite* sprite,const char* shaderKey);
    void useDefaultShaderEffect(Sprite* sprite);
    
    ShaderEffect* getShaderEffectByKey(const char* shaderKey);
    GLProgramState* getGLProgramStateByKey(const char* shaderKey);
    
protected:
    virtual bool init();
    static EffectManager* create();
    static EffectManager* s_EffectManager;

    Map<std::string,ShaderEffect*> _shaderEffectsMap;
};

#endif /* defined(__EffectManager__) */