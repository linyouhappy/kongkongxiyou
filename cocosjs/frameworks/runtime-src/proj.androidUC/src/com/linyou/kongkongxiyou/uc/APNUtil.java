package com.linyou.kongkongxiyou.uc;

import org.apache.http.HttpHost;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

/**
 * 
 * 网络APN工具类。用于网络状态判断。
 * 
 * @author chenzh
 * 
 */
public class APNUtil {

	/**
	 * 获取Http代理host。使用手机2G/3G网络时需要用到。
	 * 
	 * @param ctx
	 * @return
	 */
	public static HttpHost getHttpProxy(Context ctx) {
		ConnectivityManager connMgr = (ConnectivityManager) ctx
				.getSystemService("connectivity");
		NetworkInfo netInfo = connMgr.getActiveNetworkInfo();
		if ((netInfo != null) && (netInfo.isAvailable())
				&& (netInfo.getType() == 0)) {
			String str = android.net.Proxy.getDefaultHost();
			int i = android.net.Proxy.getDefaultPort();
			if (str != null) {
				return new HttpHost(str, i);
			}
		}
		return null;
	}

	/**
	 * 检测是否有网络
	 * 
	 * @param act
	 * @return
	 */
	public static boolean isNetworkAvailable(Context context) {
		ConnectivityManager cm = (ConnectivityManager) context
				.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo info = cm.getActiveNetworkInfo();
		if (info != null && info.getState() == NetworkInfo.State.CONNECTED)
			return true;
		return false;
	}

}
