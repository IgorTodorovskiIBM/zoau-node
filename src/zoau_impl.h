/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2020. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

#ifndef __ZOAU_IMPL_H
#define __ZOAU_IMPL_H
#include "zoautil.h"
#include "vector.h"
#include <fcntl.h>
#include <poll.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <string>
#include <_Nascii.h>
#include <iostream>
#include <sstream> 
 extern "C" int __chgfdccsid(int fd, unsigned short ccsid);

// Singleton - only one vector
class ZOAUWrapper {
public:
  ZOAUtil_020000 *vector;
  zoau_response * sl_response;
  int rc;

  ZOAUWrapper() { 
  }

  int list_members(std::string pattern) {
    unsigned int vrm = version();
    vector = init(vrm);
    std::cout << vrm << std::endl;
    std::ostringstream options;
    options << "\'" << pattern << "\'";
    std::cout << options.str() << std::endl;
    //rc = vector->mls(options.str().c_str(), options.str().size(), &sl_response);
    rc = vector->dls(" -d -l \"itodoro.*\"", strlen(" -d -l \"itodoro.*\""), &sl_response);
    std::cout << sl_response->stdout_response << std::endl;
    std::cerr << sl_response->stdout_response << std::endl;
    std::cout << sl_response->stderr_response << std::endl;
  }

