var zoau = require('../../')

const ID = process.env.USER

zoau.datasets.listing("SYS1.PARM*", 1).then(console.log)
.catch(function (err) {
     console.log(err);
});

zoau.datasets.exists("SYS1.PARMLIB").then(console.log)

zoau.datasets.list_members("SYS1.PARMLIB").then(console.log).catch(console.error);

zoau.datasets.read("'SYS1.PARMLIB.RACF(IRROPT99)'").then(console.log).catch(console.error);

var details = { "primary_space" : 10 }
zoau.datasets.create(`'${ID}.MYPROF5'`, details).then(console.log).catch(console.error);

zoau.datasets.copy("/etc/profile", `'${ID}.MYPROF2'`).then(console.log).catch(console.error);
