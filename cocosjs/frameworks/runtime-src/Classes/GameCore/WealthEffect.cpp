#include "WealthEffect.h"
#include "GameCore.h"


CardinalSplineTo* createCardinalSplineTo(Vec2 startPoint,Vec2 endPoint)
{
    float x1=startPoint.x;
    float y1=startPoint.y;
    float x2=endPoint.x;
    float y2=endPoint.y;
    
    float targetX=0.0f;
    float targetY=0.0f;
    float delta=(x2-x1)/10.0f;
    float p=(x2-x1)*(x2-x1)/(-2*(y2-y1));
    
    auto array = PointArray::create(10);
    for (int i = 1; i < 10; i++)
    {
        targetX=x1+i*delta;
        targetY=(targetX-x1)*(targetX-x1)/(-2*p)+y1;
        array->addControlPoint(Vec2(targetX,targetY));
    }
    array->addControlPoint(endPoint);
    
    float moveInterval=(endPoint-startPoint).length()/1300.0f;
    CardinalSplineTo* cardinalSplineTo=CardinalSplineTo::create(moveInterval,array,1.0f);
    return cardinalSplineTo;
}


WealthEffect* WealthEffect::s_WealthEffect=nullptr;

WealthEffect::WealthEffect()
:_isRunning(false)
,_localZOrder(999999)
{
}

WealthEffect::~WealthEffect()
{
}

WealthEffect* WealthEffect::getInstance()
{
    if (s_WealthEffect==nullptr)
    {
        s_WealthEffect=WealthEffect::create();
        s_WealthEffect->retain();
    }
    return s_WealthEffect;
}

