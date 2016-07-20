#include "EntitySprite.h"

using namespace std;

const char* g_aIdToAName[]={
    "none",         //0
    "idle",         //1
    "walk",         //2
    "run",          //3
    "attack",       //4
    "dead",         //5
    "hurt" ,        //6
    "magic"         //7
};




EntitySpriteManger* EntitySpriteManger::s_sharedInstance = nullptr;

EntitySpriteManger* EntitySpriteManger::getInstance()
{
    if (! s_sharedInstance)
        s_sharedInstance = new (std::nothrow)EntitySpriteManger();
    return s_sharedInstance;
}

void EntitySpriteManger::deleteInstance()
{
    if(s_sharedInstance != nullptr)
    {
        delete s_sharedInstance;
        s_sharedInstance = nullptr;
    }
}

EntitySpriteManger::EntitySpriteManger()
{
    _spriteFrameCache=SpriteFrameCache::getInstance();
    _animationCache=AnimationCache::getInstance();
}

EntitySpriteManger::~EntitySpriteManger()
{
}

void EntitySpriteManger::getPlistNameBySkinId(int skinId,string& plistFileName)
{
    auto findIter=_skinIdToPlistNamesMap.find(skinId);
    if (findIter==_skinIdToPlistNamesMap.end())
    {
        std::stringstream stringStream;
        stringStream<<"character/"<<skinId<<".plist";
        plistFileName=stringStream.str();
        _skinIdToPlistNamesMap[skinId]=plistFileName;
    }
    else
    {
        plistFileName=findIter->second;
    }
}

bool static frameNameSortCompare(string first,string second)
{
    int findIndex=(int)first.find_last_of("_");
    string tmpStr=first.substr(findIndex+1);
    int firstNum=atoi(tmpStr.c_str());
    
    findIndex=(int)second.find_last_of("_");
    tmpStr=second.substr(findIndex+1);
    int secondNum=atoi(tmpStr.c_str());
    
    return firstNum<secondNum;
}

map<string,vector<string>* >* EntitySpriteManger::getPlistToActionNamesMap(int skinId,string& plistFileName)
{
    auto findIter=_skinIdToActionNamesMap.find(skinId);
    if (findIter==_skinIdToActionNamesMap.end())
    {
        std::string fullPath = FileUtils::getInstance()->fullPathForFilename(plistFileName);
        if (fullPath.size() == 0)
        {
            // return if plist file doesn't exist
            CCLOG("cocos2d: SpriteFrameCache: can not find %s", plistFileName.c_str());
            return nullptr;
        }
        map<string,vector<string>* >* actionKeyToFrameNamesMap=new map<string,vector<string>* >;
        
        ValueMap dictionary = FileUtils::getInstance()->getValueMapFromFile(fullPath);
        ValueMap& framesDict = dictionary["frames"].asValueMap();
        
        if (dictionary.find("metadata") != dictionary.end())
        {
            ValueMap& metadataDict = dictionary["metadata"].asValueMap();
            string texturePath = metadataDict["textureFileName"].asString();
            
            if (!texturePath.empty())
            {
                texturePath = FileUtils::getInstance()->fullPathFromRelativeFile(texturePath.c_str(), plistFileName);
                _skinIdToTextureNamesMap[skinId]=texturePath;
            }
        }
        
        std::string spriteFrameName;
        std::string actionKey;
        map<string,vector<string>* >::iterator actionIter;
        vector<string>* frameNamesVector;
        for (auto iter = framesDict.begin(); iter != framesDict.end(); ++iter)
        {
            spriteFrameName = iter->first;
            CCASSERT(spriteFrameName.length()>7,"ERROR,EntitySpriteManger::loadResBySkinId spriteFrameName");
            
            int findIndex=(int)spriteFrameName.find_last_of("_");
            actionKey=spriteFrameName.substr(0,findIndex);
            
            actionIter=actionKeyToFrameNamesMap->find(actionKey);
            if (actionIter==actionKeyToFrameNamesMap->end())
            {
                frameNamesVector=new vector<string>;
                (*actionKeyToFrameNamesMap)[actionKey]=frameNamesVector;
            }
            else
            {
                frameNamesVector=actionIter->second;
            }
            
            frameNamesVector->push_back(spriteFrameName);
        }
        
        for (auto iter:*actionKeyToFrameNamesMap)
        {
            std::sort(iter.second->begin(), iter.second->end(),frameNameSortCompare);
        }
        _skinIdToActionNamesMap[skinId]=actionKeyToFrameNamesMap;
        return actionKeyToFrameNamesMap;
    }
    return findIter->second;
}

