var zoau = require('../../lib/zoau.js')

const ID = process.env.USER

async function test() {
  console.log("Test: create 1st dataset");
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(`'${ID}.ZOAU2a'`, "SEQ", details).then(console.log).catch(console.error);

  console.log("Test: write to dataset 2a");
  await zoau.datasets.write(`'${ID}.ZOAU2a'`,
`'This is the first line.
This is the second line.
This is the thrid line.'`
  ).then(console.log).catch(console.error);

  console.log("Test: copy 2a to 2b...");
  await zoau.datasets.copy(`'${ID}.ZOAU2a'`, `'${ID}.ZOAU2b'`).then(console.log).catch(console.error);

  console.log("Test: compare identical datasets...");
  await zoau.datasets._compare(`'${ID}.ZOAU2a'`, `'${ID}.ZOAU2b'`).then(console.log).catch(console.error);

  console.log("Test: write an extra line to 2a...");
  await zoau.datasets.write(`'${ID}.ZOAU2a'`, "'This is the fourth line.'", true).catch(console.error);

  console.log("Test: compare datasets that differ...");
  await zoau.datasets._compare(`'${ID}.ZOAU2a'`, `'${ID}.ZOAU2b'`).then(console.log).catch(console.error);

  console.log("Test: match the 2nd dataset but case some words differently...");
  await zoau.datasets.write(`'${ID}.ZOAU2b'`, "'This IS the FOURTH Line.'", true).catch(console.error);

  console.log("Test: compare datasets that differ only in case, ignore case, should not differ...");
  await zoau.datasets._compare(`'${ID}.ZOAU2a'`, `'${ID}.ZOAU2b'`, {"ignore_case" : true}).then(console.log).catch(console.error);

  console.log("Test: compare datasets that differ only in case, don't ignore case (explicit this time), should differ...");
  var ret = await zoau.datasets._compare(`'${ID}.ZOAU2a'`, `'${ID}.ZOAU2b'`, {"ignore_case" : false}).then(console.log).catch(console.error);

  console.log("Test: compare the columns containing 'This', should not differ...");
  await zoau.datasets._compare(`'${ID}.ZOAU2a'`, `'${ID}.ZOAU2b'`, {"ignore_case" : false, "columns" : "1:4"}).then(console.log).catch(console.error);

  console.log("Test: compare non existent datasets...");
  await zoau.datasets._compare(`'${ID}.ZOAU2c'`, `'${ID}.ZOAU2d'`).then(console.log).catch(console.error);
}

test();
