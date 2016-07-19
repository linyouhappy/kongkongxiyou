var fs = require('fs');
var path = require('path');
// var crypto = require('crypto');
var addon = require('./build/Release/hello');



var publiczip = __dirname + "/publiczip";

var sourceRes=__dirname + "/../cocosjs/res";
// var scriptFile=__dirname + "../cocosjs/data.js";

function getFileUpdateInfo(fileFullPath){
    var fileUpdateInfo={};

    var stat=fs.statSync(fileFullPath);
    fileUpdateInfo.s=stat.size;

    // var content=fs.readFileSync(fileFullPath,'utf-8');
    // var md5sum=crypto.createHash('md5');
    // md5sum.update(content);
    // var md5Value=md5sum.digest('hex');
    var md5Value=addon.getFileMD5(fileFullPath);
    fileUpdateInfo.m=md5Value;

    return fileUpdateInfo;
}

var updateInfos={
    appVer: 1,
    force:0
};

function generateUpdateInfo() {
    var files = fs.readdirSync(publiczip);
    var maxResVer=1;
    var minResVer=1;
    for (var key in files) {
        var file = files[key];
        var fullPath=path.join(publiczip,file);

        if (file==="data.ios") {
            var fileUpdateInfo=getFileUpdateInfo(fullPath);
            fileUpdateInfo.f=file;

            var fileName=file.substring(0,file.length-4);
            updateInfos[fileName]=fileUpdateInfo;

        }else if (file.indexOf(".ios")>0) {
            var fileUpdateInfo=getFileUpdateInfo(fullPath);
            fileUpdateInfo.f=file;

            var fileName=file.substring(0,file.length-4);
            updateInfos[fileName]=fileUpdateInfo;

            var resVer=Number(fileName.substring(3));
            if(maxResVer<resVer){
                maxResVer=resVer;
            }
            if (minResVer>resVer) {
                minResVer=resVer;
            }
        }
    }

    updateInfos.maxResVer=maxResVer;
    updateInfos.minResVer=minResVer;
}

generateUpdateInfo();

var writeFullPath=publiczip+"/update.json";
var writeStream = fs.createWriteStream(writeFullPath, { flags : 'w' });
writeStream.write(JSON.stringify(updateInfos));


var writeFullPath=sourceRes+"/update.xml";
var resStruct="res"+updateInfos.maxResVer;
resStruct=updateInfos[resStruct];

var content='<?xml version="1.0" encoding="UTF-8"?>'+
'<root res="'+updateInfos.maxResVer+'" ver="'+updateInfos.appVer+'">'+
    '<f t="file" s="'+resStruct.s+'" f="'+resStruct.f+'" m="'+resStruct.m+'"/></root>';

var writeStream = fs.createWriteStream(writeFullPath, { flags : 'w' });
writeStream.write(content);

writeFullPath=sourceRes+"/version";
content=""+Date.now();
writeStream = fs.createWriteStream(writeFullPath, { flags : 'w' });
writeStream.write(content);

console.log("congratulation!!!");


