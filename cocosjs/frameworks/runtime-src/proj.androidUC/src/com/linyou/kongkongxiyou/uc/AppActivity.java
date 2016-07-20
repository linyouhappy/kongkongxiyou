/****************************************************************************
Copyright (c) 2008-2010 Ricardo Quesada
Copyright (c) 2010-2012 cocos2d-x.org
Copyright (c) 2011      Zynga Inc.
Copyright (c) 2013-2014 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.linyou.kongkongxiyou.uc;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import android.content.pm.ActivityInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.view.WindowManager;

import android.util.Log;


 import cn.uc.gamesdk.GameUserLoginResult;
 import cn.uc.gamesdk.IGameUserLogin;
 import cn.uc.gamesdk.UCCallbackListener;
 import cn.uc.gamesdk.UCCallbackListenerNullException;
 import cn.uc.gamesdk.UCFloatButtonCreateException;
 import cn.uc.gamesdk.UCGameSDK;
 import cn.uc.gamesdk.UCGameSDKStatusCode;
 import cn.uc.gamesdk.UCLogLevel;
 import cn.uc.gamesdk.UCLoginFaceType;
 import cn.uc.gamesdk.UCOrientation;
 import cn.uc.gamesdk.info.FeatureSwitch;
 import cn.uc.gamesdk.info.GameParamInfo;
 import cn.uc.gamesdk.info.OrderInfo;
 import cn.uc.gamesdk.info.PaymentInfo;
 import org.json.JSONObject;

 import android.app.AlertDialog;
 import android.content.DialogInterface;
 import android.content.Intent;
 
 import com.linyou.kongkongxiyou.uc.UCSdkConfig;
 import com.linyou.kongkongxiyou.uc.APNUtil;

// The name of .so is specified in AndroidMenifest.xml. NativityActivity will load it automatically for you.
// You can use "System.loadLibrary()" to load other .so files.

public class AppActivity extends Cocos2dxActivity{

    static String hostIPAdress = "0.0.0.0";
    static AppActivity self;
    // final boolean isSDKInit=false;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // TODO Auto-generated method stub
        super.onCreate(savedInstanceState);

        self = this;

        // if(nativeIsLandScape()) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        // } else {
        //     setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        // }
        // if(nativeIsDebug()){
        //     getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // }
        hostIPAdress = getHostIpAddress();
        // ucSdkInit();
    }

    /**
	 * checkNetwork
	 */
	public void checkNetwork() {
		if (false == APNUtil.isNetworkAvailable(this)) {
			AlertDialog.Builder ab = new AlertDialog.Builder(this);
			ab.setMessage("网络未连接,请设置网络");
			ab.setPositiveButton("设置", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					Intent intent = new Intent("android.settings.SETTINGS");
					startActivityForResult(intent, 0);
				}
			});
			ab.setNegativeButton("退出", new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					System.exit(0);
				}
			});
			ab.show();
		} else {
			ucSdkInit();
		}
	}
    
    private void ucSdkInit() {
		// 监听用户注销登录消息
		// 九游社区-退出当前账号功能执行时会触发此监听
		try {
			UCGameSDK.defaultSDK().setLogoutNotifyListener(
					new UCCallbackListener<String>() {
						@Override
						public void callback(int statuscode, String msg) {
							// TODO 此处需要游戏客户端注销当前已经登录的游戏角色信息
							String s = "游戏接收到用户退出通知。" + msg + statuscode;
							Log.e("UCGameSDK", s);
							// 未成功初始化
							if (statuscode == UCGameSDKStatusCode.NO_INIT) {
								// 调用SDK初始化接口
								ucSdkInit();
							}
							// 未登录成功
							if (statuscode == UCGameSDKStatusCode.NO_LOGIN) {
								// 调用SDK登录接口
								ucSdkLogin();
							}
							// 退出账号成功
							if (statuscode == UCGameSDKStatusCode.SUCCESS) {
								// 执行销毁悬浮按钮接口
								ucSdkDestoryFloatButton();
								// 调用SDK登录接口
								ucSdkLogin();
							}
							// 退出账号失败
							if (statuscode == UCGameSDKStatusCode.FAIL) {
								// 调用SDK退出当前账号接口
								ucSdkLogout();
							}
						}
					});
		} catch (UCCallbackListenerNullException e) {
			// 处理异常
		}

		try {
			GameParamInfo gpi = new GameParamInfo();// 下面的值仅供参考
			gpi.setCpId(UCSdkConfig.cpId);
			gpi.setGameId(UCSdkConfig.gameId);
			gpi.setServerId(UCSdkConfig.serverId); // 服务器ID可根据游戏自身定义设置，或传入0
			// gpi.setChannelId(2); // 渠道号统一处理，已不需设置，此参数已废弃，服务端此参数请设置值为2

			// 在九游社区设置显示查询充值历史和显示切换账号按钮，
			// 在不设置的情况下，默认情况情况下，生产环境显示查询充值历史记录按钮，不显示切换账户按钮
			// 测试环境设置无效
			gpi.setFeatureSwitch(new FeatureSwitch(true, false));

			UCGameSDK.defaultSDK().setOrientation(UCOrientation.LANDSCAPE);
			UCGameSDK.defaultSDK().setLoginUISwitch(UCLoginFaceType.USE_WIDGET);

			UCGameSDK.defaultSDK().initSDK(self, UCLogLevel.DEBUG,
					UCSdkConfig.debugMode, gpi,
					new UCCallbackListener<String>() {
						@Override
						public void callback(int code, String msg) {
							Log.e("UCGameSDK", "UCGameSDK初始化接口返回数据 msg:" + msg
									+ ",code:" + code + ",debug:"
									+ UCSdkConfig.debugMode + "\n");
							switch (code) {
							// 初始化成功,可以执行后续的登录充值操作
							case UCGameSDKStatusCode.SUCCESS:
								dispalyGameLoginUI();
							default:
								break;
							}
						}
					});
		} catch (UCCallbackListenerNullException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void dispalyGameLoginUI() {
		ucSdkLogin();
	}

	private void startGame(String sid) {
		nativeLoginCallback(sid);
	}

	private void payCallback(float amount){
		int payId=0;
		switch((int)amount){
			case 10:
				payId=1;
			break;
			case 20:
				payId=2;
			break;
			case 30:
				payId=3;
			break;
			case 50:
				payId=4;
			break;
		}
		nativePayCallback(payId);
	}
    
    public static void sdkLogin(){
		self.runOnUiThread(new Runnable(){
			 @Override  
             public void run()  
             { 
             	self.ucSdkInit();
             }
		});
	}

	public static String getDeviceModel()
	{
		return android.os.Build.MODEL;
	}

	public static void sdkExit(){
		self.runOnUiThread(new Runnable(){
		 @Override  
		 public void run()
		 {
		 	self.ucSdkExit();
		 }
		});
	}

	public static void sdkLogout(){
		self.runOnUiThread(new Runnable(){
			 @Override  
             public void run()  
             { 
             	self.ucSdkLogout();
             }
		});
	}

	float amount;
	public static void sdkPay(int payId){
		switch(payId){
			case 1:
				self.amount=10;
			break;
			case 2:
				self.amount=20;
			break;
			case 3:
				self.amount=30;
			break;
			case 4:
				self.amount=50;
			break;
		}
		self.runOnUiThread(new Runnable(){
			@Override  
            public void run()  
            { 
             	self.ucSdkPay(self.amount);
            }
		});
	}

	String roleId;
	String roleName;
	int roleLevel;
	public static void submitExtendData(String roleId,String roleName,int roleLevel) {
		self.roleId=roleId;
		self.roleName=roleName;
		self.roleLevel=roleLevel;

		self.runOnUiThread(new Runnable() {
			public void run() {
				self.ucSdkSubmitExtendData(self.roleId,self.roleName,self.roleLevel);
			}
		});
	}

	private static native boolean nativeLoginCallback(String sid);
	private static native boolean nativePayCallback(int payId);
    
	private void ucSdkLogin() {
		this.runOnUiThread(new Runnable() {
			public void run() {
				try {
					// 登录接口回调。从这里可以获取登录结果。
					UCCallbackListener<String> loginCallbackListener = new UCCallbackListener<String>() {
						@Override
						public void callback(int code, String msg) {
							Log.e("UCGameSDK", "UCGameSdk登录接口返回数据:code=" + code
									+ ",msg=" + msg);

							// 登录成功。此时可以获取sid。并使用sid进行游戏的登录逻辑。
							// 客户端无法直接获取UCID
							if (code == UCGameSDKStatusCode.SUCCESS) {

								// 获取sid。（注：ucid需要使用sid作为身份标识去SDK的服务器获取）
								String sid=UCGameSDK.defaultSDK().getSid();
								self.startGame(sid);
								// 执行悬浮按钮创建方法
								ucSdkCreateFloatButton();
								// 执行悬浮按钮显示方法
								ucSdkShowFloatButton();
							}
							// 登录失败。应该先执行初始化成功后再进行登录调用。
							else if (code == UCGameSDKStatusCode.NO_INIT) {
								// 没有初始化就进行登录调用，需要游戏调用SDK初始化方法
								ucSdkInit();
							}
							// 登录退出。该回调会在登录界面退出时执行。
							if (code == UCGameSDKStatusCode.LOGIN_EXIT) {
								// 登录界面关闭，游戏需判断此时是否已登录成功进行相应操作
							}
						}
					};

					UCGameSDK.defaultSDK().login(self, loginCallbackListener);
					
				} catch (UCCallbackListenerNullException e) {
					e.printStackTrace();
				}
			}
		});
	}
    
	/**
	 * 必接功能<br>
	 * 当游戏退出前必须调用该方法，进行清理工作。建议在游戏退出事件中进行调用，必须在游戏退出前执行<br>
	 * 如果游戏直接退出，而不调用该方法，可能会出现未知错误，导致程序崩溃<br>
	 */
	private void ucSdkExit() {
		UCGameSDK.defaultSDK().exitSDK(self, new UCCallbackListener<String>() {
			@Override
			public void callback(int code, String msg) {
				if (UCGameSDKStatusCode.SDK_EXIT_CONTINUE == code) {
					// 此加入继续游戏的代码

				} else if (UCGameSDKStatusCode.SDK_EXIT == code) {
					// 在此加入退出游戏的代码
					ucSdkDestoryFloatButton();
					System.exit(0);
				}
			}
		});
	}

	/**
	 * 选接功能<br>
	 * 游戏可通过调用下面方法，退出当前登录的账号<br>
	 * 通过退出账号侦听器（此侦听器在初始化前经由setLogoutNotifyListener 方法设置）<br>
	 * 把退出消息返回给游戏，游戏可根据状态码进行相应的处理。<br>
	 */
	private void ucSdkLogout() {
		try {
			UCGameSDK.defaultSDK().logout();
		} catch (UCCallbackListenerNullException e) {
			// 未设置退出侦听器
		}
	}

	/**
	 * 必接功能<br>
	 * 悬浮按钮创建及显示<br>
	 * 悬浮按钮必须保证在SDK进行初始化成功之后再进行创建需要在UI线程中调用<br>
	 */
	private void ucSdkCreateFloatButton() {
		self.runOnUiThread(new Runnable() {
			public void run() {
				try {
					// 创建悬浮按钮。该悬浮按钮将悬浮显示在GameActivity页面上，点击时将会展开悬浮菜单，菜单中含有
					// SDK 一些功能的操作入口。
					// 创建完成后，并不自动显示，需要调用showFloatButton(Activity,
					// double, double, boolean)方法进行显示或隐藏。
					UCGameSDK.defaultSDK().createFloatButton(self,
							new UCCallbackListener<String>() {

								@Override
								public void callback(int statuscode, String data) {
									Log.d("SelectServerActivity`floatButton Callback",
											"statusCode == " + statuscode
													+ "  data == " + data);
								}
							});

				} catch (UCCallbackListenerNullException e) {
					e.printStackTrace();
				} catch (UCFloatButtonCreateException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * 必接功能<br>
	 * 悬浮按钮显示<br>
	 * 悬浮按钮显示需要在UI线程中调用<br>
	 */
	private void ucSdkShowFloatButton() {
		self.runOnUiThread(new Runnable() {
			public void run() {
				// 显示悬浮图标，游戏可在某些场景选择隐藏此图标，避免影响游戏体验
				try {
					UCGameSDK.defaultSDK().showFloatButton(self, 100, 50, true);
				} catch (UCCallbackListenerNullException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * 必接功能<br>
	 * 悬浮按钮销毁<br>
	 * 悬浮按钮销毁需要在UI线程中调用<br>
	 */
	private void ucSdkDestoryFloatButton() {
		self.runOnUiThread(new Runnable() {
			public void run() {
				// 悬浮按钮销毁功能
				UCGameSDK.defaultSDK().destoryFloatButton(self);
			}
		});
	}

//	/**
//	 * 选接功能<br>
//	 * 九游社区功能<br>
//	 * 如已在程序中调用悬浮按钮，则可不需再调用九游社区功能<br>
//	 */
//	private void ucSdkEnterUserCenter() {
//		try {
//			UCGameSDK.defaultSDK().enterUserCenter(getApplicationContext(),
//					new UCCallbackListener<String>() {
//						@Override
//						public void callback(int statuscode, String data) {
//							switch (statuscode) {
//							case UCGameSDKStatusCode.SUCCESS:
//								break;
//							// !!! 未初始化成功。应该先调用初始化
//							case UCGameSDKStatusCode.NO_INIT:
//								ucSdkInit();
//								break;
//							// !!! 未登录。应该先调用登录功能进行登录
//							case UCGameSDKStatusCode.NO_LOGIN:
//								ucSdkLogin();
//								break;
//							default:
//								break;
//							}
//						}
//					});
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//	}

	// 定义充值金额，默认为0
	// private float amount = 0;

	/**
	 * 必接功能<br>
	 * SDK支付功能<br>
	 * 调用SDK支付功能 <br>
	 * 如你在调用支付页面时，没有显示正确的支付页面 <br>
	 * 请参考自助解决方案：http://bbs.9game.cn/thread-6074095-1-1.html <br>
	 * 在联调环境中进行支付，可使用无效卡进行支付，只需符合卡号卡密长度位数即可<br>
	 * 当卡号卡密全部输入为1时，是支付失败的订单，服务器将会收到订单状态为F的订单信息<br>
	 */
	private void ucSdkPay(float amount) {
		PaymentInfo pInfo = new PaymentInfo(); // 创建Payment对象，用于传递充值信息

		// 设置充值自定义参数，此参数不作任何处理，
		// 在充值完成后，sdk服务器通知游戏服务器充值结果时原封不动传给游戏服务器传值，字段为服务端回调的callbackInfo字段
		pInfo.setCustomInfo("callback");

		// 非必选参数，可不设置，此参数已废弃,默认传入0即可。
		// 如无法支付，请在开放平台检查是否已经配置了对应环境的支付回调地址，如无请配置，如有但仍无法支付请联系UC技术接口人。
		pInfo.setServerId(0);

		pInfo.setRoleId("102"); // 设置用户的游戏角色的ID，此为必选参数，请根据实际业务数据传入真实数据
		pInfo.setRoleName("游戏角色名"); // 设置用户的游戏角色名字，此为必选参数，请根据实际业务数据传入真实数据
		pInfo.setGrade("12"); // 设置用户的游戏角色等级，此为可选参数

		// 非必填参数，设置游戏在支付完成后的游戏接收订单结果回调地址，必须为带有http头的URL形式。
		pInfo.setNotifyUrl("http://192.168.1.1/notifypage.do");

		// 当传入一个amount作为金额值进行调用支付功能时，SDK会根据此amount可用的支付方式显示充值渠道
		// 如你传入6元，则不显示充值卡选项，因为市面上暂时没有6元的充值卡，建议使用可以显示充值卡方式的金额
		pInfo.setAmount(amount);// 设置充值金额，此为可选参数

		try {
			UCGameSDK.defaultSDK().pay(getApplicationContext(), pInfo,
					payResultListener);
		} catch (UCCallbackListenerNullException e) {
			// 异常处理
		}

	}

	private UCCallbackListener<OrderInfo> payResultListener = new UCCallbackListener<OrderInfo>() {
		@Override
		public void callback(int statudcode, OrderInfo orderInfo) {
			if (statudcode == UCGameSDKStatusCode.NO_INIT) {
				// 没有初始化就进行登录调用，需要游戏调用SDK初始化方法
			}
			if (statudcode == UCGameSDKStatusCode.SUCCESS) {
				// 成功充值
				if (orderInfo != null) {
					String ordereId = orderInfo.getOrderId();// 获取订单号
					float orderAmount = orderInfo.getOrderAmount();// 获取订单金额
					int payWay = orderInfo.getPayWay();
					String payWayName = orderInfo.getPayWayName();
					System.out.print(ordereId + "," + orderAmount + ","
							+ payWay + "," + payWayName);

					self.payCallback(orderAmount);
				}
			}
			if (statudcode == UCGameSDKStatusCode.PAY_USER_EXIT) {
				// 用户退出充值界面。
			}
		}
	};

	/**
	 * 必接功能<br>
	 * 提交游戏扩展数据功能，游戏SDK要求游戏在运行过程中，提交一些用于运营需要的扩展数据，这些数据通过扩展数据提交方法进行提交。
	 * 登录游戏角色成功后调用，及角色等级变化后调用
	 * 游戏内如果没有相应的字段：int传-1，string传"不存在"
	 */
	private void ucSdkSubmitExtendData(String roleId,String roleName,int roleLevel) {
		try {
			JSONObject jsonExData = new JSONObject();
			jsonExData.put("roleId", roleId);// 玩家角色ID
			jsonExData.put("roleName", roleName);// 玩家角色名
			jsonExData.put("roleLevel", roleLevel);// 玩家角色等级
			// jsonExData.put("zoneId", 192825);// 游戏区服ID
			// jsonExData.put("zoneName", "游戏一区-逍遥谷");// 游戏区服名称
			// jsonExData.put("roleCTime",1453355744);//角色创建时间
			// jsonExData.put("roleLevelMTime",1456736982);//等级变化时间
			UCGameSDK.defaultSDK()
					.submitExtendData("loginGameRole", jsonExData);
			
			Log.e("UCGameSDK", "roleId="+roleId+"roleName="+roleName+"roleLevel="+roleLevel);
			Log.e("UCGameSDK", "提交游戏扩展数据功能调用成功");
		} catch (Exception e) {
			// 处理异常
		}
	}
    
    
    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        return glSurfaceView;
    }

    public String getHostIpAddress() {
        WifiManager wifiMgr = (WifiManager) getSystemService(WIFI_SERVICE);
        WifiInfo wifiInfo = wifiMgr.getConnectionInfo();
        int ip = wifiInfo.getIpAddress();
        return ((ip & 0xFF) + "." + ((ip >>>= 8) & 0xFF) + "." + ((ip >>>= 8) & 0xFF) + "." + ((ip >>>= 8) & 0xFF));
    }
    
    public static String getLocalIpAddress() {
        return hostIPAdress;
    }
    
    private static native boolean nativeIsLandScape();
    private static native boolean nativeIsDebug();
    
}