Animation* EntitySpriteManger::getAnimationByActionName(const char* actionName)
{
    return _animationCache->getAnimation(actionName);
}

Animation* EntitySpriteManger::getAnimationByActionName(int skinId,int direction,kActionType actionType)
{
    const char* actionName=g_aIdToAName[actionType];
    char actionKey[128]={};
    sprintf(actionKey, "%d_%d%s",skinId,direction,actionName);
    Animation* animation=getAnimationByActionName(actionKey);
    if (animation==nullptr)
    {
        sprintf(actionKey, "%d_%s",skinId,actionName);
        animation=getAnimationByActionName(actionKey);
        
        if (animation==nullptr)
        {
//            char msg[128]={0};
//            sprintf(msg, "EntitySpriteManger::getAnimationByActionName animation==nullptr,skinId=%d",skinId);
//            MessageBox(msg, "bad tips");
            CCLOG("EntitySpriteManger::getAnimationByActionName animation==nullptr,skinId=%d",skinId);
        }
    }
    //    CCASSERT(animation!=nullptr, "EntitySpriteManger::getAnimationByActionName animation==nullptr");
    return animation;
}

void EntitySpriteManger::addAnimationToCach(map<string,vector<string>* >* aFsMap)
{
    std::string spriteFrameName;
    std::string actionKey;
    Animation* animation;
    Vector<SpriteFrame*> arrayOfSpriteFrames;
    SpriteFrame* spriteFrame;
    for (auto iter=aFsMap->begin(); iter!=aFsMap->end(); iter++)
    {
        actionKey=iter->first;
        animation=_animationCache->getAnimation(actionKey);
        if (animation==nullptr)
        {
            arrayOfSpriteFrames.clear();
            for (auto subIter=iter->second->begin(); subIter!=iter->second->end(); subIter++)
            {
                spriteFrame=_spriteFrameCache->getSpriteFrameByName(*subIter);
                CCASSERT(spriteFrame!=nullptr, "ERROR spriteFrame no exist!");
                
                arrayOfSpriteFrames.pushBack(spriteFrame);
            }
            animation=Animation::createWithSpriteFrames(arrayOfSpriteFrames,0.1f);
            _animationCache->addAnimation(animation, actionKey);
        }
    }
}

bool EntitySpriteManger::loadResBySkinId(int skinId)
{
    auto findIter=_skinIdToPlistNamesMap.find(skinId);
    if (findIter!=_skinIdToPlistNamesMap.end())
    {
        CCLOG("had loadResBySkinId=====>>skinId=%d",skinId);
        return true;
    }
    CCLOG("need loadResBySkinId=====>>skinId=%d",skinId);
    
    string plistFileName="";
    getPlistNameBySkinId(skinId,plistFileName);
    map<string,vector<string>* >* aFsMap=getPlistToActionNamesMap(skinId,plistFileName);
    if(aFsMap==nullptr)
    {
        CCLOG("fail loadResBySkinId=====>>skinId=%d",skinId);
        return false;
    }
    
    _spriteFrameCache->addSpriteFramesWithFile(plistFileName);
    addAnimationToCach(aFsMap);
    return true;
}

void EntitySpriteManger::removeResBySkinId(int skinId)
{
    auto findIter=_skinIdToPlistNamesMap.find(skinId);
    if (findIter==_skinIdToPlistNamesMap.end())
        return;
    
    string plistFileName=findIter->second;
    _skinIdToPlistNamesMap.erase(findIter);
    auto tmpIter=_skinIdToActionNamesMap.find(skinId);
    if (tmpIter!=_skinIdToActionNamesMap.end())
    {
        std::string actionKey;
        map<string,vector<string>* >* aFsMap=tmpIter->second;
        for (auto iter=aFsMap->begin(); iter!=aFsMap->end(); iter++)
        {
            actionKey=iter->first;
            _animationCache->removeAnimation(actionKey);
//            delete iter->second;
//            aFsMap->erase(iter);
        }
    }
    _spriteFrameCache->removeSpriteFramesFromFile(plistFileName);
    
    findIter=_skinIdToTextureNamesMap.find(skinId);
    if (findIter!=_skinIdToTextureNamesMap.end())
    {
        Director::getInstance()->getTextureCache()->removeTextureForKey(findIter->second);
        _skinIdToTextureNamesMap.erase(findIter);
    }
}

