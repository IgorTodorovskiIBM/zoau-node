/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2020. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

#include <napi.h>
#include "zoau.h"
#include "zoau_impl.h"

Napi::Object ZOAU::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func = DefineClass(env, "ZOAU", {
    InstanceMethod("memberList", &ZOAU::memberList),
  });

  Napi::FunctionReference* constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set("ZOAU", func);
  return exports;
}

ZOAU::ZOAU(const Napi::CallbackInfo& info) : Napi::ObjectWrap<ZOAU>(info)  {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Initialize ZOAU here
}

Napi::Object ZOAU::NewInstance(Napi::Env env) {
  Napi::EscapableHandleScope scope(env);
  Napi::Object obj = env.GetInstanceData<Napi::FunctionReference>()->New({});
  return scope.Escape(napi_value(obj)).ToObject();
}

Napi::Value ZOAU::memberList(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  ZOAUWrapper wrapper;
  wrapper.list_members("ITODORO.CLIST");

  return Napi::Number::New(env, wrapper.rc);
}

Napi::Object CreateObject(const Napi::CallbackInfo& info) {
  //return ZOAU::NewInstance(info.Env(), info[0]);
  return ZOAU::NewInstance(info.Env());
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  Napi::Object new_exports =
      Napi::Function::New(env, CreateObject, "ZOAU");
  return ZOAU::Init(env, new_exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll)
