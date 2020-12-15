var zoau = require('./zoau')
zoau.listing("ITODORO.*").then(console.log)
.catch(function (errr) {
     console.log(errr);
});
