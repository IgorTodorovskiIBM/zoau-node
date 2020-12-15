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
#ifndef __ZOAUTIL_VECTOR__
	#define __ZOAUTIL_VECTOR__ 1

  #ifdef __cplusplus
  extern "C" {
  #endif

  typedef int ZOAUtil_Fn3(const char* parms, size_t lparms, zoau_response ** response);

	typedef struct {
		unsigned int version;

		ZOAUtil_Fn3* dcp;
		ZOAUtil_Fn3* dcpraw;
		ZOAUtil_Fn3* ddiff;
		ZOAUtil_Fn3* decho;
		ZOAUtil_Fn3* dgrep;
		ZOAUtil_Fn3* dinfo;
		ZOAUtil_Fn3* dls;
		ZOAUtil_Fn3* dlsraw;
		ZOAUtil_Fn3* drm;
		ZOAUtil_Fn3* drmraw;
		ZOAUtil_Fn3* dmv;
		ZOAUtil_Fn3* dsed;
		ZOAUtil_Fn3* dmod;
		ZOAUtil_Fn3* dsfilter;
		ZOAUtil_Fn3* dtail;
		ZOAUtil_Fn3* dtouch;
		ZOAUtil_Fn3* hlq;
		ZOAUtil_Fn3* mls;
		ZOAUtil_Fn3* mmv;
		ZOAUtil_Fn3* mrm;
		ZOAUtil_Fn3* mvscmd;
		ZOAUtil_Fn3* mvscmdauth;
		ZOAUtil_Fn3* mvscmdmsg;
		ZOAUtil_Fn3* mvstmp;
		ZOAUtil_Fn3* zoaversion;
		ZOAUtil_Fn3* jsub;
		ZOAUtil_Fn3* jcan;
		ZOAUtil_Fn3* jls;
		ZOAUtil_Fn3* ddls;
		ZOAUtil_Fn3* pjdd;
		ZOAUtil_Fn3* opercmd;
		ZOAUtil_Fn3* pcon;
		ZOAUtil_Fn3* pll;
		ZOAUtil_Fn3* llwhence;
		ZOAUtil_Fn3* pparm;
		ZOAUtil_Fn3* parmgrep;
		ZOAUtil_Fn3* parmwhence;
		ZOAUtil_Fn3* pproc;
		ZOAUtil_Fn3* procgrep;
		ZOAUtil_Fn3* procwhence;
		ZOAUtil_Fn3* dwhence;
		ZOAUtil_Fn3* dzip;
		ZOAUtil_Fn3* dunzip;
		ZOAUtil_Fn3* vls;
		ZOAUtil_Fn3* vtocls;
        ZOAUtil_Fn3* jdc;
		ZOAUtil_Fn3* apfadm;
		ZOAUtil_Fn3* dlockcmd;
	} ZOAUtil_020000;

  #ifdef __cplusplus
  }
  #endif
#endif
