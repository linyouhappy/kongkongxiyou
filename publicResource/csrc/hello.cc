#include <node.h>
#include <v8.h>
#include <string.h>

#include "md5.h"
#include <stdio.h>

// node-gyp configure build
using namespace v8;


unsigned char* getFileData(const std::string& filename, const char* mode, ssize_t *size)
{
    unsigned char * buffer = NULL;
    // CCASSERT(!filename.empty() && size != nullptr && mode != nullptr, "Invalid parameters.");
    *size = 0;
    do
    {
        FILE *fp = fopen(filename.c_str(), mode);
        if(!fp) break;

        fseek(fp,0,SEEK_END);
        *size = ftell(fp);
        fseek(fp,0,SEEK_SET);
        buffer = (unsigned char*)malloc(*size);
        *size = fread(buffer,sizeof(unsigned char), *size,fp);
        fclose(fp);
    } while (0);
    return buffer;
}


void Method(const FunctionCallbackInfo<v8::Value>& args) {
    Isolate *isolate = args.GetIsolate();
    HandleScope scope(isolate);

    if (args.Length() == 1 && args[0]->IsString()) {
        v8::String::Utf8Value str(args[0]);  
        const char* cstr = *str ? *str : "<string conversion failed>"; 
        // printf("cstr=%s\n", "cstr");
        std::string mychars=cstr;
        std::string md5Res=md5(mychars);

        args.GetReturnValue().Set(
            String::NewFromUtf8(Isolate::GetCurrent(),
                (const char*)md5Res.c_str())
            );
    }else{
        printf("%s\n", "no thing");
    }
}

void getFileMD5(const FunctionCallbackInfo<v8::Value>& args) {
    if (args.Length() == 1 && args[0]->IsString()) {
        v8::String::Utf8Value str(args[0]);  
        std::string filename = *str ? *str : "<string conversion failed>"; 
        // printf("filename:%s\n", filename.c_str());

        ssize_t bufferSize = 0;
        unsigned char* buffer=getFileData(filename,"rb", &bufferSize);
        if (!buffer)
        {
            printf("%s\n", "file is no exist!");
            return;
        }
        std::string fileContent=std::string((const char*)buffer, (size_t)bufferSize);
        free(buffer);
        std::string md5Res=md5(fileContent);

        args.GetReturnValue().Set(
            String::NewFromUtf8(Isolate::GetCurrent(),
                (const char*)md5Res.c_str())
            );
    }else{
        printf("%s\n", "no thing");
    }
}

void init (v8::Handle<v8::Object> target)
{
    v8::HandleScope scope( v8::Isolate::GetCurrent() );
    NODE_SET_METHOD(target, "hello", Method);

    Isolate *isolate = Isolate::GetCurrent();
	v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(isolate,getFileMD5);
	t->InstanceTemplate()->SetInternalFieldCount(1);
	// t->SetClassName(String::NewFromUtf8(isolate, "HeapDiff"));
// NODE_SET_PROTOTYPE_METHOD(t, "end", End);
	target->Set(v8::String::NewFromUtf8( isolate, "getFileMD5"), t->GetFunction());
    // v8::V8::AddGCEpilogueCallback(memwatch::after_gc);
}

NODE_MODULE(hello, init);

