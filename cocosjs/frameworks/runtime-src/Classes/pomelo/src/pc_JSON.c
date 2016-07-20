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

/* pc_JSON */
/* JSON parser in C. */

#include <string.h>
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <float.h>
#include <limits.h>

#include "pc_JSON.h"

static const char *ep;

const char *pc_JSON_GetErrorPtr(void) {return ep;}

static void *(*pc_JSON_malloc)(size_t sz) = malloc;
static void (*pc_JSON_free)(void *ptr) = free;

static char* pc_JSON_strdup(const char* str)
{
      size_t len;
      char* copy;

      len = strlen(str) + 1;
      if (!(copy = (char*)pc_JSON_malloc(len))) return 0;
      memcpy(copy,str,len);
      return copy;
}

void pc_JSON_InitHooks(pc_JSON_Hooks* hooks)
{
    if (!hooks) { /* Reset hooks */
        pc_JSON_malloc = malloc;
        pc_JSON_free = free;
        return;
    }

    pc_JSON_malloc = (hooks->malloc_fn)?hooks->malloc_fn:malloc;
    pc_JSON_free     = (hooks->free_fn)?hooks->free_fn:free;
}

/* Internal constructor. */
static pc_JSON *pc_JSON_New_Item(void)
{
    pc_JSON* node = (pc_JSON*)pc_JSON_malloc(sizeof(pc_JSON));
    if (node) memset(node,0,sizeof(pc_JSON));
    return node;
}

/* Delete a pc_JSON structure. */
void pc_JSON_Delete(pc_JSON *c)
{
    pc_JSON *next;
    while (c)
    {
        next=c->next;
        if (!(c->type&pc_JSON_IsReference) && c->child) pc_JSON_Delete(c->child);
        if (!(c->type&pc_JSON_IsReference) && c->valuestring) pc_JSON_free(c->valuestring);
        if (c->string) pc_JSON_free(c->string);
        pc_JSON_free(c);
        c=next;
    }
}

/* Parse the input text to generate a number, and populate the result into item. */
static const char *parse_number(pc_JSON *item,const char *num)
{
    double n=0,sign=1,scale=0;int subscale=0,signsubscale=1;

    if (*num=='-') sign=-1,num++;    /* Has sign? */
    if (*num=='0') num++;            /* is zero */
    if (*num>='1' && *num<='9')    do    n=(n*10.0)+(*num++ -'0');    while (*num>='0' && *num<='9');    /* Number? */
    if (*num=='.' && num[1]>='0' && num[1]<='9') {num++;        do    n=(n*10.0)+(*num++ -'0'),scale--; while (*num>='0' && *num<='9');}    /* Fractional part? */
    if (*num=='e' || *num=='E')        /* Exponent? */
    {    num++;if (*num=='+') num++;    else if (*num=='-') signsubscale=-1,num++;        /* With sign? */
        while (*num>='0' && *num<='9') subscale=(subscale*10)+(*num++ - '0');    /* Number? */
    }

    n=sign*n*pow(10.0,(scale+subscale*signsubscale));    /* number = +/- number.fraction * 10^+/- exponent */

    item->valuedouble=n;
    item->valueint=(int)n;
    item->type=pc_JSON_Number;
    return num;
}

/* Render the number nicely from the given item into a string. */
static char *print_number(const pc_JSON *item)
{
    char *str;
    double d=item->valuedouble;
    if (fabs(((double)item->valueint)-d)<=DBL_EPSILON && d<=INT_MAX && d>=INT_MIN)
    {
        str=(char*)pc_JSON_malloc(21);    /* 2^64+1 can be represented in 21 chars. */
        if (str) sprintf(str,"%d",item->valueint);
    }
    else
    {
        str=(char*)pc_JSON_malloc(64);    /* This is a nice tradeoff. */
        if (str)
        {
            if (fabs(floor(d)-d)<=DBL_EPSILON && fabs(d)<1.0e60)sprintf(str,"%.0f",d);
            else if (fabs(d)<1.0e-6 || fabs(d)>1.0e9)            sprintf(str,"%e",d);
            else                                                sprintf(str,"%f",d);
        }
    }
    return str;
}

