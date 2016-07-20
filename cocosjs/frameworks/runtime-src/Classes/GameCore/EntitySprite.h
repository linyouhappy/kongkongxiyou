#ifndef __EntitySprite_H__
#define __EntitySprite_H__

#include "cocos2d.h"

USING_NS_CC;

#pragma mark kActionType
enum kActionType
{
    kActionNone=0,
    kActionIdle=1,
    kActionWalk=2,
    kActionRun=3,
    kActionAttack=4,
    kActionDead=5,
    kActionHurt=6,
    kActionMagic=7
};

//class EntitySpriteManger;
class EntitySprite;

class EntitySpriteManger
{
public:
    static EntitySpriteManger* getInstance();
    static void deleteInstance();
    
    bool loadResBySkinId(int skinId);
    void removeResBySkinId(int skinId);
    
    Animation* getAnimationByActionName(const char* actionName);
    Animation* getAnimationByActionName(int skinId,int direction,kActionType actionType);
    
    EntitySprite* createEntitySprite(int skinId,int type);
    void clearEntitySpriteByType(int type);
    void clearEntitySpriteBySkinId(int skinId);
    
    void clearActionBySkinId(int skinId);
    Action* getActionByActionName(int skinId,int direction,kActionType actionType,float delayPerUnit);
    
    Action* getSkillActionByActionName(int skinId,int direction,kActionType actionType,float delayTime,float delayPerUnit);
    
    Action* getHSkillActionByActionName(int skinId,int direction,kActionType actionType,float delayTime,float delayPerUnit);

private:
    EntitySpriteManger();
    virtual ~EntitySpriteManger();
    
    void getPlistNameBySkinId(int skinId,std::string& plistName);
    void addAnimationToCach(std::map<std::string,std::vector<std::string>* >* aFsMap);
    std::map<std::string,std::vector<std::string>* >* getPlistToActionNamesMap(int skinId,std::string& plistName);

    
    static EntitySpriteManger* s_sharedInstance;
    
    SpriteFrameCache* _spriteFrameCache;
    AnimationCache* _animationCache;
    
    std::map<int,std::vector<std::string>*> _skinIdToFrameNamesMap;
    
    std::map<int,std::string> _skinIdToPlistNamesMap;
    std::map<int,std::string> _skinIdToTextureNamesMap;
    std::map<int,std::map<std::string,std::vector<std::string>* >* > _skinIdToActionNamesMap;
    
    Map<int,__Array*> _skinIdToEntitySprites;
    Map<int,__Array*> _skinIdToEntitySpritesCaches;
//    std::map<int,Vector<EntitySprite*> > _skinIdToEntitySprites;
//    std::map<int,Vector<EntitySprite*> > _skinIdToEntitySpritesCaches;
    std::map<int,std::set<int> > _typeToSkinIds;
    
    Map<std::string,Action*> _actionNameToAction;

};

class EntitySprite:public Node
{
public:
	EntitySprite();
	virtual ~EntitySprite();

    static EntitySprite* create(int skinId);
    static Sprite* createAnimateSprite(int skinId,kActionType actionType,float delayPerUnit,unsigned int loop);
    static Sprite* createAutoAnimateSprite(int skinId,float delayTime,float delayPerUnit);

    static void loadResById(int id);
    static void removeResById(int id);
    static void clearAllRes();

    bool initWithSkinId(int skinId);
    void loadRes();
    void reset();
    
    virtual bool show(int skillId,int direction,kActionType actionType,float delayPerUnit=0.0f);
    
    void showAttackEffect(int skillId,float delayTime,int positionY,float delayPerUnit=0.1f);
    void showHitEffect(int skillId,float delayTime,int positionY,float delayPerUnit=0.1f);
    Sprite* createHitEffect(int skillId,float delayTime,float delayPerUnit=0.1f);
    
    virtual bool singleShow();
    void addEventListener(const std::function<void(int)>& callback);
    
    virtual void setOpacity(GLubyte opacity);
    virtual void setAnchorPoint(const Vec2& anchorPoint);
    Sprite* getContentSprite();
    
    void setShadowSprite(const char* shadowSpriteName);
    void hideShadowSprite();
    
    void setWeaponId(int weaponId);
    void enableSkillEffect(bool enable);
    
protected:
    
    Animation* getAnimationByActionName(int skinId,int direction,kActionType actionType,float delayPerUnit);
    Action* getActionByActionName(int skinId,int direction,kActionType actionType,float delayPerUnit);
    
    
    int _skinId;
    Sprite* _contentSprite;
    Sprite* _shadowSprite;
    Sprite* _weaponSprite;
    Sprite* _effectSprite;
    int _weaponId;
    
    int _direction;
    int _curSkinId;
    kActionType _curActionType;
    std::function<void(int)> _eventCallback;
    
    Map<std::string,Action*> _actionNameToAction;
    
    EntitySpriteManger* _entitySpriteManager;
    
    int _internalID;
};

#endif // __EntitySprite_H__