  int list_members2(std::string pattern) {
  int master, slave;

  int fd_in[2];
  int fd_out[2];
  int fd_err[2];
  assert(-1 != pipe(fd_in));
  assert(-1 != pipe(fd_out));
  assert(-1 != pipe(fd_err));
  pid_t pid = fork();

  if (pid == -1)
  {
      // error, failed to fork()
  } 
  else if (pid > 0)
  {
  char msg[4096];
  int msgcnt;
   close(fd_in[0]);
   close(fd_out[1]);
   close(fd_err[1]);
   __chgfdccsid(fd_out[0], 819);
  __chgfdccsid(fd_err[0], 819);
  __chgfdccsid(fd_in[1], 819); 

  char *stuff = "some stuff sent by the parent to the child\n";
  write(fd_in[1], stuff, strlen(stuff));
  close(fd_in[1]);

  char buffer[4096];
  struct pollfd fdset[2];
  fdset[0].fd = fd_out[0];
  fdset[0].events = POLLIN;
  fdset[0].revents = 0;
  fdset[1].fd = fd_err[0];
  fdset[1].events = POLLIN;
  fdset[1].revents = 0;
  int events = 2;
  int handles_closed = 0;
  int ms_towait = 10000;
  int rc;
  char *desc[2] = {"child's stdin", "child's stderr"};

  msgcnt = snprintf(msg, 4096,
                    ".----------------------------------------------------\n"
                    "| child stdout read-fd=%d, child stderr read-fd=%d\n"
                    "'----------------------------------------------------\n",
                    fd_out[0], fd_err[0]);
  write(1, msg, msgcnt);
  do {
    rc = poll(fdset, events, ms_towait); // 10 sec;
  } while (rc == -1 && EAGAIN == errno);
  ms_towait = 1000;

  while (rc >= 0 && handles_closed != 2) {
    int total = rc;
    for (int i = 0; i < 2 && total > 0; ++i) {
      if (fdset[i].revents != 0) {
        if (fdset[i].revents & POLLHUP) {
          msgcnt = snprintf(
              msg, 4096,
              "\n"
              ".----------------------------------------------------\n"
              "| EOF from %d (%s)\n"
              "'----------------------------------------------------\n",
              fdset[i].fd, desc[i]);
          write(1, msg, msgcnt);
          close(fdset[i].fd);
          ++handles_closed;
          fdset[i].fd = -1;
          fdset[i].events = 0;
          fdset[i].revents = 0;
        } else if (fdset[i].revents & POLLIN) {
          int b = read(fdset[i].fd, buffer, 4096);
          msgcnt = snprintf(
              msg, 4096,
              "\n"
              ".----------------------------------------------------\n"
              "| bytes read from %d (%s) = "
              "%d\n"
              "'----------------------------------------------------\n",
              fdset[i].fd, desc[i], b);
          write(1, msg, msgcnt);
          write(1, buffer, b);

          fdset[i].events = POLLIN;
          fdset[i].revents = 0;
        } else {
          msgcnt = snprintf(
              msg, 4096,
              "\n"
              ".----------------------------------------------------\n"
              "| From fd %d (%s) unexpected events %d revents %d\n"
              "'----------------------------------------------------\n",
              fdset[i].fd, desc[i], fdset[i].events, fdset[i].revents);
          write(1, msg, msgcnt);
          fdset[i].revents = 0;
        }
        --total;
      }
    }
    do {
      rc = poll(fdset, events, ms_towait); // 1 sec;
    } while (rc == -1 && EAGAIN == errno);
  }
  int status;
  waitpid(pid, &status, 0);
  msgcnt = snprintf(msg, 4096,
                    ".----------------------------------------------------\n"
                    "| child exit status %d\n"
                    "'----------------------------------------------------\n",
                    status);
  write(1, msg, msgcnt);
    return rc;
  }
  else 
  {
    dup2(fd_in[0], 0);
    __chgfdccsid(0,819);
    dup2(fd_out[1], 1);
    __chgfdccsid(1,819);
   dup2(fd_err[1], 2);
   __chgfdccsid(2,819);
  close(fd_in[1]);
  close(fd_out[0]);
  close(fd_err[0]);
    unsigned int vrm = version();
    vector = init(vrm);
    std::cout << vrm << std::endl;
    std::ostringstream options;
    options << "\'" << pattern << "\'";
    std::cout << options.str() << std::endl;
    //rc = vector->mls(options.str().c_str(), options.str().size(), &sl_response);
    rc = vector->dls(" -d -l \"itodoro.*\"", strlen(" -d -l \"itodoro.*\""), &sl_response);
    std::cout << sl_response->stdout_response << std::endl;
    std::cerr << sl_response->stdout_response << std::endl;
    std::cout << sl_response->stderr_response << std::endl;
    exit(0);
  }
  } 



int child(int argc, char **argv, int *fd_in, int *fd_out, int *fd_err) {
  char **org = argv;
  ++argv; // skip the caller
  dup2(fd_in[0], 0);
  __chgfdccsid(0,819);
  dup2(fd_out[1], 1);
  __chgfdccsid(1,819);
  dup2(fd_err[1], 2);
  __chgfdccsid(2,819);
  close(fd_in[1]);
  close(fd_out[0]);
  close(fd_err[0]);
  printf("BLABLABLA");
  execv(argv[0], argv);
  // if we got here try wrap it with /bin/sh
  org[0] = "/bin/sh";
  execv(org[0], org);
  assert(0); // should not get here
  exit(-1);
}

int parent(int argc, char **argv, int *fd_in, int *fd_out, int *fd_err,
           int childpid) {
  char msg[4096];
  int msgcnt;
  close(fd_in[0]);
  close(fd_out[1]);
  close(fd_err[1]);

#if KAKA
#if 0
  __chgfdccsid(fd_out[0], 1047);
  __chgfdccsid(fd_err[0], 1047);
  __chgfdccsid(fd_in[1], 1047);
#else
  __chgfdccsid(fd_out[0], 819);
  __chgfdccsid(fd_err[0], 819);
  __chgfdccsid(fd_in[1], 819);
#endif
#endif

  char *stuff = "some stuff sent by the parent to the child\n";
  write(fd_in[1], stuff, strlen(stuff));
  close(fd_in[1]);

  char buffer[4096];
  struct pollfd fdset[2];
  fdset[0].fd = fd_out[0];
  fdset[0].events = POLLIN;
  fdset[0].revents = 0;
  fdset[1].fd = fd_err[0];
  fdset[1].events = POLLIN;
  fdset[1].revents = 0;
  int events = 2;
  int handles_closed = 0;
  int ms_towait = 10000;
  int rc;
  char *desc[2] = {"child's stdin", "child's stderr"};

  msgcnt = snprintf(msg, 4096,
                    ".----------------------------------------------------\n"
                    "| child stdout read-fd=%d, child stderr read-fd=%d\n"
                    "'----------------------------------------------------\n",
                    fd_out[0], fd_err[0]);
  write(1, msg, msgcnt);
  do {
    rc = poll(fdset, events, ms_towait); // 10 sec;
  } while (rc == -1 && EAGAIN == errno);
  ms_towait = 1000;

  while (rc >= 0 && handles_closed != 2) {
    int total = rc;
    for (int i = 0; i < 2 && total > 0; ++i) {
      if (fdset[i].revents != 0) {
        if (fdset[i].revents & POLLHUP) {
          msgcnt = snprintf(
              msg, 4096,
              "\n"
              ".----------------------------------------------------\n"
              "| EOF from %d (%s)\n"
              "'----------------------------------------------------\n",
              fdset[i].fd, desc[i]);
          write(1, msg, msgcnt);
          close(fdset[i].fd);
          ++handles_closed;
          fdset[i].fd = -1;
          fdset[i].events = 0;
          fdset[i].revents = 0;
        } else if (fdset[i].revents & POLLIN) {
          int b = read(fdset[i].fd, buffer, 4096);
          msgcnt = snprintf(
              msg, 4096,
              "\n"
              ".----------------------------------------------------\n"
              "| bytes read from %d (%s) = "
              "%d\n"
              "'----------------------------------------------------\n",
              fdset[i].fd, desc[i], b);
          write(1, msg, msgcnt);
          write(1, buffer, b);

          fdset[i].events = POLLIN;
          fdset[i].revents = 0;
        } else {
          msgcnt = snprintf(
              msg, 4096,
              "\n"
              ".----------------------------------------------------\n"
              "| From fd %d (%s) unexpected events %d revents %d\n"
              "'----------------------------------------------------\n",
              fdset[i].fd, desc[i], fdset[i].events, fdset[i].revents);
          write(1, msg, msgcnt);
          fdset[i].revents = 0;
        }
        --total;
      }
    }
    do {
      rc = poll(fdset, events, ms_towait); // 1 sec;
    } while (rc == -1 && EAGAIN == errno);
  }
  int status;
  waitpid(childpid, &status, 0);
  msgcnt = snprintf(msg, 4096,
                    ".----------------------------------------------------\n"
                    "| child exit status %d\n"
                    "'----------------------------------------------------\n",
                    status);
  write(1, msg, msgcnt);
  return 0;
}
  int domain() {

    printf("in do main");
    int argc = 2;
    char* argv[2] = {"/bin/env", NULL};
    int fd_in[2];
    int fd_out[2];
    int fd_err[2];
    if (argc < 2) {
      fprintf(stderr, "need a command\n");
      return -1;
    }
    pid_t p;
    assert(-1 != pipe(fd_in));
    assert(-1 != pipe(fd_out));
    assert(-1 != pipe(fd_err));

    p = fork();
    assert(-1 != p);
    if (p) {
      return parent(argc, argv, fd_in, fd_out, fd_err, p);
    } else {
      return child(argc, argv, fd_in, fd_out, fd_err);
    }
  }
};
#endif