static unsigned parse_hex4(const char *str)
{
    unsigned h=0;
    if (*str>='0' && *str<='9') h+=(*str)-'0'; else if (*str>='A' && *str<='F') h+=10+(*str)-'A'; else if (*str>='a' && *str<='f') h+=10+(*str)-'a'; else return 0;
    h=h<<4;str++;
    if (*str>='0' && *str<='9') h+=(*str)-'0'; else if (*str>='A' && *str<='F') h+=10+(*str)-'A'; else if (*str>='a' && *str<='f') h+=10+(*str)-'a'; else return 0;
    h=h<<4;str++;
    if (*str>='0' && *str<='9') h+=(*str)-'0'; else if (*str>='A' && *str<='F') h+=10+(*str)-'A'; else if (*str>='a' && *str<='f') h+=10+(*str)-'a'; else return 0;
    h=h<<4;str++;
    if (*str>='0' && *str<='9') h+=(*str)-'0'; else if (*str>='A' && *str<='F') h+=10+(*str)-'A'; else if (*str>='a' && *str<='f') h+=10+(*str)-'a'; else return 0;
    return h;
}

/* Parse the input text into an unescaped cstring, and populate item. */
static const unsigned char firstByteMark[7] = { 0x00, 0x00, 0xC0, 0xE0, 0xF0, 0xF8, 0xFC };
static const char *parse_string(pc_JSON *item,const char *str)
{
    const char *ptr=str+1;char *ptr2;char *out;int len=0;unsigned uc,uc2;
    if (*str!='\"') {ep=str;return 0;}    /* not a string! */

    while (*ptr!='\"' && *ptr && ++len) if (*ptr++ == '\\') ptr++;    /* Skip escaped quotes. */

    out=(char*)pc_JSON_malloc(len+1);    /* This is how long we need for the string, roughly. */
    if (!out) return 0;

    ptr=str+1;ptr2=out;
    while (*ptr!='\"' && *ptr)
    {
        if (*ptr!='\\') *ptr2++=*ptr++;
        else
        {
            ptr++;
            switch (*ptr)
            {
                case 'b': *ptr2++='\b';    break;
                case 'f': *ptr2++='\f';    break;
                case 'n': *ptr2++='\n';    break;
                case 'r': *ptr2++='\r';    break;
                case 't': *ptr2++='\t';    break;
                case 'u':     /* transcode utf16 to utf8. */
                    uc=parse_hex4(ptr+1);ptr+=4;    /* get the unicode char. */

                    if ((uc>=0xDC00 && uc<=0xDFFF) || uc==0)    break;    /* check for invalid.    */

                    if (uc>=0xD800 && uc<=0xDBFF)    /* UTF16 surrogate pairs.    */
                    {
                        if (ptr[1]!='\\' || ptr[2]!='u')    break;    /* missing second-half of surrogate.    */
                        uc2=parse_hex4(ptr+3);ptr+=6;
                        if (uc2<0xDC00 || uc2>0xDFFF)        break;    /* invalid second-half of surrogate.    */
                        uc=0x10000 + (((uc&0x3FF)<<10) | (uc2&0x3FF));
                    }

                    len=4;if (uc<0x80) len=1;else if (uc<0x800) len=2;else if (uc<0x10000) len=3; ptr2+=len;

                    switch (len) {
                        case 4: *--ptr2 =((uc | 0x80) & 0xBF); uc >>= 6;
                        case 3: *--ptr2 =((uc | 0x80) & 0xBF); uc >>= 6;
                        case 2: *--ptr2 =((uc | 0x80) & 0xBF); uc >>= 6;
                        case 1: *--ptr2 =(uc | firstByteMark[len]);
                    }
                    ptr2+=len;
                    break;
                default:  *ptr2++=*ptr; break;
            }
            ptr++;
        }
    }
    *ptr2=0;
    if (*ptr=='\"') ptr++;
    item->valuestring=out;
    item->type=pc_JSON_String;
    return ptr;
}

