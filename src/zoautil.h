#ifndef __ZOAUTIL__
/*
 *********************************************************************
 * Licensed Materials - Property of IBM                              
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.    
 *                                                                   
 * Note to U.S. Government Users Restricted Rights:                  
 * Use, duplication or disclosure restricted by GSA ADP Schedule     
 * Contract with IBM Corp.                                           
 *********************************************************************
*/
/*
 * zoautil.so is a shared library that provides a way for any language (that can call C code)
 * to be able to provide a z/OS Open Application Utilities library (or package or module or whatever term the language uses for a collection of services).
 *
 * There are 3 core functions in the shared library: version(), init(), and term().
 * version:
 *  -Input: No parameters
 *  -Returns: The latest version supported by this shared library, of the form xxVVRRMM, where xx, VV, RR, MM are each one byte in length.
 *	      VV indicates the version. RR indicates the release. MM indicates the modification level. xx is currently reserved and is 0.
 *	      The shared library must at least support the version returned by version() and can additionally support other earlier versions.
 *	      0 is returned if an error occurs.
 *
 * init:
 *  -Input: The version of library to return
 *  -Returns: A vector of function pointers for each utility. The prototype of the vector is named MVSUtil_VVRRMM.
 *	      NULL is returned if an error occurs.
 *
 * term:
 *  -Input: The vector of function pointers returned from init.
 *  -Output: Non-Zero if the shared library can not cleanly be terminated. Zero otherwise.
 */
	#define __ZOAUTIL__
	#include <stdlib.h>

	#define VERSION_020000 (0x020000)


	typedef struct {
		char * stdout_response;
		char * stderr_response;
	} zoau_response;

	#include "vector.h"

  #ifdef __cplusplus
  extern "C" {
  #endif

	unsigned int version();
	ZOAUtil_020000* init(unsigned int);
	int term(ZOAUtil_020000* vector);
	int free_response(zoau_response *);

  #ifdef __cplusplus
  };
  #endif
#endif
