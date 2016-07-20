#ifndef __ColorLogManager__
#define __ColorLogManager__

#include "cocos2d.h"
USING_NS_CC;
//using namespace cocos2d::ui;

class ColorLogManager:public Ref
{
public:
    static ColorLogManager* getInstance();
    
    void pushLog(const char* logString,int quality=0);
    void showLog(float);
    
    void pushNewLog(const char* logString,Color4B fontColor,int fontSize);
    
//    void startLog();
    void appendText(const char *text);
    void appendSpriteFrame(const char *spriteFrameName,int width=0);
    void appendSpriteFile(const char *spriteFileName,int width=0);
    void appendNode(Node *node);
    void resetDefaultFormat();
    void setFontFamily(const char* fontFamily);
    void setFontSize(int fontSize);
    void setFontColor(Color4B fontColor);
    void endRichLog();
    void cancelRichLog();
    
    void setDefaultColorFormat(const char* fontFamily,int fontSize,Color4B fontColor);
    void setBgImgFile(const char* imgFile);
    void setPosition(Vec2 position);
    void setLocalZOrder(int zOrder);
    
protected:
    
    typedef struct _ColorLogData
    {
        int type;
        int width;
        int height;
        int lastTime;
        Node* subNode;
    } ColorLogData;
    
    typedef struct _ColorFormat
    {
        std::string fontFamily;
        int fontSize;
        Color4B fontColor;
    } ColorFormat;
    
    static ColorLogManager* create();
    
    ColorLogManager();
    virtual ~ColorLogManager();
    
    virtual bool init();
    
    void setBgContentSize();
    __Array* getCurContentArray();

    void startShowLog();
    void stopShowLog();
    
    static ColorLogManager* s_ColorLogManager;
    
    Node* _containerNode;
    std::string _bgImgFile;
    int _bgWidth;
    int _bgHeight;
    int _minBgWidth;
    int _localZOrder;
    
    Vec2 _logPosition;
    
    std::deque<ColorLogData*> _colorLogDatasDeque;
    std::deque<ColorLogData*> _colorLogDatasCachDeque;
    
    ColorFormat _curColorFormat;
    ColorFormat _defaultColorFormat;
    
    __Array* _curContentArray;

};

#endif /* defined(__ColorManager__) */

//class Defer{public:Defer(std::function<void()> fun):_fun(fun){}~Defer(){_fun();}std::function<void()> _fun;};

