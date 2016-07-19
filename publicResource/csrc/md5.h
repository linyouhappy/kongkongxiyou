#ifndef __HEADDIFF_H
#define __HEADDIFF_H


#include <iostream>
// #include <stdio.h>



// extern void *body(MD5_CTX *ctx, void *data, unsigned long size);
// extern void __Ptola_MD5_Init(MD5_CTX *ctx);
// extern void __Ptola_MD5_Update(MD5_CTX *ctx, void *data, unsigned long size);
// extern void __Ptola_MD5_Final(unsigned char *result, MD5_CTX *ctx);

extern std::string md5(std::string& originChars);

#endif
