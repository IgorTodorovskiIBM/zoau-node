var zoau = require('../../')

zoau.datasets.listing("SYS1.PARM*", 1).then(console.log)
.catch(function (err) {
     console.log(err);
});

zoau.datasets.exists("SYS1.PARMLIB").then(console.log)

zoau.datasets.list_members("SYS1.PARMLIB").then(console.log).catch(console.error);

zoau.datasets.read("'SYS1.PARMLIB.RACF(IRROPT99)'").then(console.log).catch(console.error);

zoau.datasets.copy("/etc/profile", "'ITODORO.MYPROF2'").then(console.log).catch(console.error);