/* Render the cstring provided to an escaped version that can be printed. */
static char *print_string_ptr(const char *str)
{
    const char *ptr;char *ptr2,*out;int len=0;unsigned char token;

    if (!str) return pc_JSON_strdup("");
    ptr=str;while ((token=*ptr) && ++len) {if (strchr("\"\\\b\f\n\r\t",token)) len++; else if (token<32) len+=5;ptr++;}

    out=(char*)pc_JSON_malloc(len+3);
    if (!out) return 0;

    ptr2=out;ptr=str;
    *ptr2++='\"';
    while (*ptr)
    {
        if ((unsigned char)*ptr>31 && *ptr!='\"' && *ptr!='\\') *ptr2++=*ptr++;
        else
        {
            *ptr2++='\\';
            switch (token=*ptr++)
            {
                case '\\':    *ptr2++='\\';    break;
                case '\"':    *ptr2++='\"';    break;
                case '\b':    *ptr2++='b';    break;
                case '\f':    *ptr2++='f';    break;
                case '\n':    *ptr2++='n';    break;
                case '\r':    *ptr2++='r';    break;
                case '\t':    *ptr2++='t';    break;
                default: sprintf(ptr2,"u%04x",token);ptr2+=5;    break;    /* escape and print */
            }
        }
    }
    *ptr2++='\"';*ptr2++=0;
    return out;
}
/* Invote print_string_ptr (which is useful) on an item. */
static char *print_string(const pc_JSON *item)    {return print_string_ptr(item->valuestring);}

/* Predeclare these prototypes. */
static const char *parse_value(pc_JSON *item,const char *value);
static char *print_value(const pc_JSON *item,int depth,int fmt);
static const char *parse_array(pc_JSON *item,const char *value);
static char *print_array(const pc_JSON *item,int depth,int fmt);
static const char *parse_object(pc_JSON *item,const char *value);
static char *print_object(const pc_JSON *item,int depth,int fmt);

/* Utility to jump whitespace and cr/lf */
static const char *skip(const char *in) {while (in && *in && (unsigned char)*in<=32) in++; return in;}

/* Parse an object - create a new root, and populate. */
pc_JSON *pc_JSON_ParseWithOpts(const char *value,const char **return_parse_end,int require_null_terminated)
{
    const char *end=0;
    pc_JSON *c=pc_JSON_New_Item();
    ep=0;
    if (!c) return 0;       /* memory fail */

    end=parse_value(c,skip(value));
    if (!end)    {pc_JSON_Delete(c);return 0;}    /* parse failure. ep is set. */

    /* if we require null-terminated JSON without appended garbage, skip and then check for a null terminator */
    if (require_null_terminated) {end=skip(end);if (*end) {pc_JSON_Delete(c);ep=end;return 0;}}
    if (return_parse_end) *return_parse_end=end;
    return c;
}
/* Default options for pc_JSON_Parse */
pc_JSON *pc_JSON_Parse(const char *value) {return pc_JSON_ParseWithOpts(value,0,0);}

/* Render a pc_JSON item/entity/structure to text. */
char *pc_JSON_Print(const pc_JSON *item)                {return print_value(item,0,1);}
char *pc_JSON_PrintUnformatted(const pc_JSON *item)    {return print_value(item,0,0);}

/* Parser core - when encountering text, process appropriately. */
static const char *parse_value(pc_JSON *item,const char *value)
{
    if (!value)                        return 0;    /* Fail on null. */
    if (!strncmp(value,"null",4))    { item->type=pc_JSON_NULL;  return value+4; }
    if (!strncmp(value,"false",5))    { item->type=pc_JSON_False; return value+5; }
    if (!strncmp(value,"true",4))    { item->type=pc_JSON_True; item->valueint=1;    return value+4; }
    if (*value=='\"')                { return parse_string(item,value); }
    if (*value=='-' || (*value>='0' && *value<='9'))    { return parse_number(item,value); }
    if (*value=='[')                { return parse_array(item,value); }
    if (*value=='{')                { return parse_object(item,value); }

    ep=value;return 0;    /* failure. */
}

/* Render a value to text. */
static char *print_value(const pc_JSON *item,int depth,int fmt)
{
    char *out=0;
    if (!item) return 0;
    switch ((item->type)&255)
    {
        case pc_JSON_NULL:    out=pc_JSON_strdup("null");    break;
        case pc_JSON_False:    out=pc_JSON_strdup("false");break;
        case pc_JSON_True:    out=pc_JSON_strdup("true"); break;
        case pc_JSON_Number:    out=print_number(item);break;
        case pc_JSON_String:    out=print_string(item);break;
        case pc_JSON_Array:    out=print_array(item,depth,fmt);break;
        case pc_JSON_Object:    out=print_object(item,depth,fmt);break;
    }
    return out;
}

