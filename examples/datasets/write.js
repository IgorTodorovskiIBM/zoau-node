var zoau = require('../../lib/zoau.js')

const ID = process.env.USER

async function test() {
  console.log("Test: create");
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(`'${ID}.ZOAU-1'`, "SEQ", details).then(console.log).catch(console.error);

  console.log("Test: write no append");
  await zoau.datasets.write(`'${ID}.ZOAU-1'`, "'This is the first line.'").then(console.log).catch(console.error);

  console.log("Test: read");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`).then(console.log).catch(console.error);

  console.log("Test: write with apppend and debug");
  var options = { "debug" : true, "verbose" : true };
  var ret = await zoau.datasets._write(`'${ID}.ZOAU-1'`, "'This is the second line.'", true, options).catch(console.error);
  console.log("ret.exit=<" + ret["exit"] + ">");
  console.log("ret.stdout=<" + ret["stdout"] + ">");
  console.log("ret.stderr=<" + ret["stderr"] + ">");

  console.log("Test: write and apppend a 3rd line");
  var ret = await zoau.datasets._write(`'${ID}.ZOAU-1'`, "'This is the third line.'", true).catch(console.error);

  console.log("Test: read all (default)");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`).then(console.log).catch(console.error);

  console.log("Test: read with tail -1");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`, {"tail" : 1}).then(console.log).catch(console.error);

  console.log("Test: read from_line 2");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`, {"from_line" : 2}).then(console.log).catch(console.error);

  console.log("Test: write no append");
  await zoau.datasets.write(`'${ID}.ZOAU-1'`, "'Only line in dataset.'").then(console.log).catch(console.error);

  console.log("Test: read");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`).then(console.log).catch(console.error);
}

test();
