#include "EffectManager.h"
#include "ccShaderEffectFrag.h"

ShaderEffect::ShaderEffect()
: _glprogramstate(nullptr)
{
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
    _backgroundListener = EventListenerCustom::create(EVENT_RENDERER_RECREATED,
                                                      [this](EventCustom*)
                                                      {
                                                          auto glProgram = _glprogramstate->getGLProgram();
                                                          glProgram->reset();
                                                          glProgram->initWithByteArrays(ccPositionTextureColor_noMVP_vert, _fragSource.c_str());
                                                          glProgram->link();
                                                          glProgram->updateUniforms();
                                                      }
                                                      );
    Director::getInstance()->getEventDispatcher()->addEventListenerWithFixedPriority(_backgroundListener, -1);
#endif
}

ShaderEffect::~ShaderEffect()
{
    CC_SAFE_RELEASE_NULL(_glprogramstate);
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
    Director::getInstance()->getEventDispatcher()->removeEventListener(_backgroundListener);
#endif
}

ShaderEffect* ShaderEffect::createWithFragmentFile(const char* fragmentFilename)
{
    ShaderEffect *pRet = new ShaderEffect();
    if (pRet!=nullptr)
    {
        pRet->initWithFragmentFile(fragmentFilename);
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

bool ShaderEffect::initWithFragmentFile(const char* fragmentFilename)
{
    auto fileUtiles = FileUtils::getInstance();
    auto fragmentFullPath = fileUtiles->fullPathForFilename(fragmentFilename);
    std::string fragSource="";
    if (fileUtiles->isFileExist(fragmentFullPath))
    {
        fragSource = fileUtiles->getStringFromFile(fragmentFullPath);
    }
    else
    {
        fragSource=ccPositionTextureColor_noMVP_frag;
    }
    return initWithFragmentSource(fragSource.c_str());
}

ShaderEffect* ShaderEffect::create(const char* fragmentSource)
{
    ShaderEffect *pRet = new ShaderEffect();
    if (pRet!=nullptr)
    {
        pRet->initWithFragmentSource(fragmentSource);
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

bool ShaderEffect::initWithFragmentSource(const char* fragmentSource)
{
    auto glprogram = GLProgram::createWithByteArrays(ccPositionTextureColor_noMVP_vert, fragmentSource);
    
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
    _fragSource = fragmentSource;
#endif
    if(glprogram==nullptr)
        return false;
    
    _glprogramstate = GLProgramState::getOrCreateWithGLProgram(glprogram);
    _glprogramstate->retain();
    
    return _glprogramstate != nullptr;
}


class EffectOutline : public ShaderEffect
{
public:
    CREATE_FUNC(EffectOutline);
    
    bool init()
    {
        if(!initWithFragmentSource(ccShader_Outline_Frag))
            return false;
        
        Vec3 color(1.0f, 0.2f, 0.3f);
        GLfloat radius = 0.01f;
        GLfloat threshold = 1.75;
        
        _glprogramstate->setUniformVec3("u_outlineColor", color);
        _glprogramstate->setUniformFloat("u_radius", radius);
        _glprogramstate->setUniformFloat("u_threshold", threshold);
        return true;
    }
};

//class EffectGreyScale : public ShaderEffect
//{
//public:
//    CREATE_FUNC(EffectGreyScale);
//    
//protected:
//    bool init()
//    {
//        return initWithFragmentSource(ccShader_GreyScale_Frag);
//    }
//};
//
//class EffectSepia : public ShaderEffect
//{
//public:
//    CREATE_FUNC(EffectSepia);
//    
//protected:
//    bool init()
//    {
//        return initWithFragmentSource(ccShader_Sepia_Frag);
//    }
//};

class EffectBloom : public ShaderEffect
{
public:
    CREATE_FUNC(EffectBloom);
    
protected:
    bool init()
    {
        return initWithFragmentSource(ccShader_Bloom_Frag);
    }
    
    virtual void setTarget(Sprite* sprite) override
    {
        auto s = sprite->getTexture()->getContentSizeInPixels();
        getGLProgramState()->setUniformVec2("resolution", Vec2(s.width, s.height));
    }
};



EffectManager* EffectManager::s_EffectManager=nullptr;

EffectManager::EffectManager()
{
}

EffectManager::~EffectManager()
{
}

EffectManager* EffectManager::getInstance()
{
    if (s_EffectManager==nullptr)
    {
        s_EffectManager=EffectManager::create();
        s_EffectManager->retain();
    }
    return s_EffectManager;
}

EffectManager* EffectManager::create()
{
    EffectManager *pRet = new EffectManager();
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

bool EffectManager::init()
{
    ShaderEffect* shaderEffect=EffectOutline::create();
    if (shaderEffect)
        registerShaderEffect("ShaderOutline",shaderEffect);
    
    shaderEffect=EffectBloom::create();
    if (shaderEffect)
        registerShaderEffect("ShaderBloom",shaderEffect);
    
    std::map<std::string,const char*> key2Sources={
        {"ShaderGreyScale",ccShader_GreyScale_Frag},
        {"ShaderBanish",ccShader_Banish_Frag},
        {"ShaderFire",ccShader_Fire_Frag},
        {"ShaderFrozen",ccShader_Frozen_Frag},
        {"ShaderGrayScaling",ccShader_GrayScaling_Frag},
        {"ShaderIce",ccShader_Ice_Frag},
        {"ShaderMirror",ccShader_Mirror_Frag},
        {"ShaderPoison",ccShader_Poison_Frag},
        {"ShaderStone",ccShader_Stone_Frag},
        {"ShaderVanish",ccShader_Vanish_Frag},
        {"ShaderSepia",ccShader_Sepia_Frag}
    };
    
    for (auto iter:key2Sources)
    {
        shaderEffect=ShaderEffect::create(iter.second);
        if (shaderEffect) {
            registerShaderEffect(iter.first.c_str(),shaderEffect);
        }
    }
    
	return true;
}

void EffectManager::registerShaderEffect(const char* shaderKey,ShaderEffect* shaderEffect)
{
    _shaderEffectsMap.insert(shaderKey, shaderEffect);
}

void EffectManager::useShaderEffect(Sprite* sprite,const char* shaderKey)
{
    ShaderEffect* shaderEffect=getShaderEffectByKey(shaderKey);
    if (shaderEffect)
    {
        shaderEffect->setTarget(sprite);
        sprite->setGLProgramState(shaderEffect->getGLProgramState());
    }
}

ShaderEffect* EffectManager::getShaderEffectByKey(const char* shaderKey)
{
    Map<std::string,ShaderEffect*>::iterator findIter=_shaderEffectsMap.find(shaderKey);
    if (_shaderEffectsMap.end()!=findIter)
    {
        return findIter->second;
    }
    return nullptr;
}

GLProgramState* EffectManager::getGLProgramStateByKey(const char* shaderKey)
{
    ShaderEffect* shaderEffect=getShaderEffectByKey(shaderKey);
    if (shaderEffect)
    {
        return shaderEffect->getGLProgramState();
    }
    return nullptr;
}

void EffectManager::useDefaultShaderEffect(cocos2d::Sprite *sprite)
{
    sprite->setGLProgramState(GLProgramState::getOrCreateWithGLProgramName(GLProgram::SHADER_NAME_POSITION_TEXTURE_COLOR_NO_MVP));
}