WealthEffect* WealthEffect::create()
{
    WealthEffect *pRet = new WealthEffect();
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

bool WealthEffect::init()
{
	return true;
}

void WealthEffect::setLocalZOrder(int zOrder)
{
    _localZOrder=zOrder;
}

void WealthEffect::createEffect1(const char* spriteFrameName,int count,float scale,Vec2 startPoint,Vec2 stopPoint)
{
    auto findIter=_animateMap.find(spriteFrameName);
    if (findIter==_animateMap.end())
        return;
    
    Animate* animate=findIter->second;
    Sprite* effectSprite;
    Vec2 position;
    auto runningScene=Director::getInstance()->getRunningScene();
    ExplosionData* explosionData;
    for (int i=0; i<count; ++i)
    {
        effectSprite=Sprite::create();
        effectSprite->setScale(scale);
        runningScene->addChild(effectSprite,_localZOrder);
        
        position.x=startPoint.x+rand_minus1_1()*50;
        position.y=startPoint.y+rand_minus1_1()*20;
        
        explosionData=new ExplosionData;
        explosionData->_explosionSprite=effectSprite;
        explosionData->delayTime=0.03*rand_0_1();
        explosionData->stage=0;
        explosionData->_animate=animate;
        explosionData->_startPoint=position;
        explosionData->_stopPoint=stopPoint;
        explosionData->ID=5;
        
        explosionData->_speed=Vec2(0,0);
        explosionData->_acceleration=Vec2(0,-2000);;
        
        position.y+=100;
        effectSprite->setPosition(position);
        
        _explosionDataVector.push_back(explosionData);
    }
    startEffect();
}

void WealthEffect::createEffect(const char* spriteFrameName,int count,float scale,Vec2 startPoint,Vec2 stopPoint)
{
    auto findIter=_animateMap.find(spriteFrameName);
    if (findIter==_animateMap.end())
        return;

    auto runningScene=Director::getInstance()->getRunningScene();
    Animate* animate=findIter->second;
    ExplosionData* explosionData;
    Sprite* effectSprite;
    Vec2 position;
    float radian;
    Vec2 direction;
    for (int i=0; i<count; ++i)
    {
        effectSprite=Sprite::create();
        effectSprite->setScale(scale);
        
        position.x=startPoint.x+rand_minus1_1()*20;
        position.y=startPoint.y+rand_minus1_1()*20;
        effectSprite->setPosition(position);
        runningScene->addChild(effectSprite,_localZOrder);
        
        explosionData=new ExplosionData;
        explosionData->_explosionSprite=effectSprite;
        explosionData->delayTime=0.3*rand_0_1();
        explosionData->stage=0;
        explosionData->_animate=animate;
        explosionData->_stopPoint=stopPoint;
        
        radian=6.28*rand_0_1();
        direction=Vec2(cos(radian),sin(radian));
        explosionData->_speed=(500+400*rand_0_1())*direction;
        explosionData->_acceleration=-2300*direction;
        
        _explosionDataVector.push_back(explosionData);
    }
    startEffect();
}

void WealthEffect::loadEffect(const char* plistFile,const char* spriteFrameName,float delayPerUnit,int loopNum)
{
    Animate* animate=CommonLib::genarelAnimate(plistFile, spriteFrameName,delayPerUnit,loopNum);
    _animateMap.insert(spriteFrameName, animate);
}

void WealthEffect::startEffect()
{
    if (_isRunning) return;
    _isRunning=true;
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    scheduler->schedule(std::bind(&WealthEffect::update,this,std::placeholders::_1),this,0.0f,CC_REPEAT_FOREVER,0.0f,false, "WealthEffect");
}

void WealthEffect::stopEffect()
{
    if (!_isRunning) return;
    _isRunning=false;
    Scheduler* scheduler=Director::getInstance()->getScheduler();
    scheduler->unscheduleAllForTarget(this);
}

void WealthEffect::updateEffect(float deltaTime)
{
    ExplosionData* explosionData;
    Sprite* explosionSprite;
    Vec2 toPoint;
    Vec2 deltaPoint;
    for (auto iter=_explosionDataVector.begin(); iter!=_explosionDataVector.end();++iter)
    {
        explosionData=*iter;
        explosionSprite=explosionData->_explosionSprite;
        
        if (explosionData->stage==0)
        {
            if (explosionData->delayTime<0)
            {
                explosionData->stage=1;
                explosionSprite->runAction(explosionData->_animate->clone());
            }
            
            explosionData->delayTime-=deltaTime;
        }
        else if (explosionData->stage==1)
        {
            toPoint = explosionSprite->getPosition() + explosionData->_speed*deltaTime;
            explosionData->_speed += explosionData->_acceleration*deltaTime;
            explosionSprite->setPosition(toPoint);
            if (explosionData->_acceleration.x>0)
            {
                if (explosionData->_speed.x>0)
                    explosionData->stage=2;
            }
            else if(explosionData->_acceleration.x<0)
            {
                if (explosionData->_speed.x<0)
                    explosionData->stage=2;
            }
            else
            {
                if (explosionData->_acceleration.y>=0)
                {
                    if (explosionData->_speed.y>0)
                        explosionData->stage=2;
                }
                else
                {
                    if (explosionData->_speed.y<0)
                        explosionData->stage=2;
                }
            }
            if (explosionData->stage==2)
            {
                toPoint=(explosionData->_stopPoint-toPoint);
                toPoint.normalize();
                explosionData->_speed=toPoint*800;
            }
        }
        else if (explosionData->stage==2)
        {
            deltaPoint=explosionData->_speed*deltaTime;
            toPoint = explosionSprite->getPosition() + deltaPoint;
            explosionSprite->setPosition(toPoint);
            
            if ((toPoint-explosionData->_stopPoint).lengthSquared()<=deltaPoint.lengthSquared())
            {
                explosionData->stage=3;
                _removeDataVector.push_back(explosionData);
            }
        }
    }
}

void WealthEffect::updateEffect1(float deltaTime)
{
    ExplosionData* explosionData;
    Sprite* explosionSprite;
    Vec2 toPoint;
    Vec2 deltaPoint;
    for (auto iter=_explosionDataVector.begin(); iter!=_explosionDataVector.end();++iter)
    {
        explosionData=*iter;
        explosionSprite=explosionData->_explosionSprite;
        
        if (explosionData->stage==0)
        {
            if (explosionData->delayTime<0)
            {
                explosionData->stage=1;
                explosionSprite->runAction(explosionData->_animate->clone());
            }
            
            explosionData->delayTime-=deltaTime;
        }
        else if (explosionData->stage==1)
        {
            toPoint = explosionSprite->getPosition() + explosionData->_speed*deltaTime;
            explosionData->_speed += explosionData->_acceleration*deltaTime;
            explosionSprite->setPosition(toPoint);
            
            if (toPoint.y<explosionData->_startPoint.y)
            {
                if (abs(explosionData->_speed.y)<30 || explosionData->ID<0)
                {
                    explosionData->stage=2;
                    explosionSprite->runAction(createCardinalSplineTo(explosionData->_startPoint, explosionData->_stopPoint) );
                }
                else
                {
                    explosionData->_speed=-explosionData->_speed*0.8;
                }
                explosionData->ID--;
            }
        }
        
//        else if (explosionData->stage==2)
//        {
//            deltaPoint=explosionData->_speed*deltaTime;
//            toPoint = explosionSprite->getPosition() + deltaPoint;
//            explosionSprite->setPosition(toPoint);
//            
//            if ((toPoint-explosionData->_stopPoint).lengthSquared()<=deltaPoint.lengthSquared())
//            {
//                explosionData->stage=3;
//                _removeDataVector.push_back(explosionData);
//            }
//        }
    }
}

void WealthEffect::update(float deltaTime)
{
    if(_explosionDataVector.empty())
    {
        stopEffect();
        return;
    }
    
    this->updateEffect1(deltaTime);
    
    ExplosionData* explosionData;
    for (auto removeIter:_removeDataVector)
    {
        auto iter=_explosionDataVector.begin();
        while (iter!=_explosionDataVector.end())
        {
            if (removeIter==*iter)
            {
                explosionData=removeIter;
                explosionData->_explosionSprite->removeFromParent();
                _explosionDataVector.erase(iter);
                delete explosionData;
                break;
            }
            iter++;
        }
    }
    _removeDataVector.clear();
}