void EntitySpriteManger::clearEntitySpriteByType(int type)
{
    auto findIter=_typeToSkinIds.find(type);
    if (findIter!=_typeToSkinIds.end())
    {
        for (auto iter:findIter->second)
        {
            clearEntitySpriteBySkinId(iter);
        }
    }
}

void EntitySpriteManger::clearEntitySpriteBySkinId(int skinId)
{
    _skinIdToEntitySpritesCaches.erase(skinId);
    _skinIdToEntitySprites.erase(skinId);
    clearActionBySkinId(skinId);
}

EntitySprite* EntitySpriteManger::createEntitySprite(int skinId,int type)
{
    __Array* entitySpritesCaches=_skinIdToEntitySpritesCaches.at(skinId);
    if (!entitySpritesCaches) {
        entitySpritesCaches=__Array::create();
        _skinIdToEntitySpritesCaches.insert(skinId, entitySpritesCaches);
    }
    
    EntitySprite* targetEntitySprite=nullptr;
    __Array* entitySprites=_skinIdToEntitySprites.at(skinId);
    if (!entitySprites) {
        entitySprites=__Array::create();
        _skinIdToEntitySprites.insert(skinId, entitySprites);
    }else{
        for (int index=0; index<entitySprites->count(); index++)
        {
            targetEntitySprite=dynamic_cast<EntitySprite*>(entitySprites->getObjectAtIndex(index));
            if(!targetEntitySprite->getParent())
            {
                entitySpritesCaches->addObject(targetEntitySprite);
                entitySprites->removeObjectAtIndex(index);
                index--;
            }
        }
    }
    targetEntitySprite=nullptr;
    if (entitySpritesCaches->count()==0)
    {
        targetEntitySprite=EntitySprite::create(skinId);
        entitySprites->addObject(targetEntitySprite);
        
        auto findIter=_typeToSkinIds.find(type);
        if (findIter==_typeToSkinIds.end())
        {
            _typeToSkinIds[type]=std::set<int>();
        }
        _typeToSkinIds[type].insert(skinId);
    }
    else
    {
        targetEntitySprite=dynamic_cast<EntitySprite*>(entitySpritesCaches->getObjectAtIndex(0));
        entitySprites->addObject(targetEntitySprite);
        entitySpritesCaches->removeObjectAtIndex(0);
        targetEntitySprite->reset();
    }
    targetEntitySprite->setScale(1.0f);
    return targetEntitySprite;
}

Action* EntitySpriteManger::getActionByActionName(int skinId,int direction,kActionType actionType,float delayPerUnit)
{
    const char* actionName=g_aIdToAName[actionType];
    char actionKey[128]={};
    sprintf(actionKey, "%d_%d%s",skinId,direction,actionName);
    
    auto findIter=_actionNameToAction.find(actionKey);
    if (findIter!=_actionNameToAction.end())
    {
        return findIter->second->clone();
    }
    
    Animation* animation=this->getAnimationByActionName(actionKey);
    if (animation==nullptr)
    {
        char tmpActionKey[128]={};
        sprintf(tmpActionKey, "%d_%s",skinId,actionName);
        animation=this->getAnimationByActionName(tmpActionKey);
        if (animation==nullptr)
        {
            CCLOG("EntitySprite::getActionByActionName animation==nullptr,skinId=%d",skinId);
            return nullptr;
        }
    }
    if (delayPerUnit>0.0f)
    {
        animation->setDelayPerUnit(delayPerUnit);
    }
    Action* action=nullptr;
    if (actionType==kActionAttack
        || actionType==kActionMagic
        || actionType==kActionDead
        || actionType==kActionHurt)
    {
        action=Animate::create(animation);
    }
    else
    {
        animation->setLoops(-1);
        action=Animate::create(animation);
    }
    _actionNameToAction.insert(actionKey, action);
    return action;
}

