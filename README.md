# node-zoau - A node module for Z Open Automation Utilities (ZOAU)

## Table of Contents

 * [Overview](#overview)
 * [System Requirements](#system-requirements)
 * [Build and Install](#build-and-install)
 * [Quick Start](#quick-start)
 * [API Documentation](#api-documentation)
 * [Legalities](#legalities)

## Overview

node-zoau is a node module that exposes the Z Open Automation Utilities (ZOAU)
APIs in Node.js!

## System Requirements

* ZOAU v1.1.0 or above is required on the system.
  * For more details, visit: https://www.ibm.com/support/knowledgecenter/SSKFYE_1.1.0/install.html

## Setup

* The PATH environment variable needs to include the location of the ZOAU
binaries
``` bash
export PATH=<path_to_zoau>/bin:$PATH
```

## Quick Start

1. Install the zoau node module
```bash
npm install node-zoau
```

2. Create a file named `listds.js` containing the following contents:

```js
var zoau = require('zoau')
zoau.datasets.listing("SYS1.PARM*", 1).then(console.log)
.catch(function (err) {
     console.log(err);
});
```

This code will list all datasets starting with SYS.PARM.  We have chosen
a detailed output, specified as the second parameter.

3.  Run the code
```bash
node listds.js
```

## API Documentation

TODO

## Contributing

If you are looking to contribute to node-zoau development, follow these steps
to set up your development environment:

1. Follow the instructions in
https://www.ibm.com/support/knowledgecenter/SSKFYE_1.1.0/install.html to install
and configure ZOAU on your system.

2. Verify that ZOAU is successfully installed using `type -a mvscmdauth`. The
output of the command should contain the path set in the `$ZOAU_HOME` variable
from the previous step.

```bash
$ echo $ZOAU_HOME
/usr/lpp/IBM/zoautil
$ type -a mvscmdauth
mvscmdauth is /usr/lpp/IBM/zoautil/bin/mvscmdauth
```

3. Verify that ZOAU is APF-authorized using `ls -E $ZOAU_HOME/bin`. Examine the
output and ensure that the `mvscmdauth` and `mvscmdauthhelper` binaries shows
an `a---` on the second column.

```bash
$ ls -E $ZOAU_HOME/bin
...
-rwxr-xr-x  a---  1 OPNZOS   CDEV       98304 Sep 25 10:07 mvscmdauth
-rwxr-xr-x  a---  1 OPNZOS   CDEV      282624 Sep 25 10:07 mvscmdauthhelper
...
```

If the `a` is not present, you must set the APF authorization bit using the
commands `extattr +a $ZOAU_HOME/bin/mvscmdauth` and
`extattr +a $ZOAU_HOME/bin/mvscmdauthhelper`.

If you are not able to set the APF authorization bit, please consult your
systems programmer, as you may lack the necessary permissions.

4. Install the dependencies required for node-zoau.

```bash
$ npm install
```

5. Verify that node-zoau is working by running the provided test cases under
[examples/](examples).

```bash
$ node examples/datasets/compare.js
```

## Legalities

TODO

### Copyright

```
Licensed Materials - Property of IBM
node-zoau
(C) Copyright IBM Corp. 2020. All Rights Reserved.
US Government Users Restricted Rights - Use, duplication
or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
```