/* Build an array from input text. */
static const char *parse_array(pc_JSON *item,const char *value)
{
    pc_JSON *child;
    if (*value!='[')    {ep=value;return 0;}    /* not an array! */

    item->type=pc_JSON_Array;
    value=skip(value+1);
    if (*value==']') return value+1;    /* empty array. */

    item->child=child=pc_JSON_New_Item();
    if (!item->child) return 0;         /* memory fail */
    value=skip(parse_value(child,skip(value)));    /* skip any spacing, get the value. */
    if (!value) return 0;

    while (*value==',')
    {
        pc_JSON *new_item;
        if (!(new_item=pc_JSON_New_Item())) return 0;     /* memory fail */
        child->next=new_item;new_item->prev=child;child=new_item;
        value=skip(parse_value(child,skip(value+1)));
        if (!value) return 0;    /* memory fail */
    }

    if (*value==']') return value+1;    /* end of array */
    ep=value;return 0;    /* malformed. */
}

/* Render an array to text */
static char *print_array(const pc_JSON *item,int depth,int fmt)
{
    char **entries;
    char *out=0,*ptr,*ret;int len=5;
    pc_JSON *child=item->child;
    int numentries=0,i=0,fail=0;

    /* How many entries in the array? */
    while (child) numentries++,child=child->next;
    /* Explicitly handle numentries==0 */
    if (!numentries)
    {
        out=(char*)pc_JSON_malloc(3);
        if (out) strcpy(out,"[]");
        return out;
    }
    /* Allocate an array to hold the values for each */
    entries=(char**)pc_JSON_malloc(numentries*sizeof(char*));
    if (!entries) return 0;
    memset(entries,0,numentries*sizeof(char*));
    /* Retrieve all the results: */
    child=item->child;
    while (child && !fail)
    {
        ret=print_value(child,depth+1,fmt);
        entries[i++]=ret;
        if (ret) len+=strlen(ret)+2+(fmt?1:0); else fail=1;
        child=child->next;
    }

    /* If we didn't fail, try to malloc the output string */
    if (!fail) out=(char*)pc_JSON_malloc(len);
    /* If that fails, we fail. */
    if (!out) fail=1;

    /* Handle failure. */
    if (fail)
    {
        for (i=0;i<numentries;i++) if (entries[i]) pc_JSON_free(entries[i]);
        pc_JSON_free(entries);
        return 0;
    }

    /* Compose the output array. */
    *out='[';
    ptr=out+1;*ptr=0;
    for (i=0;i<numentries;i++)
    {
        strcpy(ptr,entries[i]);ptr+=strlen(entries[i]);
        if (i!=numentries-1) {*ptr++=',';if(fmt)*ptr++=' ';*ptr=0;}
        pc_JSON_free(entries[i]);
    }
    pc_JSON_free(entries);
    *ptr++=']';*ptr++=0;
    return out;
}

/* Build an object from the text. */
static const char *parse_object(pc_JSON *item,const char *value)
{
    pc_JSON *child;
    if (*value!='{')    {ep=value;return 0;}    /* not an object! */

    item->type=pc_JSON_Object;
    value=skip(value+1);
    if (*value=='}') return value+1;    /* empty array. */

    item->child=child=pc_JSON_New_Item();
    if (!item->child) return 0;
    value=skip(parse_string(child,skip(value)));
    if (!value) return 0;
    child->string=child->valuestring;child->valuestring=0;
    if (*value!=':') {ep=value;return 0;}    /* fail! */
    value=skip(parse_value(child,skip(value+1)));    /* skip any spacing, get the value. */
    if (!value) return 0;

    while (*value==',')
    {
        pc_JSON *new_item;
        if (!(new_item=pc_JSON_New_Item()))    return 0; /* memory fail */
        child->next=new_item;new_item->prev=child;child=new_item;
        value=skip(parse_string(child,skip(value+1)));
        if (!value) return 0;
        child->string=child->valuestring;child->valuestring=0;
        if (*value!=':') {ep=value;return 0;}    /* fail! */
        value=skip(parse_value(child,skip(value+1)));    /* skip any spacing, get the value. */
        if (!value) return 0;
    }

    if (*value=='}') return value+1;    /* end of array */
    ep=value;return 0;    /* malformed. */
}