Action* EntitySpriteManger::getSkillActionByActionName(int skinId,int direction,kActionType actionType,float delayTime,float delayPerUnit)
{
    const char* actionName=g_aIdToAName[actionType];
    char actionKey[128]={};
    sprintf(actionKey, "%d_%d%s",skinId,direction,actionName);
    
    auto findIter=_actionNameToAction.find(actionKey);
    if (findIter!=_actionNameToAction.end())
    {
        return findIter->second->clone();
    }
    
    Animation* animation=this->getAnimationByActionName(actionKey);
    if (animation==nullptr)
    {
        char tmpActionKey[128]={};
        sprintf(tmpActionKey, "%d_%s",skinId,actionName);
        animation=this->getAnimationByActionName(tmpActionKey);
        if (animation==nullptr)
        {
            CCLOG("EntitySpriteManger::getSkillActionByActionName animation==nullptr,skinId=%d",skinId);
            return nullptr;
        }
    }
    if (delayPerUnit>0.0f)
    {
        animation->setDelayPerUnit(delayPerUnit);
    }
    Action* effectAction=nullptr;
    if (delayTime>0.0f)
    {
        effectAction=Sequence::create(
                                      Hide::create(),
                                      DelayTime::create(delayTime),
                                      Show::create(),
                                      Animate::create(animation),
                                      Hide::create(),
                                      NULL);
    }
    else
    {
        effectAction=Sequence::create(
                                      Show::create(),
                                      Animate::create(animation),
                                      Hide::create(),
                                      NULL);
    }
    _actionNameToAction.insert(actionKey, effectAction);
    return effectAction;
}

Action* EntitySpriteManger::getHSkillActionByActionName(int skinId,int direction,kActionType actionType,float delayTime,float delayPerUnit)
{
    const char* actionName=g_aIdToAName[actionType];
    char actionKey[128]={};
    sprintf(actionKey, "%d_%d%s",skinId,direction,actionName);
    
    auto findIter=_actionNameToAction.find(actionKey);
    if (findIter!=_actionNameToAction.end())
    {
        return findIter->second->clone();
    }
    
    Animation* animation=this->getAnimationByActionName(actionKey);
    if (animation==nullptr)
    {
        char tmpActionKey[128]={};
        sprintf(tmpActionKey, "%d_%s",skinId,actionName);
        animation=this->getAnimationByActionName(tmpActionKey);
        if (animation==nullptr)
        {
            CCLOG("EntitySpriteManger::getSkillActionByActionName animation==nullptr,skinId=%d",skinId);
            return nullptr;
        }
    }
    if (delayPerUnit>0.0f)
    {
        animation->setDelayPerUnit(delayPerUnit);
    }
    Action* effectAction=nullptr;
    if (delayTime>0.0f)
    {
        effectAction=Sequence::create(
                                      Hide::create(),
                                      DelayTime::create(delayTime),
                                      Show::create(),
                                      Animate::create(animation),
                                      RemoveSelf::create(),
                                      NULL);
    }
    else
    {
        effectAction=Sequence::create(
                                      Show::create(),
                                      Animate::create(animation),
                                      RemoveSelf::create(),
                                      NULL);
    }
    _actionNameToAction.insert(actionKey, effectAction);
    return effectAction;
}

void EntitySpriteManger::clearActionBySkinId(int skinId)
{
    char clearKey[64]={};
    sprintf(clearKey, "%d",skinId);
    std::vector<std::string> allKeys=_actionNameToAction.keys();
    for (auto iter:allKeys)
    {
        auto result=iter.find(clearKey);
        if (result==0) {
            _actionNameToAction.erase(iter);
        }
    }
}


struct{int resDirect;bool isFlippedX;} g_directionID[9]={
    -1,false,//占位
    1,false,
    2,false,
    3,false,
    4,false,
    5,false,
    4,true,
    3,true,
    2,true
};


void EntitySprite::loadResById(int id)
{
    if (id>0)
    {
        EntitySpriteManger::getInstance()->loadResBySkinId(id);
    }
}

void EntitySprite::removeResById(int id)
{
    EntitySpriteManger::getInstance()->removeResBySkinId(id);
}

