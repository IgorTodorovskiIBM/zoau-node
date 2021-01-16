// Tests find_member, move_member, delete_members
var zoau = require('../../lib/zoau.js')
const { exec } = require('child_process');

const ID = process.env.USER;
const DST = `${ID}.ZOAUTEST`;

function errfunc(err) {
  throw new Error(err);
}

async function prepareDS(delOld = null) {
  var ds = await zoau.datasets.tmp_name(DST).catch(errfunc);
  console.log(`Test: create ${ds}`);
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(ds, "SEQ", details).then(console.log).catch(errfunc);
  if (delOld) {
    console.log(`Deleting old ${delOld} dataset`);
    await zoau.datasets.delete(delOld).then(console.log).catch(errfunc);
  }
  return ds;
}

async function lockDS(dsn) {
  let promise = new Promise((resolve, reject) => {
    console.log(`Test: dlockcmd ${dsn} 500`);
    var child = exec(`dlockcmd ${dsn} 500`, (err, stdout, stderr) => {
      if (stderr.startsWith("BGYSC4603I Lock rc: 0")) {
        var pid = stderr.split(' ')[8].trimEnd();
        resolve(pid);
      } else
        reject(stderr);
    });
  });
  return await promise.catch(errfunc);
}

function verifyLockError(err) {
  if (!err.message.startsWith(`BGYSC1801E Failed to obtain the lock for ${DST}`))
    errfunc(err);
}

async function test() {
 try {
  var DS, res, exp;

  // The tests below are based on mvsutil-python/tests/test_datasets.py
  // with a variations added)

  //---------------------------- replace last line (default if !first_match)
  DS = await prepareDS();
  console.log(`Test: write to ${DS}`);
  await zoau.datasets.write(DS, "ONE").catch(console.errfunc);
  await zoau.datasets.write(DS, "TWO", true).catch(console.errfunc);
  await zoau.datasets.write(DS, "TWO", true).catch(console.errfunc);
  await zoau.datasets.write(DS, "THREE", true).catch(console.errfunc);

  console.log("Test: lineinfile replace last line");
  await zoau.datasets.lineinfile(DS, "TOO", "TWO").catch(errfunc);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  exp = [ "ONE", "TWO", "TOO", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  //---------------------------- replace first line
  DS = await prepareDS();
  console.log(`Test: write to ${DS}`);
  await zoau.datasets.write(DS, "ONE").catch(console.errfunc);
  await zoau.datasets.write(DS, "TWO", true).catch(console.errfunc);
  await zoau.datasets.write(DS, "TWO", true).catch(console.errfunc);
  await zoau.datasets.write(DS, "THREE", true).catch(console.errfunc);

  console.log("Test: _lineinfile replace last line with debug");
  var res = await zoau.datasets._lineinfile(DS, "TOO", "TWO", {"first_match" : true, "debug" : true}).catch(errfunc);
  console.log(`res exit=${res["exit"]}`);
  console.log(`res stdout=${res["stdout"]}`);
  console.log(`res stderr=${res["stderr"]}`);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  console.log(`read res=${res}`);
  exp = [ "ONE", "TOO", "TWO", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  //---------------------------- insert after
  DS = await prepareDS(DS);
  await zoau.datasets.write(DS, "ONE").catch(console.errfunc);
  await zoau.datasets.write(DS, "THREE", true).catch(console.errfunc);
  console.log("Test: lineinfile insertafter");
  await zoau.datasets.lineinfile(DS, "TWO", null, {"ins_aft" : "ONE"}).catch(errfunc);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  exp = [ "ONE", "TWO", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  //---------------------------- insert before
  DS = await prepareDS(DS);
  await zoau.datasets.write(DS, "ONE").catch(console.errfunc);
  await zoau.datasets.write(DS, "THREE", true).catch(console.errfunc);
  console.log("Test: lineinfile insertbefore");
  await zoau.datasets.lineinfile(DS, "TWO", null, {"ins_bef" : "THREE"}).catch(errfunc);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  exp = [ "ONE", "TWO", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  //---------------------------- delete
  DS = await prepareDS(DS);
  await zoau.datasets.write(DS, "ONE").catch(console.errfunc);
  await zoau.datasets.write(DS, "TWO", true).catch(console.errfunc);
  await zoau.datasets.write(DS, "THREE", true).catch(console.errfunc);
  console.log("Test: lineinfile delete");
  await zoau.datasets.lineinfile(DS, "TWO", null, {"state" : false}).catch(errfunc);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  exp = [ "ONE", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  //---------------------------- lock
  DS = await prepareDS();
  console.log(`Test: write to ${DS}`);
  await zoau.datasets.write(DS, "ONE").catch(console.errfunc);
  await zoau.datasets.write(DS, "THREE", true).catch(console.errfunc);
  
  var lockPid = await lockDS(DS).catch(errfunc);

  console.log("Test: lineinfile insert while dataset is locked");
  await zoau.datasets.lineinfile(DS, "TWO", null, {"ins_aft":"ONE", "lock":true}).catch(verifyLockError);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  console.log(`read res=${res}`);
  exp = [ "ONE", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  console.log("Test: lineinfile unlock dataset");
  process.kill(lockPid,'SIGQUIT');

  console.log("Test: lineinfile insert after dataset is unlocked");
  await zoau.datasets.lineinfile(DS, "TWO", null, {"ins_aft":"ONE", "lock":true}).catch(errfunc);

  console.log("Test: read and verify");
  res = await zoau.datasets.read(DS).catch(console.errfunc);
  res = res.split("\n");
  exp = [ "ONE", "TWO", "THREE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`Error: unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  console.log("All tests passed.");
 } catch(err) {
   console.error(err);
   process.exit(-1); //TODO(gabylb) - process still exits with code 0
 }
}

test();