/* Render an object to text. */
static char *print_object(const pc_JSON *item,int depth,int fmt)
{
    char **entries=0,**names=0;
    char *out=0,*ptr,*ret,*str;int len=7,i=0,j;
    pc_JSON *child=item->child;
    int numentries=0,fail=0;
    /* Count the number of entries. */
    while (child) numentries++,child=child->next;
    /* Explicitly handle empty object case */
    if (!numentries)
    {
        out=(char*)pc_JSON_malloc(fmt?depth+4:3);
        if (!out)    return 0;
        ptr=out;*ptr++='{';
        if (fmt) {*ptr++='\n';for (i=0;i<depth-1;i++) *ptr++='\t';}
        *ptr++='}';*ptr++=0;
        return out;
    }
    /* Allocate space for the names and the objects */
    entries=(char**)pc_JSON_malloc(numentries*sizeof(char*));
    if (!entries) return 0;
    names=(char**)pc_JSON_malloc(numentries*sizeof(char*));
    if (!names) {pc_JSON_free(entries);return 0;}
    memset(entries,0,sizeof(char*)*numentries);
    memset(names,0,sizeof(char*)*numentries);

    /* Collect all the results into our arrays: */
    child=item->child;depth++;if (fmt) len+=depth;
    while (child && !fail)
    {
        names[i]=str=print_string_ptr(child->string);
        entries[i++]=ret=print_value(child,depth,fmt);
        if (str && ret) len+=strlen(ret)+strlen(str)+2+(fmt?2+depth:0); else fail=1;
        child=child->next;
    }

    /* Try to allocate the output string */
    if (!fail) out=(char*)pc_JSON_malloc(len);
    if (!out) fail=1;

    /* Handle failure */
    if (fail)
    {
        for (i=0;i<numentries;i++) {if (names[i]) pc_JSON_free(names[i]);if (entries[i]) pc_JSON_free(entries[i]);}
        pc_JSON_free(names);pc_JSON_free(entries);
        return 0;
    }

    /* Compose the output: */
    *out='{';ptr=out+1;if (fmt)*ptr++='\n';*ptr=0;
    for (i=0;i<numentries;i++)
    {
        if (fmt) for (j=0;j<depth;j++) *ptr++='\t';
        strcpy(ptr,names[i]);ptr+=strlen(names[i]);
        *ptr++=':';if (fmt) *ptr++='\t';
        strcpy(ptr,entries[i]);ptr+=strlen(entries[i]);
        if (i!=numentries-1) *ptr++=',';
        if (fmt) *ptr++='\n';*ptr=0;
        pc_JSON_free(names[i]);pc_JSON_free(entries[i]);
    }

    pc_JSON_free(names);pc_JSON_free(entries);
    if (fmt) for (i=0;i<depth-1;i++) *ptr++='\t';
    *ptr++='}';*ptr++=0;
    return out;
}

/* Get Array size/item / object item. */
int    pc_JSON_GetArraySize(const pc_JSON *array)                            {pc_JSON *c=array->child;int i=0;while(c)i++,c=c->next;return i;}
pc_JSON *pc_JSON_GetArrayItem(const pc_JSON *array,int item)                {pc_JSON *c=array->child;  while (c && item>0) item--,c=c->next; return c;}
pc_JSON *pc_JSON_GetObjectItem(const pc_JSON *object,const char *string)    {pc_JSON *c=object->child; while (c && strcmp(c->string,string)) c=c->next; return c;}

/* Utility for array list handling. */
static void suffix_object(pc_JSON *prev,pc_JSON *item) {prev->next=item;item->prev=prev;}
/* Utility for handling references. */
static pc_JSON *create_reference(pc_JSON *item) {pc_JSON *ref=pc_JSON_New_Item();if (!ref) return 0;memcpy(ref,item,sizeof(pc_JSON));ref->string=0;ref->type|=pc_JSON_IsReference;ref->next=ref->prev=0;return ref;}