void EntitySprite::clearAllRes()
{
    EntitySpriteManger::deleteInstance();
}

EntitySprite::EntitySprite()
:_skinId(0)
,_shadowSprite(nullptr)
,_weaponSprite(nullptr)
,_effectSprite(nullptr)
,_eventCallback(nullptr)
,_curActionType(kActionNone)
,_weaponId(0)
{
    _entitySpriteManager=EntitySpriteManger::getInstance();
}

EntitySprite::~EntitySprite()
{
    _eventCallback=nullptr;
    this->reset();
}

EntitySprite* EntitySprite::create(int skinId)
{
    EntitySprite *entity = new (std::nothrow)EntitySprite();
    if (entity && entity->initWithSkinId(skinId))
    {
        entity->autorelease();
        return entity;
    }
    CC_SAFE_DELETE(entity);
    return nullptr;
}

bool EntitySprite::initWithSkinId(int skinId)
{
    if (Node::init())
    {
        _skinId=skinId;
        
        _contentSprite=Sprite::create();
        this->addChild(_contentSprite);
    }
    
    loadRes();
//    EntitySprite::loadResById(13011);
    return true;
}

void EntitySprite::loadRes()
{
    if (_skinId>0)
    {
        _entitySpriteManager->loadResBySkinId(_skinId);
    }
}

void EntitySprite::reset()
{
    _curActionType=kActionNone;
    if(!!_contentSprite)
    {
        _contentSprite->stopAllActions();
    }
    if(!!_weaponSprite)
    {
        _weaponSprite->stopAllActions();
    }
    if(!!_effectSprite)
    {
        _effectSprite->stopAllActions();
    }
}

Animation* EntitySprite::getAnimationByActionName(int skinId,int direction,kActionType actionType,float delayPerUnit)
{
    const char* actionName=g_aIdToAName[actionType];
    char actionKey[128]={};
    sprintf(actionKey, "%d_%d%s",skinId,direction,actionName);
    Animation* animation=_entitySpriteManager->getAnimationByActionName(actionKey);
    if (animation==nullptr)
    {
        sprintf(actionKey, "%d_%s",skinId,actionName);
        animation=_entitySpriteManager->getAnimationByActionName(actionKey);
        if (animation==nullptr)
        {
            CCLOG("EntitySprite::getAnimationByActionName animation==nullptr,skinId=%d",skinId);
            return nullptr;
        }
    }
    if (delayPerUnit>0.0f)
    {
        animation->setDelayPerUnit(delayPerUnit);
    }
    return animation;
}

Action* EntitySprite::getActionByActionName(int skinId,int direction,kActionType actionType,float delayPerUnit)
{
    const char* actionName=g_aIdToAName[actionType];
    char actionKey[128]={};
    sprintf(actionKey, "%d_%d%s",skinId,direction,actionName);
    
    auto findIter=_actionNameToAction.find(actionKey);
    if (findIter!=_actionNameToAction.end())
    {
        return findIter->second->clone();
    }
    
    Animation* animation=_entitySpriteManager->getAnimationByActionName(actionKey);
    if (animation==nullptr)
    {
        char tmpActionKey[128]={};
        sprintf(tmpActionKey, "%d_%s",skinId,actionName);
        animation=_entitySpriteManager->getAnimationByActionName(tmpActionKey);
        if (animation==nullptr)
        {
            CCLOG("EntitySprite::getActionByActionName animation==nullptr,skinId=%d",skinId);
            return nullptr;
        }
    }
    if (delayPerUnit>0.0f)
    {
        animation->setDelayPerUnit(delayPerUnit);
    }
    Action* action=nullptr;
    if (actionType==kActionAttack
        || actionType==kActionMagic
        || actionType==kActionDead
        || actionType==kActionHurt)
    {
        if (_skinId==skinId)
        {
            CallFunc* callFunc=CallFunc::create([=]{
                if(_eventCallback!=nullptr)
                    _eventCallback(actionType);
            });
            action=Sequence::create(Animate::create(animation),callFunc, NULL);
        }
        else
        {
            action=Animate::create(animation);
        }
    }
    else
    {
        animation->setLoops(-1);
        action=Animate::create(animation);
    }
    _actionNameToAction.insert(actionKey, action);
    return action;
}

