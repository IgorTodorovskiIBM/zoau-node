var zoau = require('../../lib/zoau')

const ID = process.env.USER

async function test() {
  console.log("Test: listing...");
  await zoau.datasets.listing("SYS1.PARM*", {"detailed" : true}).then(console.log).catch(console.error);
  
  console.log("Test: exists...");
  await zoau.datasets.exists("SYS1.PARMLIB").then(console.log).catch(console.error);
  
  console.log("Test: list_members...");
  await zoau.datasets.list_members("SYS1.PARMLIB").then(console.log).catch(console.error);
  
  console.log("Test: read...");
  await zoau.datasets.read("'SYS1.PARMLIB.RACF(IRROPT99)'").then(console.log).catch(console.error);
  
  console.log("Test: create...");
  var details = { "primary_space" : 10 }
  await zoau.datasets.create(`'${ID}.MYPROF5'`, "PDS", details).then(console.log).catch(console.error);
  
  console.log("Test: copy...");
  await zoau.datasets.copy("/etc/profile", `'${ID}.MYPROF2'`).then(console.log).catch(console.error);
}

test();
