var zoau = require('../../lib/zoau.js')

const ID = process.env.USER;
const DSN1 = `'${ID}.ZOAU3a'`;
const DSN2 = `'${ID}.ZOAU3b'`;

async function test() {
  console.log("Test: create 1st dataset");
  var details = { "primary_space" : 10  }
  await zoau.datasets.create(DSN1, "SEQ", details).then(console.log).catch(console.error);

  console.log("Test: write to dataset 3");
  await zoau.datasets.write(DSN1,
`'This is the first line.
This is the second line.
This is the thrid line.'`
  ).then(console.log).catch(console.error);

  console.log("Test: search dataset...");
  await zoau.datasets._search(DSN1, "the second").then(console.log).catch(console.error);

  console.log("Test: search dataset - no match due to case...");
  await zoau.datasets._search(DSN1, "the Second").then(console.log).catch(console.error);

  console.log("Test: search dataset - no match due to case but ignore case...");
  await zoau.datasets._search(DSN1, "the Second", {"ignore_case" : true}).then(console.log).catch(console.error);

  console.log("Test: copy " + DSN1 + " to " + DSN2 + "...");
  await zoau.datasets.copy(DSN1, DSN2).then(console.log).catch(console.error);

  console.log("Test: search datasets - specify all options, use search...");
  await zoau.datasets.search(`${ID}.ZOAU3?`, "the Second", {"ignore_case" : true, "display_lines" : true, "lines" : 2, "print_datasets" : true}).then(console.log).catch(console.error);

  console.log("Test: search datasets - specify all options, use _search...");
  await zoau.datasets._search(`${ID}.ZOAU3?`, "the Second", {"ignore_case" : true, "display_lines" : true, "lines" : 2, "print_datasets" : true}).then(console.log).catch(console.error);
}

test();