bool EntitySprite::show(int _,int direction,kActionType actionType,float delayPerUnit)
{
    if(direction<1 || direction>8)
        return false;
    
    if(_curActionType==kActionDead)
        return false;
    
    if(actionType==kActionIdle
       || actionType==kActionWalk
       || actionType==kActionRun)
    {
        if (actionType==_curActionType
            && _direction==direction) {
            return true;
        }
    }
    _direction=direction;
    _curActionType=actionType;
    int resDirect=g_directionID[_direction].resDirect;
    Action* action=this->getActionByActionName(_skinId,resDirect,_curActionType,delayPerUnit);
    if(!action)
    {
        _contentSprite->setFlippedX(g_directionID[direction].isFlippedX);
        return false;
    }
    _contentSprite->stopAllActions();
    
    
//    if (actionType==kActionAttack || actionType==kActionMagic
//        || actionType==kActionDead || actionType==kActionHurt)
//    {
//        CallFunc* callFunc=CallFunc::create([=]{
//            if(_eventCallback!=nullptr)
//                _eventCallback(actionType);
//        });
//        action=Sequence::create((ActionInterval*)action,callFunc, NULL);
//    }
    _contentSprite->runAction(action);
    _contentSprite->setFlippedX(g_directionID[direction].isFlippedX);
    
    if (_weaponId>0)
    {
        if (!_weaponSprite)
        {
            _weaponSprite=Sprite::create();
            this->addChild(_weaponSprite);
        }
        else
        {
            _weaponSprite->stopAllActions();
        }
        action=_entitySpriteManager->getActionByActionName(_weaponId,resDirect,_curActionType,delayPerUnit);
        _weaponSprite->runAction(action);
        _weaponSprite->setFlippedX(g_directionID[direction].isFlippedX);
    }
    
    if(actionType==kActionWalk
       || actionType==kActionRun)
    {
        if (!!_effectSprite)
        {
            if (!(_curActionType==kActionAttack
                  ||_curActionType==kActionMagic))
            {
                _effectSprite->setVisible(false);
            }
        }
    }
    return true;
}

void EntitySprite::showAttackEffect(int skillId,float delayTime,int positionY,float delayPerUnit)
{
    if (!_effectSprite)
        return;

    _effectSprite->stopAllActions();
    if (skillId>0 && (_curActionType==kActionAttack ||_curActionType==kActionMagic))
    {
        int resDirect=g_directionID[_direction].resDirect;
        Action* effectAction=_entitySpriteManager->getSkillActionByActionName(skillId,resDirect,kActionAttack,delayTime,delayPerUnit);
        if (effectAction!=nullptr)
        {
            _effectSprite->runAction(effectAction);
            _effectSprite->setFlippedX(g_directionID[_direction].isFlippedX);
            _effectSprite->setPositionY(positionY);
            return;
        }
        _effectSprite->setLocalZOrder(10);
    }
    _effectSprite->setVisible(false);
}

void EntitySprite::showHitEffect(int skillId,float delayTime,int positionY,float delayPerUnit)
{
    if (skillId==0)
        return;
    
    int resDirect=g_directionID[_direction].resDirect;
    Action* effectAction=_entitySpriteManager->getHSkillActionByActionName(skillId,resDirect,kActionAttack,delayTime,delayPerUnit);
    
    if (!effectAction)
        return;
    
    Sprite* effectSprite=Sprite::create();
    effectSprite->runAction(effectAction);
    Node* parent=this->getParent();
    if (parent && parent->getParent())
    {
        effectSprite->setLocalZOrder(-parent->getPositionY()+2);
        Vec2 position=parent->getPosition();
        position.y+=positionY;
        effectSprite->setPosition(position);
        parent->getParent()->addChild(effectSprite);
    }
}

Sprite* EntitySprite::createHitEffect(int skillId,float delayTime,float delayPerUnit)
{
    if (skillId==0)
        return nullptr;
    
    int resDirect=g_directionID[_direction].resDirect;
    Action* effectAction=_entitySpriteManager->getHSkillActionByActionName(skillId,resDirect,kActionAttack,delayTime,delayPerUnit);
    
    if (!effectAction)
        return nullptr;
    
    Sprite* effectSprite=Sprite::create();
    effectSprite->runAction(effectAction);
    return effectSprite;
}