/* Add item to array/object. */
void   pc_JSON_AddItemToArray(pc_JSON *array, pc_JSON *item)                        {pc_JSON *c=array->child;if (!item) return; if (!c) {array->child=item;} else {while (c && c->next) c=c->next; suffix_object(c,item);}}
void   pc_JSON_AddItemToObject(pc_JSON *object,const char *string,pc_JSON *item)    {if (!item) return; if (item->string) pc_JSON_free(item->string);item->string=pc_JSON_strdup(string);pc_JSON_AddItemToArray(object,item);}
void    pc_JSON_AddItemReferenceToArray(pc_JSON *array, pc_JSON *item)                        {pc_JSON_AddItemToArray(array,create_reference(item));}
void    pc_JSON_AddItemReferenceToObject(pc_JSON *object,const char *string,pc_JSON *item)    {pc_JSON_AddItemToObject(object,string,create_reference(item));}

pc_JSON *pc_JSON_DetachItemFromArray(pc_JSON *array,int which)            {pc_JSON *c=array->child;while (c && which>0) c=c->next,which--;if (!c) return 0;
    if (c->prev) c->prev->next=c->next;if (c->next) c->next->prev=c->prev;if (c==array->child) array->child=c->next;c->prev=c->next=0;return c;}
void   pc_JSON_DeleteItemFromArray(pc_JSON *array,int which)            {pc_JSON_Delete(pc_JSON_DetachItemFromArray(array,which));}
pc_JSON *pc_JSON_DetachItemFromObject(pc_JSON *object,const char *string) {int i=0;pc_JSON *c=object->child;while (c && strcmp(c->string,string)) i++,c=c->next;if (c) return pc_JSON_DetachItemFromArray(object,i);return 0;}
void   pc_JSON_DeleteItemFromObject(pc_JSON *object,const char *string) {pc_JSON_Delete(pc_JSON_DetachItemFromObject(object,string));}

/* Replace array/object items with new ones. */
void   pc_JSON_ReplaceItemInArray(pc_JSON *array,int which,pc_JSON *newitem)        {pc_JSON *c=array->child;while (c && which>0) c=c->next,which--;if (!c) return;
    newitem->next=c->next;newitem->prev=c->prev;if (newitem->next) newitem->next->prev=newitem;
    if (c==array->child) array->child=newitem; else newitem->prev->next=newitem;c->next=c->prev=0;pc_JSON_Delete(c);}
void   pc_JSON_ReplaceItemInObject(pc_JSON *object,const char *string,pc_JSON *newitem){int i=0;pc_JSON *c=object->child;while(c && strcmp(c->string,string))i++,c=c->next;if(c){newitem->string=pc_JSON_strdup(string);pc_JSON_ReplaceItemInArray(object,i,newitem);}}

/* Create basic types: */
pc_JSON *pc_JSON_CreateNull(void)                    {pc_JSON *item=pc_JSON_New_Item();if(item)item->type=pc_JSON_NULL;return item;}
pc_JSON *pc_JSON_CreateTrue(void)                    {pc_JSON *item=pc_JSON_New_Item();if(item)item->type=pc_JSON_True;return item;}
pc_JSON *pc_JSON_CreateFalse(void)                    {pc_JSON *item=pc_JSON_New_Item();if(item)item->type=pc_JSON_False;return item;}
pc_JSON *pc_JSON_CreateBool(int b)                    {pc_JSON *item=pc_JSON_New_Item();if(item)item->type=b?pc_JSON_True:pc_JSON_False;return item;}
pc_JSON *pc_JSON_CreateNumber(double num)            {pc_JSON *item=pc_JSON_New_Item();if(item){item->type=pc_JSON_Number;item->valuedouble=num;item->valueint=(int)num;}return item;}
pc_JSON *pc_JSON_CreateString(const char *string)    {pc_JSON *item=pc_JSON_New_Item();if(item){item->type=pc_JSON_String;item->valuestring=pc_JSON_strdup(string);}return item;}
pc_JSON *pc_JSON_CreateArray(void)                    {pc_JSON *item=pc_JSON_New_Item();if(item)item->type=pc_JSON_Array;return item;}
pc_JSON *pc_JSON_CreateObject(void)                    {pc_JSON *item=pc_JSON_New_Item();if(item)item->type=pc_JSON_Object;return item;}

