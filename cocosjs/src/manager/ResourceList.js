var resourceList = {};

resourceList.getList = function(resId, fileList) {
	fileList = fileList || {};
	var resList = resourceList[resId];
	if (!resList)
		return fileList;

	for (var key in resList) {
		fileList[resList[key]] = true;
	};
	return fileList;
};

resourceList.removeRes = function(resId) {
	cc.log("removeRes=========>> resId="+resId)
	var fileList = resourceList.getList(resId);

	cc.log("removeRes=========>> resId="+resId+"fileList="+JSON.stringify(fileList))
	for (var key in fileList) {
		cb.CommonLib.removeRes(key);
		// var file = key;
		// var index = file.indexOf("plist");
		// if (index > 0) {
		// 	cc.spriteFrameCache.removeSpriteFramesFromFile(file);
		// 	var fileName = file.substring(0, index);
		// 	if (jsb.fileUtils.isFileExist(fileName + "png")) {
		// 		cc.director.getTextureCache().removeTextureForKey(fileName + "png");
		// 	} else {
		// 		fileName = fileName + "pvr.ccz"
		// 		if (jsb.fileUtils.isFileExist(fileName)) {
		// 			cc.director.getTextureCache().removeTextureForKey(fileName);
		// 		}
		// 	}
		// }
	}
};


resourceList[cb.kMVipPanelId] = [
	"uiimg/vip_ui.plist"
];

resourceList[cb.kMBuildPanelId] = [
	"effects_strength_",
	"effects_strengthr_",
	"effect/effects_strength.plist"
];

