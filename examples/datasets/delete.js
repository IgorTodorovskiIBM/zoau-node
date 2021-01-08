var zoau = require('../../lib/zoau.js')

const ID = process.env.USER;
const DSN1 = `'${ID}.ZOAU3a'`;
const DSN2 = `'${ID}.ZOAU3b'`;
const DSN3 = `'${ID}.ZOAU3c'`;
const DSN4 = `'${ID}.ZOAU3d'`;
const DSN5 = `'${ID}.ZOAU3e'`;

const DSNPATTERN = `'${ID}.ZOAU3*'`;

async function test() {
  console.log(DSNPATTERN);
  console.log("Test: create 5 datasets");
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(DSN1, "SEQ", details).then(console.log).catch(console.error);
  await zoau.datasets.create(DSN2, "SEQ", details).then(console.log).catch(console.error);
  await zoau.datasets.create(DSN3, "SEQ", details).then(console.log).catch(console.error);
  await zoau.datasets.create(DSN4, "SEQ", details).then(console.log).catch(console.error);
  await zoau.datasets.create(DSN5, "SEQ", details).then(console.log).catch(console.error);

  console.log("Test: list created datasets matching ZOAU3* pattern");
  await zoau.datasets.listing(DSNPATTERN, {"detailed" : true}).then(console.log).catch(console.error);
  
  console.log("Test: delete 1st dataset");
  await zoau.datasets.delete(DSN1).then(console.log).catch(console.error);

  console.log("Test: list remaining created datasets");
  await zoau.datasets.listing(DSNPATTERN, {"detailed" : true}).then(console.log).catch(console.error);
  
  console.log("Test: delete remaining 4 datasets matching ZOAU3* pattern");
  await zoau.datasets.delete(DSNPATTERN).then(console.log).catch(console.error);
  
  console.log("Test: empty list of created datasets");
  await zoau.datasets.listing(DSNPATTERN, {"detailed" : true}).then(console.log).catch(console.error);
}

test();
 