/* Create Arrays: */
pc_JSON *pc_JSON_CreateIntArray(const int *numbers,int count)        {int i;pc_JSON *n=0,*p=0,*a=pc_JSON_CreateArray();for(i=0;a && i<count;i++){n=pc_JSON_CreateNumber(numbers[i]);if(!i)a->child=n;else suffix_object(p,n);p=n;}return a;}
pc_JSON *pc_JSON_CreateFloatArray(const float *numbers,int count)    {int i;pc_JSON *n=0,*p=0,*a=pc_JSON_CreateArray();for(i=0;a && i<count;i++){n=pc_JSON_CreateNumber(numbers[i]);if(!i)a->child=n;else suffix_object(p,n);p=n;}return a;}
pc_JSON *pc_JSON_CreateDoubleArray(const double *numbers,int count)    {int i;pc_JSON *n=0,*p=0,*a=pc_JSON_CreateArray();for(i=0;a && i<count;i++){n=pc_JSON_CreateNumber(numbers[i]);if(!i)a->child=n;else suffix_object(p,n);p=n;}return a;}
pc_JSON *pc_JSON_CreateStringArray(const char **strings,int count)    {int i;pc_JSON *n=0,*p=0,*a=pc_JSON_CreateArray();for(i=0;a && i<count;i++){n=pc_JSON_CreateString(strings[i]);if(!i)a->child=n;else suffix_object(p,n);p=n;}return a;}

/* Duplication */
pc_JSON *pc_JSON_Duplicate(const pc_JSON *item,int recurse)
{
    pc_JSON *newitem,*cptr,*nptr=0,*newchild;
    /* Bail on bad ptr */
    if (!item) return 0;
    /* Create new item */
    newitem=pc_JSON_New_Item();
    if (!newitem) return 0;
    /* Copy over all vars */
    newitem->type=item->type&(~pc_JSON_IsReference),newitem->valueint=item->valueint,newitem->valuedouble=item->valuedouble;
    if (item->valuestring)    {newitem->valuestring=pc_JSON_strdup(item->valuestring);    if (!newitem->valuestring)    {pc_JSON_Delete(newitem);return 0;}}
    if (item->string)        {newitem->string=pc_JSON_strdup(item->string);            if (!newitem->string)        {pc_JSON_Delete(newitem);return 0;}}
    /* If non-recursive, then we're done! */
    if (!recurse) return newitem;
    /* Walk the ->next chain for the child. */
    cptr=item->child;
    while (cptr)
    {
        newchild=pc_JSON_Duplicate(cptr,1);        /* Duplicate (with recurse) each item in the ->next chain */
        if (!newchild) {pc_JSON_Delete(newitem);return 0;}
        if (nptr)    {nptr->next=newchild,newchild->prev=nptr;nptr=newchild;}    /* If newitem->child already set, then crosswire ->prev and ->next and move on */
        else        {newitem->child=newchild;nptr=newchild;}                    /* Set newitem->child and move to it */
        cptr=cptr->next;
    }
    return newitem;
}

void pc_JSON_Minify(char *json)
{
    char *into=json;
    while (*json)
    {
        if (*json==' ') json++;
        else if (*json=='\t') json++;    /* Whitespace characters. */
        else if (*json=='\r') json++;
        else if (*json=='\n') json++;
        else if (*json=='/' && json[1]=='/')  while (*json && *json!='\n') json++;    /* double-slash comments, to end of line. */
        else if (*json=='/' && json[1]=='*') {while (*json && !(*json=='*' && json[1]=='/')) json++;json+=2;}    /* multiline comments. */
        else if (*json=='\"'){*into++=*json++;while (*json && *json!='\"'){if (*json=='\\') *into++=*json++;*into++=*json++;}*into++=*json++;} /* string literals, which are \" sensitive. */
        else *into++=*json++;            /* All other characters. */
    }
    *into=0;    /* and null-terminate. */
}
