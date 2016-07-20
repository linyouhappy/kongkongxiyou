

#ifndef __ItemBox__
#define __ItemBox__

#include "cocos2d.h"

USING_NS_CC;
using namespace std;

class ItemBox:public Node
{
public:
	static ItemBox* create();
    
    static void setDefaultBgSprite(const char* spriteName);
    static void setDefaultArrowSprite(const char* spriteName);
    static void setDefaultSelectSprite(const char* spriteName);
    
    void setItemId(int itemId);
    int getItemId();

	void enableEvent(bool enableEvent);
    bool isEnableEvent();
    
    void setBgSprite(const char* bgSpriteName);
    void setIconSprite(const char* iconSpriteName);
    void setColorSprite(const char* colorSpriteName);
    void setArrowSprite(const char* spriteName);
    void setLockSprite(const char* spriteName);
    void setSelectSprite(const char* spriteName);
    
    void setRightDownLabelString(const char* labelString);
    void setRightUpLabelString(const char* labelString);
    
    void enableIconSprite(bool enable);
    void enableColorSprite(bool enable);
    void enableArrowSprite(bool enable);
    void enableLockSprite(bool enable);
    void enableSelectSprite(bool enable);
    void enableRightDownLabel(bool enable);
    void enableRightUpLabel(bool enable);
    
    void enableKeepSelect(bool enable);
    
    void setNameLabelString(const char* labelString);
    
    void enableJobSprite(bool enable);
    void showJobId(int jobId);
    
    void setDefaultSetting();
    void clearAllSetting();
    
    Sprite* getIconSprite();
    void adjustIconSprite(int iconSize=70);
    
    void selected();
    void unselected();
    
    void addEventListener(std::function<void(ItemBox*)>);
    
protected:
    ItemBox();
    virtual ~ItemBox();
    
    static std::string _defaultBgSpriteName;
    static std::string _defaultArrowSpriteName;
    static std::string _defaultSelectSpriteName;
    
    virtual bool init();
    
    void activate();
    

    void setGeneralSprite(Sprite*& sprite,const char* spriteName);
    void setGeneralLabelString(Label*& label,const char* labelString);

    Sprite* _bgSprite;
    Sprite* _colorSprite;
    Sprite* _iconSprite;
    Size _bgContentSize;
    
    Sprite* _selectSprite;
    
    Label* _rightDownLabel;
    Label* _rightUpLabel;
    
    Label* _nameLabel;

    bool _enableEvent;
    Sprite* _arrowSprite;
    Sprite* _lockSprite;
    int _itemId;
    
    bool _isKeepSelect;
    
    Sprite* _jobSprite;

    std::function<void(ItemBox*)> _itemBoxCallback;
};


#endif /* defined(__ItemBox__) */


