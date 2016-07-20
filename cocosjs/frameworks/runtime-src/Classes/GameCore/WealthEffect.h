
#ifndef __WealthEffect__
#define __WealthEffect__

#include "cocos2d.h"
USING_NS_CC;


class WealthEffect:public Ref
{
public:
    static WealthEffect* getInstance();
    
    WealthEffect();
    virtual ~WealthEffect();
    
    void createEffect1(const char* spriteFrameName,int count,float scale,Vec2 startPoint,Vec2 stopPoint);
    
    void createEffect(const char* spriteFrameName,int count,float scale,Vec2 startPoint,Vec2 stopPoint);
    void loadEffect(const char* plistFile,const char* spriteFrameName,float delayPerUnit=0.2f,int loopNum=1);
    void setLocalZOrder(int zOrder);

    virtual void update(float deltaTime);
protected:
    typedef struct _ExplosionData
    {
        int ID;
        float delayTime;
        int stage;
        Vec2 _speed;
        Vec2 _acceleration;
        Animate* _animate;
        Vec2 _startPoint;
        Vec2 _stopPoint;
        
        Sprite* _explosionSprite;
        
    } ExplosionData;
    
    void updateEffect(float deltaTime);
    void updateEffect1(float deltaTime);
    
    void startEffect();
    void stopEffect();
    
    virtual bool init();
    static WealthEffect* create();
    static WealthEffect* s_WealthEffect;
    
    std::vector<ExplosionData*> _explosionDataVector;
    std::vector<ExplosionData*> _removeDataVector;
    Map<std::string,Animate*> _animateMap;
    
    bool _isRunning;
    int _localZOrder;
};

#endif /* defined(__WealthEffect__) */