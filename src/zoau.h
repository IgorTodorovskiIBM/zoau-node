/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2020. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

#ifndef __ZOAU_H_
#define __ZOAU_H_ 1

#if !defined(__MVS__)
#error This addon is for zos only
#endif

#include <stdio.h>
#include <stdlib.h>
#include <napi.h>
#include <string>

class ZOAU : public Napi::ObjectWrap<ZOAU> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static Napi::Object NewInstance(Napi::Env env);

  ZOAU(const Napi::CallbackInfo& info);

 private:
  static Napi::FunctionReference constructor;
  Napi::Value memberList(const Napi::CallbackInfo& info);
  
  int counter_;
};



#endif
