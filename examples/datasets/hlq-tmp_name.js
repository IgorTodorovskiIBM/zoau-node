// Tests find_member, move_member, delete_members
var zoau = require('../../lib/zoau.js')

const ID = process.env.USER;

function errfunc(err) {
  throw new Error(err);
}

async function test() {
 try {
  console.log("Test: hlq...");
  var res = await zoau.datasets.hlq().catch(console.error);
  if (res !== ID) {
    console.error(`Error: hlq returned ${res}, expected ${ID}`);
    process.exitCode = -1; return;
  }
  res = await zoau.datasets.hlq({"debug":true}).catch(console.error);
  if (res !== ID) {
    console.error(`Error: hlq -d returned ${res}, expected ${ID}`);
    process.exitCode = -1; return;
  }
  res = await zoau.datasets._hlq({"debug":true}).catch(console.error);
  console.log('exit=<' + res["exit"] + '>');
  console.log('stdout=<' + res["stdout"] + '>');
  if (res["stdout"].trimEnd("\n") !== ID) {
    console.error(`Error: hlq -d returned ${res["stdout"].trimEnd("\n")}, expected ${ID}`);
    process.exitCode = -1; return;
  }
  console.log('stderr=<' + res["stderr"] + '>');

  console.log("All tests passed.");
 } catch(err) {
   console.error(err);
   process.exit(-1); //TODO(gabylb) - process still exits with code 0
 }
}

test();
