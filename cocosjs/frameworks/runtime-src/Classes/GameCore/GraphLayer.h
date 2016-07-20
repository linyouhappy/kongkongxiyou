#ifndef __GraphLayer__
#define __GraphLayer__


#include "cocos2d.h"

USING_NS_CC;
using namespace std;

class GraphLayer:public Node
{
public:
	static GraphLayer* create(int width, int height);
    
    void clearData();
//    void clearDraw();
    void refreshData();
    void enableEvent(bool enableEvent);
    void setPointCount(int pointCount);
    void setAmountHeight(int amountHeight);
    void setMinXString(const char* minXString);
    void setMaxXString(const char* maxXString);
    
    void addData(int x,int openValue,int closeValue,int minValue,int maxValue,int amount);
    void addEventListener(const std::function<void(int)>& callback);

protected:
    typedef struct _MarketData
    {
        int x;
        int openValue;
        int closeValue;
        int maxValue;
        int minValue;
        int amount;
        int average;
    } MarketData;

    virtual bool init(int width, int height);
    void drawTouchPoint(Vec2& point);

    GraphLayer();
    virtual ~GraphLayer();
    
    DrawNode* _drawNode;
    DrawNode* _boxDrawNode;
    DrawNode* _amountDrawNode;
    Label* _labelMinX;
    Label* _labelMaxX;
    Label* _labelMinY;
    Label* _labelMaxY;
    
    int _minX;
    int _maxX;
    int _minY;
    int _maxY;
    int _width;
    int _height;
    int _pointCount;
    
    int _maxAmount;
    
    float _deltaX;
    float _deltaY;
    float _deltaPointX;
    float _deltaPointY;
    
    int _graphHeight;
    int _amountHeight;
    
    bool _enableEvent;
    
    std::function<void(int)> _eventCallback;


    map<int,MarketData> _marketDatasMap;
//    vector<MarketData> _marketDatasVector;

};

#endif /* defined(__GraphLayer__) */