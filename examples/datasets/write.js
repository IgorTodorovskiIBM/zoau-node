var zoau = require('../../lib/zoau.js')

const ID = process.env.USER

async function test() {
  console.log("Test: create");
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(`'${ID}.ZOAU-1'`, details, "SEQ").then(console.log).catch(console.error);

  console.log("Test: write no append");
  await zoau.datasets.write(`'${ID}.ZOAU-1'`, "'This is a new line.'").then(console.log).catch(console.error);

  console.log("Test: read");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`).then(console.log).catch(console.error);

  console.log("Test: write with apppend");
  await zoau.datasets.write(`'${ID}.ZOAU-1'`, "'This is another new line.'", true).then(console.log).catch(console.error);

  console.log("Test: read");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`).then(console.log).catch(console.error);

  console.log("Test: write no append");
  await zoau.datasets.write(`'${ID}.ZOAU-1'`, "'Only line in dataset.'").then(console.log).catch(console.error);

  console.log("Test: read");
  await zoau.datasets.read(`'${ID}.ZOAU-1'`).then(console.log).catch(console.error);
}

test();
