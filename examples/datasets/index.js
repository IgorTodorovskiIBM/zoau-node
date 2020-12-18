var zoau = require('../../')
zoau.datasets.listing("ITODORO.*").then(console.log)
.catch(function (errr) {
     console.log(errr);
});

zoau.datasets.listing("ZSW.*", 1).then(console.log)
.catch(function (errr) {
     console.log(errr);
});
