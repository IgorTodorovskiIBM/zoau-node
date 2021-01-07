// Tests find_member, move_member, delete_members
var zoau = require('../../lib/zoau.js')

const ID = process.env.USER;
const DS = `${ID}.ZOAU5.SEQ`;

function errfunc(err) {
  throw new Error(err);
}

async function test() {
 try {
  console.log(`Test: create ${DS}`);
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(DS, "SEQ", details).then(console.log).catch(errfunc);

  console.log(`Test: write to ${DS}`);
  await zoau.datasets.write(DS,
`'This is the first line.
This is the second line.
This is the thrid line.'`
  ).then(console.log).catch(console.error);

  console.log("Test: find_replace");
  var rc = await zoau.datasets.find_replace(DS, "'line.'", "'LINE'").catch(errfunc);
  if (rc != 0)
    errfunc(`Error: find_replace returned ${rc}, expected 0`);
  
  console.log("Test: _find_replace -d");
  var res = await zoau.datasets._find_replace(DS, "'This is the'", "'That was'", {"debug":true}).catch(errfunc);
  console.log('exit=<' + res["exit"] + '>');
  console.log('stdout=<' + res["stdout"] + '>');
  console.log('stderr=<' + res["stderr"] + '>');
  if (res["exit"] !== 0)
    errfunc(`Error: find_replace returned ${res["exit"]}, expected non-0`);
  //TODO(gabylb) - this is temp, shouldn't rely on debug info
  var json = JSON.parse(res["stdout"]);
  var found = json["found"];
  console.log(`found=${found}`);
  if (found !== 3)
    errfunc(`Error: find_replace found ${found}, expected 3`);
  var changed = json["changed"];
  console.log(`changed=${changed}`);
  if (changed !== 1)
    errfunc(`Error: find_replace 'changed' debug variable is ${changed}, expected 1`);
  
  console.log("Test: read");
  await zoau.datasets.read(DS).then(console.log).catch(console.error);

  console.log("Test: _find_replace -d on a string that doesn't exist");
  var res = await zoau.datasets._find_replace(DS, "'This is the'", "'That was'", {"debug":true}).catch(errfunc);
  console.log('exit=<' + res["exit"] + '>');
  console.log('stdout=<' + res["stdout"] + '>');
  console.log('stderr=<' + res["stderr"] + '>');
  if (res["exit"] === 0)
    errfunc(`Error: find_replace returned ${res["exit"]}, expected non-0`);
  
  console.log("Test: read");
  await zoau.datasets.read(DS).then(console.log).catch(console.error);

  console.log("All tests passed.");
 } catch(err) {
   console.error(err);
   process.exit(-1); //TODO(gabylb) - process still exits with code 0
 }
}

test();
