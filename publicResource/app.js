var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var cp = require('child_process');

var addon = require('./build/Release/hello');

//console.log("===>>"+addon.hello("womasdf"));
//console.log("====>>"+addon.getFileMD5("/Users/linyou/Desktop/node/hello/csrc/hello.cc"));


var getFolderFilesList=function(folder,relativeFolder,filesList){
    var files = fs.readdirSync(folder);
    for(var key in files){
        var file=files[key];
        if(file.charAt(0) !== '.'){
            var fullPath=path.join(folder, file);
            var fileName=path.join(relativeFolder, file);

            if (fs.statSync(fullPath).isDirectory()) {
                getFolderFilesList(fullPath,fileName,filesList);
            }else{
                filesList[fileName]=1;
            }
        }
    }
};

var getVersionFilesList=function(versionName){
    var versionPath=workPath+versionName;
    var versionFilesList={};

    getFolderFilesList(versionPath,"",versionFilesList);
    return versionFilesList;
};

var getFileVersion = function(path) {
    // var stat=fs.statSync(path);
    // return (new Date(stat.mtime)).getTime();
    return addon.getFileMD5(path);
};

var deleteFolder=function(folder){
    if(!fs.existsSync(folder)) return;

    var files = fs.readdirSync(folder);
    for(var key in files){
        var file=files[key];
        var fullPath=path.join(folder, file);
        if(file.charAt(0) !== '.'){
            if (fs.statSync(fullPath).isDirectory()) {
                deleteFolder(fullPath);
            }else{
                fs.unlinkSync(fullPath);
            }
        }else{
            fs.unlinkSync(fullPath);
        }
    }

    fs.rmdirSync(folder);
};



var workPath=__dirname+"/workpath/";
var publicPath=__dirname+"/publicpath/";

deleteFolder(publicPath);
fs.mkdirSync(publicPath);

var versions = fs.readdirSync(workPath);
var newVersion="";
var versionFilesListVector={};
var versionFilesList;
var newVersionFilesList;

for(var key in versions)
{
    var version=versions[key];
    if(version.charAt(0) !== '.'){
        if(version>newVersion) {
            newVersion = version;
        }
    }
}

for(var key in versions)
{
    var version=versions[key];
    if(version.charAt(0) !== '.'){
        versionFilesList=getVersionFilesList(version);
        if(version!==newVersion) {
            versionFilesListVector[version]=versionFilesList;
        }else{
            newVersionFilesList=versionFilesList;
        }
    }
}

for (var version in versionFilesListVector) {
    versionFilesList=versionFilesListVector[version];

    var addFilesList=[];
    var removeFilesList=[];
    //find new file
    for (var file in newVersionFilesList) {
        if (!versionFilesList[file]) {
            addFilesList.push(file);
        }else{
            var newFullPath=path.join(workPath,newVersion,file);
            var theNewFileVersion=getFileVersion(newFullPath);

            var oldFullPath=path.join(workPath,version,file);
            var theOldFileVersion=getFileVersion(oldFullPath);
            if(theNewFileVersion!==theOldFileVersion){
                addFilesList.push(file);
            }
        }
    }

    for (var file in versionFilesList) {
        if (!newVersionFilesList[file]) {
            removeFilesList.push(file);
        }
    }

    console.log(version+":addFileCount="+addFilesList.length+",removeFileCount="+removeFilesList.length);

    var versionPath=path.join(publicPath, version);
    fs.mkdirSync(versionPath);

    var addFilemd5sList={};
    for(var i=0;i<addFilesList.length;i++){
        var fileName=addFilesList[i];
        var readFullPath=path.join(workPath, newVersion,fileName);

        var writeFullPath=path.join(publicPath, version,fileName);
        var writeFulldir=path.dirname(writeFullPath);
        if(!fs.existsSync(writeFulldir)){
            var parentFullDir=writeFulldir.substring(0,writeFulldir.lastIndexOf("/"));
            if(!fs.existsSync(parentFullDir)){
                var parentParentFullDir=parentFullDir.substring(0,parentFullDir.lastIndexOf("/"));
                if(!fs.existsSync(parentParentFullDir)) {
                    fs.mkdirSync(parentParentFullDir);
                }
                fs.mkdirSync(parentFullDir);
            }
            fs.mkdirSync(writeFulldir);
        }

        //var writeStream = fs.createWriteStream(writeFullPath, { flags : 'w' });
        //writeStream.write(content);
        //fs.writeFileSync(writeFullPath,content,'utf-8');
        //var command="cp -Rp "+readFullPath+" "+writeFullPath;
        //var child=cp.exec(command);
        //var ls=cp.spawn("cp",["-Rp",readFullPath,writeFullPath]);
        //
        //ls.stdout.on('data',function(data){})
        //ls.stderr.on('data',function(data){})
        //ls.on('exit',function(data){})

        //var child = cp.spawn("cp",["-Rp",readFullPath,writeFullPath],[]);
        //child.stderr.on('data', function (chunk) {
        //    var msg = chunk.toString();
        //    process.stderr.write(msg);
        //});

        //child.stdout.on('data', function (chunk) {
        //    var msg = chunk.toString();
        //    process.stdout.write(msg);
        //});


        //child.on('exit', function (code) {
        //    if(code !== 0) {
        //    }
        //});

        var readable=fs.createReadStream(readFullPath);
        var writable=fs.createWriteStream(writeFullPath);
        readable.pipe(writable);

        //var content=fs.readFileSync(readFullPath,'utf-8');
        //var md5sum=crypto.createHash('md5');
        //md5sum.update(content);
        //md5Value=md5sum.digest('hex');
        var md5Value=addon.getFileMD5(readFullPath)
        addFilemd5sList[fileName]=md5Value;

        console.log("fileName="+fileName+",md5Value="+md5Value);
    }

    //addFile
    var addFilePath=path.join(publicPath, version,"addFiles.json");
    var stream = fs.createWriteStream(addFilePath, { flags : 'w' });
    stream.write(JSON.stringify(addFilemd5sList));

    //removeFile
    var removeFilePath=path.join(publicPath, version,"removeFiles.json");
    var stream = fs.createWriteStream(removeFilePath, { flags : 'w' });
    stream.write(JSON.stringify(removeFilesList));
};



console.log("congratulation!!!");


