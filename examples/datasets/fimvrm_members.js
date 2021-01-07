// Tests find_member, move_member, delete_members
var zoau = require('../../lib/zoau.js')

const ID = process.env.USER;
const PDS_SRC = 'SYS1.PARMLIB';
const PDS_TGT1 = `${ID}.ZOAU4A.PDS`;
const PDS_TGT2 = `${ID}.ZOAU4B.PDS`;
const MEM_SRC = `'${PDS_SRC}(ADYSET0D)'`;

function errfunc(err) {
  throw new Error(err);
}

async function test() {
 try {
  console.log("Test: checking if required " + PDS_SRC + " exists...");
  var rc = await zoau.datasets.exists(PDS_SRC).catch(console.error);

  if (rc !== true) {
    console.error("This test assumes dataset " + PDS_SRC + " exists.");
    process.exitCode = -1; return;
  }

  console.log("Test: create " + PDS_TGT1 + "...");
  var details = { "primary_space" : 50 };
  await zoau.datasets.create(PDS_TGT1, "PDS", details).then(console.log).catch(console.error);

  console.log("Test: create " + PDS_TGT2 + "...");
  details = { "primary_space" : 50 };
  await zoau.datasets.create(PDS_TGT2, "PDS", details).then(console.log).catch(console.error);

  for (i=1; i<=5; i++) {
    let tgt = (i < 4) ? `'${PDS_TGT1}(MEM${i})'` : `'${PDS_TGT1}(ABCD${i})'`;
    console.log("Test: copy " + MEM_SRC + " to " + tgt + "...");
    await zoau.datasets.copy(MEM_SRC, tgt).catch(errfunc);
  }
  for (i=1; i<=5; i++) {
    let tgt = (i < 4) ? `'${PDS_TGT2}(ME${i})'` : `'${PDS_TGT2}(ABC${i})'`;
    console.log("Test: copy " + MEM_SRC + " to " + tgt + "...");
    await zoau.datasets.copy(MEM_SRC, tgt).catch(errfunc);
  }

  console.log("Test: list_members of " + PDS_TGT1 + "...");
  var res = await zoau.datasets.list_members(PDS_TGT1).catch(errfunc);
  var exp = "ABCD4,ABCD5,MEM1,MEM2,MEM3,";
  if (res.length == exp.length && res.every(function(elem, i) {return elem == exp[i];}))
    errfunc(`Error: unexpected members: found ${res}, expected ${exp}`);

  console.log("Test: list_members of " + PDS_TGT2 + "...");
  res = await zoau.datasets.list_members(PDS_TGT2).catch(errfunc);
  exp = "ABC4,ABC5,ME1,ME2,ME3,";
  if (res.length == exp.length && res.every(function(elem, i) {return elem == exp[i];}))
    errfunc(`Error: unexpected members: found ${res}, expected ${exp}`);

  console.log("Test: find_member MEM1 in " + PDS_TGT1 + "...");
  res = await zoau.datasets.find_member("ABC4", PDS_TGT2).catch(errfunc);
  if (res != PDS_TGT2)
    errfunc(`Error: find_member: ABC4 found in ${res}, expected PDS_TGT2`);

  console.log("Test: find_member MEM1 in " + PDS_TGT1 + " and " + PDS_TGT2 + "...");
  res = await zoau.datasets.find_member("MEM1", `${PDS_TGT1}:${PDS_TGT2}`).catch(errfunc);
  if (res !== PDS_TGT1)
    errfunc(`Error: find_member: MEM2 found in ${res}, expected ${PDS_TGT1}`);

  console.log("Test: find_member MEM2 in " + PDS_TGT2 + " and " + PDS_TGT1 + "...");
  res = await zoau.datasets.find_member("MEM2", `${PDS_TGT2}:${PDS_TGT1}`).catch(errfunc);
  if (res !== PDS_TGT1)
    errfunc(`Error: find_member: MEM2 found in ${res}, expected ${PDS_TGT1}`);

  console.log("Test: move_member (rename) MEM2 in " + PDS_TGT1 + " to MVED5...");
  await zoau.datasets.move_member(PDS_TGT1, "MEM2", "MVED5").catch(errfunc);

  console.log("Test: move_member non-existent MEM222 in " + PDS_TGT1 + " to XY...");
  rc = -1;
  try {
    await zoau.datasets.move_member(PDS_TGT1, "MEM222", "XY");
  } catch(err) {
    console.log(err);
    rc = 0;
  }
  if (rc != 0)
    errfunc("Error: move_member expected to throw but didn't.");

  console.log("Test: move_member non-existent MEM222 in " + PDS_TGT1 + " to XY (use raw API)...");
  res = await zoau.datasets._move_member(PDS_TGT1, "MEM222", "XY").catch(errfunc);
  console.log(`res exit=${res["exit"]}`);
  console.log(`res stdout=${res["stdout"]}`);
  console.log(`res stderr=${res["stderr"]}`);
  if (res["exit"] === 0)
    errfunc(`Error: invalid _move_member returned 'exit' === 0, expected non-0`);

  res = await zoau.datasets.find_member("MVED5", `${PDS_TGT2}:${PDS_TGT1}`).catch(errfunc);
  if (res !== PDS_TGT1)
    errfunc(`Error: find_member failed, MVED5 found in ${res}, expected ${PDS_TGT1}`);

  console.log("Test: list_members of " + PDS_TGT1 + "...");
  res = await zoau.datasets.list_members(PDS_TGT1).catch(errfunc);
  exp = ['ABCD4','ABCD5','MEM1','MEM3','MVED5'];
  if (res.length == exp.length && res.every(function(elem, i) {return elem == exp[i];}))
    errfunc(`Error: unexpected members after move_member: found ${res}, expected ${exp}`);

  console.log("Test: delete_members MEM1, MEM3 in " + PDS_TGT1 + "...");
  await zoau.datasets.delete_members(`${PDS_TGT1}(MEM?)`).catch(errfunc);

  console.log("Test: list_members of " + PDS_TGT1 + "...");
  res = await zoau.datasets.list_members(PDS_TGT1).catch(errfunc);
  exp = ['ABCD4','ABCD5','MVED5'];
  if (res.length == exp.length && res.every(function(elem, i) {return elem == exp[i];}))
    errfunc(`Error: unexpected members after delete_members: found ${res}, expected ${exp}`);

  console.log("All tests passed.");
 } catch(err) {
   console.error(err);
   process.exit(-1); //TODO(gabylb) - process still exits with code 0
 }
}

test();
