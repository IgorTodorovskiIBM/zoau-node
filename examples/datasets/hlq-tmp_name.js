// Tests find_member, move_member, delete_members
var zoau = require('../../lib/zoau.js')

const ID = process.env.USER;

function errfunc(err) {
  throw new Error(err);
}

async function test() {
 try {
  //---------------hlq
  console.log("Test: hlq...");
  var res = await zoau.datasets.hlq().catch(console.error);
  if (res !== ID) {
    console.error(`Error: hlq returned ${res}, expected ${ID}`);
    process.exitCode = -1; return;
  }

  console.log("Test: hlq -d...");
  res = await zoau.datasets.hlq({"debug":true}).catch(console.error);
  if (res !== ID) {
    console.error(`Error: hlq -d returned ${res}, expected ${ID}`);
    process.exitCode = -1; return;
  }

  console.log("Test: _hlq -d...");
  res = await zoau.datasets._hlq({"debug":true}).catch(console.error);
  console.log('exit=<' + res["exit"] + '>');
  console.log('stdout=<' + res["stdout"] + '>');
  if (res["stdout"].trimEnd("\n") !== ID) {
    console.error(`Error: hlq -d returned ${res["stdout"].trimEnd("\n")}, expected ${ID}`);
    process.exitCode = -1; return;
  }
  console.log('stderr=<' + res["stderr"] + '>');

  //---------------tmp_name
  console.log("Test: tmp_name...");
  var res = await zoau.datasets.tmp_name().catch(console.error);
  console.log(`res=${res}`);
  var dots = (res.match(/\./g) || []).length
  if (!res.startsWith("MVSTMP.") || res.length < 33 || dots < 3) {
    console.error(`Error: string returned by tmp_name expected to start with 'MVSTMP.', got ${res}`);
    process.exitCode = -1; return;
  }

  console.log("Test: tmp_name with HLQ of the temp dataset name...");
  res = await zoau.datasets.tmp_name("ABC.DEF.GHI.").catch(console.error);
  var dots = (res.match(/\./g) || []).length
  console.log(`res=${res}`);
  if (!res.startsWith("ABC.DEF.GHI..") || res.length != 39 || dots != 6) {
    console.error(`Error: string returned by tmp_name expected to start with 'ABC.DEF.GHI..', got ${res}`);
    process.exitCode = -1; return;
  }

  console.log("Test: _tmp_name -d...");
  res = await zoau.datasets._tmp_name(null, {"debug":true}).catch(console.error);
  console.log('exit=<' + res["exit"] + '>');
  console.log('stdout=<' + res["stdout"] + '>');
  console.log('stderr=<' + res["stderr"] + '>');
  if (!res["stdout"].trimEnd("\n").startsWith("MVSTMP")) {
    console.error(`Error: string returned by '_tmp_name -d' stdout expected to start with 'MVSTMP.', got ${res["stdout"].trimEnd("\n")}`);
    process.exitCode = -1; return;
  }

  console.log("All tests passed.");
 } catch(err) {
   console.error(err);
   process.exit(-1); //TODO(gabylb) - process still exits with code 0
 }
}

test();
