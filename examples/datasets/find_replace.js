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
`This is the first line.
This is the second line.
This is the third line.`
  ).then(console.log).catch(errfunc);

  console.log("Test: find_replace");
  var rc = await zoau.datasets.find_replace(DS, "line.", "LINE").catch(errfunc);
  if (rc != 0)
    errfunc(`find_replace returned ${rc}, expected 0`);
  
  console.log("Test: _find_replace -d");
  var res = await zoau.datasets._find_replace(DS, "This is the", "That was", {"debug":true}).catch(errfunc);
  if (res["exit"] !== 0)
    errfunc(`find_replace returned ${res["exit"]}, expected 0`);

  //verify result including debug info
  var json = JSON.parse(res["stdout"]);
  var found = json["found"];
  console.log(`found=${found}`);
  if (found !== 3)
    errfunc(`find_replace found ${found}, expected 3`);
  var changed = json["changed"];
  console.log(`changed=${changed}`);
  if (changed !== 1)
    errfunc(`find_replace 'changed' debug variable is ${changed}, expected 1`);

  console.log("Test: _find_replace -d on a string that doesn't exist");
  var res = await zoau.datasets._find_replace(DS, "This is the", "That was", {"debug":true}).catch(errfunc);
  if (res["exit"] === 0)
    errfunc(`find_replace returned ${res["exit"]}, expected non-0`);
  
  console.log("Test: read to verify");
  res = await zoau.datasets.read(DS).catch(errfunc);
  res = res.split("\n");
  exp = [ "That was first LINE", "That was second LINE", "That was third LINE" ];
  if (!(res.length == exp.length && res.every(function(elem, i) { return elem === exp[i].padEnd(80, ' '); }))) {
    errfunc(`unexpected line in ${DS}: found ${res}, expected ${exp}`);
  }

  console.log("All tests passed.");
 } catch(err) {
   console.error(err);
   process.exit(-1);
 }
}

test();
