/**
 * Copyright (c) 2014,2015 NetEase, Inc. and other Pomelo contributors
 * MIT Licensed.
 */

/*
  Copyright (c) 2009 Dave Gamble

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
*/

#ifndef PC_JSON_H
#define PC_JSON_H

#ifdef __cplusplus
extern "C"
{
#endif

/* pc_JSON Types: */
#define pc_JSON_False 0
#define pc_JSON_True 1
#define pc_JSON_NULL 2
#define pc_JSON_Number 3
#define pc_JSON_String 4
#define pc_JSON_Array 5
#define pc_JSON_Object 6

#define pc_JSON_IsReference 256

/* The pc_JSON structure: */
typedef struct pc_JSON {
    struct pc_JSON *next,*prev;    /* next/prev allow you to walk array/object chains. Alternatively, use GetArraySize/GetArrayItem/GetObjectItem */
    struct pc_JSON *child;        /* An array or object item will have a child pointer pointing to a chain of the items in the array/object. */

    int type;                    /* The type of the item, as above. */

    char *valuestring;            /* The item's string, if type==pc_JSON_String */
    int valueint;                /* The item's number, if type==pc_JSON_Number */
    double valuedouble;            /* The item's number, if type==pc_JSON_Number */

    char *string;                /* The item's name string, if this item is the child of, or is in the list of subitems of an object. */
} pc_JSON;

typedef struct pc_JSON_Hooks {
      void *(*malloc_fn)(size_t sz);
      void (*free_fn)(void *ptr);
} pc_JSON_Hooks;

/* Supply malloc, realloc and free functions to pc_JSON */
extern void pc_JSON_InitHooks(pc_JSON_Hooks* hooks);


/* Supply a block of JSON, and this returns a pc_JSON object you can interrogate. Call pc_JSON_Delete when finished. */
extern pc_JSON *pc_JSON_Parse(const char *value);
/* Render a pc_JSON entity to text for transfer/storage. Free the char* when finished. */
extern char  *pc_JSON_Print(const pc_JSON *item);
/* Render a pc_JSON entity to text for transfer/storage without any formatting. Free the char* when finished. */
extern char  *pc_JSON_PrintUnformatted(const pc_JSON *item);
/* Delete a pc_JSON entity and all subentities. */
extern void   pc_JSON_Delete(pc_JSON *c);

/* Returns the number of items in an array (or object). */
extern int      pc_JSON_GetArraySize(const pc_JSON *array);
/* Retrieve item number "item" from array "array". Returns NULL if unsuccessful. */
extern pc_JSON *pc_JSON_GetArrayItem(const pc_JSON *array,int item);
/* Get item "string" from object. Case insensitive. */
extern pc_JSON *pc_JSON_GetObjectItem(const pc_JSON *object,const char *string);

/* For analysing failed parses. This returns a pointer to the parse error. You'll probably need to look a few chars back to make sense of it. Defined when pc_JSON_Parse() returns 0. 0 when pc_JSON_Parse() succeeds. */
extern const char *pc_JSON_GetErrorPtr(void);

/* These calls create a pc_JSON item of the appropriate type. */
extern pc_JSON *pc_JSON_CreateNull(void);
extern pc_JSON *pc_JSON_CreateTrue(void);
extern pc_JSON *pc_JSON_CreateFalse(void);
extern pc_JSON *pc_JSON_CreateBool(int b);
extern pc_JSON *pc_JSON_CreateNumber(double num);
extern pc_JSON *pc_JSON_CreateString(const char *string);
extern pc_JSON *pc_JSON_CreateArray(void);
extern pc_JSON *pc_JSON_CreateObject(void);

/* These utilities create an Array of count items. */
extern pc_JSON *pc_JSON_CreateIntArray(const int *numbers,int count);
extern pc_JSON *pc_JSON_CreateFloatArray(const float *numbers,int count);
extern pc_JSON *pc_JSON_CreateDoubleArray(const double *numbers,int count);
extern pc_JSON *pc_JSON_CreateStringArray(const char **strings,int count);

/* Append item to the specified array/object. */
extern void pc_JSON_AddItemToArray(pc_JSON *array, pc_JSON *item);
extern void    pc_JSON_AddItemToObject(pc_JSON *object,const char *string,pc_JSON *item);
/* Append reference to item to the specified array/object. Use this when you want to add an existing pc_JSON to a new pc_JSON, but don't want to corrupt your existing pc_JSON. */
extern void pc_JSON_AddItemReferenceToArray(pc_JSON *array, pc_JSON *item);
extern void    pc_JSON_AddItemReferenceToObject(pc_JSON *object,const char *string,pc_JSON *item);

/* Remove/Detatch items from Arrays/Objects. */
extern pc_JSON *pc_JSON_DetachItemFromArray(pc_JSON *array,int which);
extern void   pc_JSON_DeleteItemFromArray(pc_JSON *array,int which);
extern pc_JSON *pc_JSON_DetachItemFromObject(pc_JSON *object,const char *string);
extern void   pc_JSON_DeleteItemFromObject(pc_JSON *object,const char *string);

/* Update array items. */
extern void pc_JSON_ReplaceItemInArray(pc_JSON *array,int which,pc_JSON *newitem);
extern void pc_JSON_ReplaceItemInObject(pc_JSON *object,const char *string,pc_JSON *newitem);

/* Duplicate a pc_JSON item */
extern pc_JSON *pc_JSON_Duplicate(const pc_JSON *item,int recurse);
/* Duplicate will create a new, identical pc_JSON item to the one you pass, in new memory that will
need to be released. With recurse!=0, it will duplicate any children connected to the item.
The item->next and ->prev pointers are always zero on return from Duplicate. */

/* ParseWithOpts allows you to require (and check) that the JSON is null terminated, and to retrieve the pointer to the final byte parsed. */
extern pc_JSON *pc_JSON_ParseWithOpts(const char *value,const char **return_parse_end,int require_null_terminated);

extern void pc_JSON_Minify(char *json);

/* Macros for creating things quickly. */
#define pc_JSON_AddNullToObject(object,name)        pc_JSON_AddItemToObject(object, name, pc_JSON_CreateNull())
#define pc_JSON_AddTrueToObject(object,name)        pc_JSON_AddItemToObject(object, name, pc_JSON_CreateTrue())
#define pc_JSON_AddFalseToObject(object,name)        pc_JSON_AddItemToObject(object, name, pc_JSON_CreateFalse())
#define pc_JSON_AddBoolToObject(object,name,b)    pc_JSON_AddItemToObject(object, name, pc_JSON_CreateBool(b))
#define pc_JSON_AddNumberToObject(object,name,n)    pc_JSON_AddItemToObject(object, name, pc_JSON_CreateNumber(n))
#define pc_JSON_AddStringToObject(object,name,s)    pc_JSON_AddItemToObject(object, name, pc_JSON_CreateString(s))

/* When assigning an integer value, it needs to be propagated to valuedouble too. */
#define pc_JSON_SetIntValue(object,val)            ((object)?(object)->valueint=(object)->valuedouble=(val):(val))

#ifdef __cplusplus
}
#endif

#endif

