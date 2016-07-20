#ifndef __MarqueeManager__
#define __MarqueeManager__

#include "cocos2d.h"
USING_NS_CC;
//using namespace cocos2d::ui;

class CCRichTextStyle;

class MarqueeManager:public Ref
{
public:
    static MarqueeManager* getInstance();
    
    void appendRichText(const char *lpcszData);
    void appendRichSprite(const char *spriteFrameName);
    void appendRichNode(Node *lpcData);
    
    void setDetailStyle(const char *lpcszFontFamily, int fFontSize, Color4B &color);
    void setTextColor(Color4B &color);
    
    void startMarquee();
    void updateMarquee(float delta);
    void stopMarquee();
    
    void setBgImgFile(const char* imgFile);
    void setStartPosition(Vec2 position);
    void setInterval(int delayInterval,int actionInterval);
    
    void setLocalZOrder(int zOrder);
    
protected:
    __Array* getCurRichContentDatasArray();
    void showMarquee(__Array* curRichContentDatasArray);
    
    static MarqueeManager* create();
    
    MarqueeManager();
    virtual ~MarqueeManager();
    
    virtual bool init();
    
    static MarqueeManager* s_MarqueeManager;
    
    int _delayInterval;
    int _actionInterval;
    int _localZOrder;
    
    long _lastMilliSecond;
    std::string _bgImgFile;
    Vec2 _startPosition;
    Vec2 _endPosition;
    
    CCRichTextStyle* m_pCurrentStyle;
    __Array* m_pCurRichContentDatasArray;
    __Array* m_pRichContentDataGroupsArray;

};


#endif /* defined(__MarqueeManager__) */
