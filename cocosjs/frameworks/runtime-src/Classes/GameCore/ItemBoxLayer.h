#ifndef __ItemBoxLayer__
#define __ItemBoxLayer__


#include "ItemBox.h"

USING_NS_CC;
using namespace std;

class ItemBoxLayer:public Node
{
public:
	static ItemBoxLayer* create();
    
    void setLimitRow(int limitRow);
    void setLimitColumn(int limitColumn);
    void setItemCount(int itemCount);
    void setViewSizeAndItemSize(Size viewSize,Size itemSize);

    bool isEnableEvent();
    void enableEvent(bool enableEvent);

	void setIsCanScroll(bool isCanScroll);
    void setScrollType(int scrollType);
    void setKeepSelectEffect(bool enable);
    void cancelSelectEffect();
    
    ItemBox* getItemBoxByPosition(int position);
    ItemBox* getItemBoxByItemId(int itemId);
        
    void addEventListener(std::function<void(int,ItemBox*)> selectItemCallback);

protected:
    virtual void setParent(Node* parent);

    virtual bool init();

    ItemBoxLayer();
    virtual ~ItemBoxLayer();
    
    enum class ItemBoxLayerState
    {
        WAITING,
        TRACKING_TOUCH,
        MOVE_TOUCH,
    };
    
    ItemBox* getItemForTouch(Touch *touch);

    std::function<void(int,ItemBox*)> _selectItemCallback;
    
    
    bool _keepSelectEffect;
    
    int _limitRow;
    int _limitColumn;
    Size _viewSize;
    Size _itemSize;
    int _minColumn;
    int _minRow;
    
    int _maxColumn;
    int _maxRow;
    
    int _itemCount;
    Map<int,ItemBox*> _itemBoxsMap;

    bool _isCanScroll;
    int _scrollType;
    bool _isSrolling;

    float _minYposition;
    float _maxYposition;
    
    float _minXposition;
    float _maxXposition;
    
    Rect touchRect;

	bool _enableLock;
    
    bool _enableEvent;
	ItemBox* _selectedItem;
	ItemBoxLayerState _itemBoxLayerState;
};

#endif /* defined(__ItemBoxLayer__) */