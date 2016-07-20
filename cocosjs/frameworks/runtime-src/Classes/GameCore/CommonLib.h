#ifndef __COMMONLIB_H__
#define __COMMONLIB_H__

#include "cocos2d.h"
USING_NS_CC;

extern Color3B *g_qualityColor;

class CommonLib:public Ref
{
public:
    static void initCommonLib();
#pragma mark time
    static double currentSecond();
    static long currentMilliSecond();
    static bool isJSBScriptZipRun();
    static int getTodayInteger();

#pragma mark math
//    static bool floatEqual(float f1,float f2);
	static bool RandomProbability(const int probability);
    static int createUid();
    
#pragma mark sound
    static unsigned int playEffectSound(const char* soundFile,bool isLoop=false);
    static void stopEffectSound(unsigned int nSoundId);
    static void stopAllEffectsSound();
    static void playBgMusic(const char* musicFile,bool isLoop=false);
    static void stopBgMusic(bool bReleaseData);
    
    static void enableEffectSound(bool enable);
    static void enableBgMusic(bool enable);
    static bool isEnableEffectSound();
    static bool isEnableBgMusic();
    
#pragma mark messageBox
    static void MessageBox(const char * msg, const char * title);
    
#pragma mark cocos
    static Animation* genarelAnimation(const char* plistFile,const char* spriteFrameName,float delayPerUnit=0.2f,int loopNum=1);
    static Animate* genarelAnimate(const char* plistFile,const char* spriteFrameName,float delayPerUnit=0.2f,int loopNum=1);
    
    static void removeAnimation(const char* spriteFrameName);
    static void removeRes(const char* resName);
    static void showResInfo();
    
    static Node* createMobHurtNumber(unsigned int hurtValue);

    static Node* createNormalHurtNumber(unsigned int hurtValue);
    static Node* createCritHurtNumber(unsigned int hurtValue);
    static Node* createDodge();
    
    static Node* createAddHpNumber(unsigned int addHpValue);
    static Node* createAddMpNumber(unsigned int addMpValue);
//    static void showFightingChangeEffect(int preFighting,int nextFighting);
    
    static bool saveFile(const char *filePath, const char *fileData,const size_t fileSize);

    static const char* hostToIp(const char* host);
    
    static const char* getFileMD5(const char* filename);
    static const char* md5(const char* originChars);
    
    static const char* getServerIP();
    static const char* getServerURL();
    static void setServerURL(const char* url);

};

#endif  //__COMMONLIB_H__

