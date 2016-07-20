package com.linyou.kongkongxiyou.uc;

/**
 * 游戏参数配置
 * 
 * 
 */
public class UCSdkConfig {
	// 以下参数仅供测试。在正式集成SDK时，需要使用正式的id数据。
	// 游戏开发人员可从UC九游开放平台获取自己游戏的参数信息，参考http://game.open.uc.cn/doc/guide_gameid.html
	// 验收及对外发布时，要求必须使用生产环境模式。
	public static int cpId = 0; // 此参数已废弃,默认传入0即可
	public static int gameId = 119474;
	public static int serverId = 0; // 此参数已废弃,默认传入0即可

	// 值为true时，为调试环境模式，当值为false时，是生产环境模式，验收及对外发布时，要求必须使用生产环境模式
	public static boolean debugMode = true;
}