bool EntitySprite::singleShow()
{
    auto animation=_entitySpriteManager->getAnimationByActionName(_skinId,0,kActionIdle);
    if (animation==nullptr)
        return false;
    
    _contentSprite->stopAllActions();
    Action* action=RepeatForever::create(Animate::create(animation));
    _contentSprite->runAction(action);
    return true;
}

Sprite* EntitySprite::createAnimateSprite(int skinId,kActionType actionType,float delayPerUnit,unsigned int loop)
{
    if(!EntitySpriteManger::getInstance()->loadResBySkinId(skinId))
        return nullptr;
    
    auto animation=EntitySpriteManger::getInstance()->getAnimationByActionName(skinId,0,actionType);
    if (animation==nullptr)
        return nullptr;
    
    animation->setDelayPerUnit(delayPerUnit);
    Sprite* contentSprite=Sprite::create();
    Action* action=nullptr;
    if(loop>9999)
    {
        action=RepeatForever::create(Animate::create(animation));
    }
    else
    {
        animation->setLoops(loop);
        action=Animate::create(animation);
    }
    contentSprite->runAction(action);
    return contentSprite;
}

Sprite* EntitySprite::createAutoAnimateSprite(int skinId,float delayTime,float delayPerUnit)
{
    if(!EntitySpriteManger::getInstance()->loadResBySkinId(skinId))
        return nullptr;
    
    auto animation=EntitySpriteManger::getInstance()->getAnimationByActionName(skinId,0,kActionIdle);
    if (animation==nullptr)
        return nullptr;
    
    animation->setDelayPerUnit(delayPerUnit);
    
    Sprite* contentSprite=Sprite::create();
    Action* action=nullptr;
    if (delayTime>0)
    {
        contentSprite->setVisible(false);
        action=Sequence::create(
                                DelayTime::create(delayTime),
                                Show::create(),
                                Animate::create(animation),
                                RemoveSelf::create(),
                                NULL);
    }
    else
    {
        action=Sequence::create(
                                Animate::create(animation),
                                RemoveSelf::create(),
                                NULL);
    }
    contentSprite->runAction(action);
    return contentSprite;
}

void EntitySprite::addEventListener(const std::function<void(int)>& callback)
{
    _eventCallback=callback;
}

void EntitySprite::setOpacity(GLubyte opacity)
{
    _contentSprite->setOpacity(opacity);
    if (!!_shadowSprite)
    {
        _shadowSprite->setOpacity(opacity);
    }
}

void EntitySprite::setAnchorPoint(const Vec2& anchorPoint)
{
    _contentSprite->setAnchorPoint(anchorPoint);
}

Sprite* EntitySprite::getContentSprite()
{
    return _contentSprite;
}

void EntitySprite::setShadowSprite(const char* shadowSpriteName)
{
    this->hideShadowSprite();
    _shadowSprite=Sprite::createWithSpriteFrameName(shadowSpriteName);
    _shadowSprite->setLocalZOrder(-1);
    _shadowSprite->setPosition(0.0f,-getPositionY());
    this->addChild(_shadowSprite);
}

void EntitySprite::hideShadowSprite()
{
    if (!!_shadowSprite)
    {
        this->removeChild(_shadowSprite);
        _shadowSprite=nullptr;
    }
}

void EntitySprite::setWeaponId(int weaponId)
{
    if (weaponId<=0)
    {
        _weaponId=0;
        if (!!_weaponSprite)
        {
            this->removeChild(_weaponSprite);
            _weaponSprite=nullptr;
        }
        return;
    }
    _weaponId=weaponId;
    if (!_weaponSprite)
    {
        _weaponSprite=Sprite::create();
        this->addChild(_weaponSprite);
    }
    
    _entitySpriteManager->loadResBySkinId(_weaponId);
}


void EntitySprite::enableSkillEffect(bool enable)
{
    if (enable)
    {
        if (!_effectSprite)
        {
            _effectSprite=Sprite::create();
            this->addChild(_effectSprite);
        }
    }
    else
    {
        if (!!_effectSprite)
        {
            this->removeChild(_effectSprite);
            _effectSprite=nullptr;
        }
    }
}




