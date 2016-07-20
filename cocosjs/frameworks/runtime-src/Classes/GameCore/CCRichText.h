#ifndef __CCRich_Text__
#define __CCRich_Text__

#include "cocos2d.h"
#include <vector>
#include <map>
#include "cocos-ext.h"
USING_NS_CC_EXT;

USING_NS_CC;
using namespace std;

typedef enum
{
    kTextStyleNormal    = 1,
    kTextStyleHerf      = 2,
    kTextStyleBracketHerf  = 3,
}kTextStyle;

typedef enum
{
    kRichTextLoaded     =0,
    kRichTextTouchEvent =1,
    kRichTextTouchBegan =2,
    kRichTextTouchEnded =3,
    
} kRichTextState;

class CCRichTextStyle
{
public:
    CCRichTextStyle();

    CCRichTextStyle &operator =(const CCRichTextStyle &rhs);
    bool operator ==(const CCRichTextStyle &rhs) const;
    bool operator !=(const CCRichTextStyle &rhs) const;
    bool operator <(const CCRichTextStyle &rhs) const;
    string m_szFontFamily;            //font name, font family
    int m_fFontSize;                //font size
    Color4B m_cFontColor;           //font color , use ccc4 to create color example:  ccc4(r,b,g,a)

};

class CCRichTextMetric
{
public:
    CC_SYNTHESIZE(float, m_fWideCharWidth, WideCharWidth);
    CC_SYNTHESIZE(float, m_fCharHeight, CharHeight);
    float getCharWidth(char ch);
public:
    map<char, float> m_mapCharsWidth;
};

class CCRichTextStyleDataCache
{
public:
    static CCRichTextMetric *getData(CCRichTextStyle &style);
};

class CCReactContent
{
public:
    CC_SYNTHESIZE(int, m_nLineNum, LineNumber);
    int m_nEventId;
    int m_nNodeId;
};

class CCRichContentData : public Ref, public CCReactContent
{
public:
    CCRichContentData(Ref *pObject);
    static CCRichContentData *create(Ref *pObject);
    virtual ~CCRichContentData();
    
    CC_SYNTHESIZE_RETAIN(Ref*, m_Data, Data);
    CC_SYNTHESIZE_RETAIN(__String*, m_animateName, AnimateName);
    
    CCRichTextStyle m_Style;
    bool m_bIsFinishInit;
    kTextStyle m_eTextStyle;
};

class CCRichContentText : public Label, public CCReactContent
{
public:
    CCRichContentText(const char *lpcszString, const CCRichTextStyle &var);
    static CCRichContentText *create(const char *lpcszString, const CCRichTextStyle &var);
    
    virtual const CCRichTextStyle &getStyle();
    virtual void setStyle(CCRichTextStyle &var);
    
private:
    CCRichTextStyle m_cStyle;
};

class CCRichContentNode : public Node, public CCReactContent
{
public:
    CCRichContentNode(Node *pData);
    static CCRichContentNode *create(Node *pData);
    
    CC_SYNTHESIZE_READONLY(Node *, m_pData, Data);
};


class CCRichText : public Node
{
public:
    CCRichText(int nWidth, int nHeight);
    virtual ~CCRichText();
    static CCRichText *create(int nWidth, int nHeight);
    
public:
    void setTouchEnabled(bool bTouchEnabled);
    bool getTouchEnabled();
    
    bool onTouchBegan(Touch *pTouch, Event *pEvent);
    void onTouchEnded(Touch *pTouch, Event *pEvent);
    
    void clearAll();
    void appendRichText(const char *lpcszData, kTextStyle textStyle, int nodeId, int eventId);
    void appendRichSprite(const char *spriteFrameName, int nodeId, int eventId);
    void appendRichSpriteFile(const char *spriteFileName, int nodeId, int eventId);
    void appendRichAnimate(const char *animateName, int nodeId, int eventId);

    void appendRichNode(Node *lpcData, int nodeId, int eventId);
    void removeRichNode(int nodeId);
    
    void setNodeSprite(const char *lpcszResourceName, int eventId);
    
    void setDetailStyle(const char *lpcszFontFamily, int fFontSize, Color4B &color);
    void setTextColor(Color4B &color);
    
    void setLineSpace(int lineSpace);
    void setBlankHeight(int blankHeight);
    void layoutChildren();
    virtual void visit(Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags);
    
    void addEventListener(std::function<bool(kRichTextState richTextState, int eventId, int x, int y)> callback);
    int getMixContentWidth();
    
    void showDebug();
    
protected:
    CCRichTextStyle &getCurrentStyle();
    void setCurrentStyle(CCRichTextStyle &rStyle);
    
    int drawString(const char *lpcszString, CCRichTextStyle &style, float fPosX, float fPosY, int nLineNum, CCRichContentData *pData);
    void drawNode( Node *pNode, float fPosX, float fPosY, int nLineNum, CCRichContentData *pData);
    
    CCRichTextStyle m_currentStyle;
    __Array *m_pRichContentDatasArray;
    Node *m_pCanvas;
    __Array* m_pContentDatasCacheArray;
    __Array* m_pContentDatasArray;
    
    int m_nContentSizeWidth;
    int m_nContentSizeHeight;
    int m_nMixContentWidth;
    
    float m_fLineSpace;
    int _blankHeight;
    
    bool m_bLayoutDirty;
    bool m_bTouchEnabled;
    
    std::function<bool(kRichTextState richTextState, int eventId, int x, int y)> m_oCallback;
    
    bool _isDebug;
};

class RichLabelsLayer:public ScrollView
{
public:
    RichLabelsLayer();
    virtual ~RichLabelsLayer();
    static RichLabelsLayer *create(int nWidth, int nHeight);
    
    void resetRichLabels();
    
    void setCurRichLabel(int richLabelId);
    void removeRichLabel(int richLabelId);
    
    void appendRichText(const char *lpcszData, kTextStyle textStyle,int nodeId);
    void appendRichSprite(const char *spriteFrameName,int nodeId);
    void appendRichAnimate(const char *animateName,int nodeId);
    
    void setDetailStyle(const char *lpcszFontFamily, int fFontSize, Color4B &color);
    void setTextColor(Color4B &color);
    void clearCurRichLabel();
    void clearAllRichLabels();
    
    void setDivideLineColor(Color4B &color);
    void layoutCurRichLabel();
    void layoutRichLabels();
    void justLayout();
    void setLabelSpace(int labelSpace);
    CCRichText* getCurRichLabelText();
    
    bool isEnableEvent();
    void enableEvent(bool enableEvent);
    
    void addEventListener(std::function<void(int richLabelId)> callback);

protected:
    virtual bool initWithViewSize(Size size);
    void resetSelectRichLabelData();
    
    typedef struct _RichLabelData
    {
        int richLabelId;
        CCRichText* richText;
        LayerColor* lineColor;
        Vec2 position;
        Size size;
        bool newMask;
    } RichLabelData;
    
    int _width;
    int _height;
    int _labelSpace;
    
    map<int,RichLabelData*> _richLabelDatasMap;
    Node* _containerNode;

    RichLabelData* _curRichLabelData;
    RichLabelData* _selectRichLabelData;
    Color4B _divideLineColor4B;
    
    
    bool _enableEvent;
    bool _isSrolling;
    int _minYposition;
    int _maxYposition;
    int _totalHeight;
    
    std::function<void(int richLabelId)> m_oCallback;
};

#endif /* defined(__CCRich_Text__) */

