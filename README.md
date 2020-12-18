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

* ZOAU v1.1.0 or above should be installed on the system: https://www.ibm.com/support/knowledgecenter/SSKFYE_1.1.0/install.html

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
