const dataset = require('../../lib/zoau').datasets;
const mvscmd = require('../../lib/zoau').mvscmd;
const DDStatement = require('../../lib/types').DDStatement;
const DataDefinition = require('../../lib/types').DataDefinition;
const FileDefinition = require('../../lib/types').FileDefinition;
const DatasetDefinition = require('../../lib/types').DatasetDefinition;
const assert = require('assert');

const ID = process.env.USER;
var HLQ, ds_a, ds_b, ds_c, ds_opt, ds_outdd, ds_in, ds_out, ds_auth_in1, ds_auth_in2;

function errfunc(err) {
  throw err;
}

async function setUp() {
  HLQ = `${await dataset.hlq()}.ZOAUTEST`;
  await dataset.delete(`${HLQ}.*`, {"force":true});
  ds_a = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_b = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_c = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_opt = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_outdd = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_in = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_out = await dataset.create(await dataset.tmp_name(HLQ), "SEQ");
  ds_auth_in1 = await dataset.create(await dataset.tmp_name(HLQ), "SEQ", {"format": "VB"});
  ds_auth_in2 = await dataset.create(await dataset.tmp_name(HLQ), "SEQ", {"format": "VB"});

  await ds_a.write("TEST");
  await ds_b.write("TEST");
  await ds_c.write("NOTEST");
  await ds_opt.write("   CMPCOLM 1:72");
}

async function test_execute_successful_execution() {
  var dds = [];
  dds.push(new DDStatement("newdd", ds_a.get_name()));
  dds.push(new DDStatement("olddd", ds_b.get_name()));
  dds.push(new DDStatement("sysin", ds_opt.get_name()));
  dds.push(new DDStatement("outdd", ds_outdd.get_name()));
  var rc = await mvscmd.execute("isrsupc", "DELTAL,LINECMP", dds).catch(errfunc);
  console.log(`rc = ${rc}\n`);

  var res = await mvscmd._execute("isrsupc", "DELTAL,LINECMP", dds).catch(errfunc);
  console.log(`res = ${JSON.stringify(res)}\n`);
}

async function test_execute_failed_execution() {
  var dds = [];
  dds.push(new DDStatement("newdd", ds_a.get_name()));
  dds.push(new DDStatement("olddd", ds_c.get_name()));
  dds.push(new DDStatement("sysin", ds_opt.get_name()));
  dds.push(new DDStatement("outdd", ds_outdd.get_name()));
  var pass = false;
  try {
    await mvscmd.execute("isrsupc", "DELTAL,LINECMP", dds);
  } catch(err) {
    var json = JSON.parse(err.message);
    console.log(`res = ${err.message}\n`);
    assert.equal(json["rc"], 1);
    pass = true;
  }
  assert.equal(pass, true);

  var res = await mvscmd._execute("isrsupc", "DELTAL,LINECMP", dds);
  console.log(`res = ${JSON.stringify(res)}\n`);
  assert.equal(res["rc"], 1);
}

async function test_execute_authorized_successful_execution() {
  var dsn = `${ID}.ZOAUTEST.MVSCMD.AUTH.OUT`;
  await dataset.delete(dsn, {"force": true}).catch(errfunc);

  var dds = [];
  dds.push(new DDStatement("sysin", ds_auth_in1.get_name()));
  dds.push(new DDStatement("sysprint", ds_out.get_name()));
  dds.push(new DDStatement("amsdump", "dummy"));
  var res = await mvscmd._execute_authorized("IDCAMS", "", dds).catch(errfunc);
  console.log(`res = ${JSON.stringify(res)}\n`);
  assert.equal(res["rc"], 0);
}

async function test_execute_authorized_new_disposition() {
  await ds_auth_in1.write(` LISTCAT ENTRIES(${ID}.*)`);
  var dsn = `${ID}.ZOAUTEST.MVSCMD.AUTH.OUT`;
  await dataset.delete(dsn, {"force": true}).catch(errfunc);

  dds = [];
  dds.push(new DDStatement("sysin", ds_auth_in1.get_name()));
  dds.push(new DDStatement("sysprint", new DatasetDefinition(dsn, {
                                            "disposition": "NEW",
                                            "primary": 10,
                                            "primary_unit": "TRK",
                                            "secondary": 2,
                                            "secondary_unit": "TRK",
                                            "type": "SEQ"
                                           })));
  dds.push(new DDStatement("asmdump", "dummy"));

  // test also return of raw data (from _function)
  var res = await mvscmd._execute_authorized("IDCAMS", "", dds);
  console.log(`res = ${JSON.stringify(res)}\n`);
  assert.equal(res["rc"], 0); //if no catalog, rc would be 4

  var contents = await dataset.read(dsn);
  console.log(`content of ${dsn}=<\n${contents}\n`);
}

async function test_execute_authorized_new_disposition_delete_input_ds_on_success_or_failure() {
  await ds_auth_in1.write(` LISTCAT ENTRIES(${ID}.*)`);
  var dsn = `${ID}.ZOAUTEST.MVSCMD.AUTH.OUT`;
  await dataset.delete(dsn, {"force": true});
  var dds = [];
  dds.push(new DDStatement("sysin", new DatasetDefinition(ds_auth_in1.name, {"disposition": "SHR", "normal_disposition": "DELETE", "conditional_disposition": "DELETE"})));
  dds.push(new DDStatement("sysprint", new DatasetDefinition(dsn, {"disposition": "NEW", "primary": 10, "primary_unit": "TRK", "secondary": 2, "secondary_unit": "TRK", "type": "SEQ"})));
  dds.push(new DDStatement("asmdump", "dummy"));
  var res = await mvscmd._execute_authorized("IDCAMS", "", dds);
  console.log(`res = ${JSON.stringify(res)}\n`);
  assert.equal(res["rc"], 0); //if no catalog, rc would be 4
  assert.equal(await dataset.exists(ds_auth_in1.name), false);
}

async function test_execute_authorized_output_to_pds_member() {
  var dsn = `${ID}.ZOAUTEST.MVSCMD.AUTH.OUT`;
  await dataset.delete(dsn, {"force": true});
  await dataset.create(dsn, "PDS");
  await ds_auth_in2.write(` LISTCAT ENTRIES(${ID}.*)`);
  var dds = [];
  dds.push(new DDStatement("sysin", new DatasetDefinition(ds_auth_in2.get_name(), {"disposition": "SHR"})));
  dds.push(new DDStatement("sysprint", `${dsn}(MEM1)`));
  dds.push(new DDStatement("asmdump", "dummy"));
  var res = await mvscmd._execute_authorized("IDCAMS", "", dds);
  console.log(`res = ${JSON.stringify(res)}\n`);
  assert.equal(res["rc"], 0); //if no catalog, rc would be 4
  var contents = await dataset.read(`'${dsn}(MEM1)'`);
  assert.equal(contents.includes("THE NUMBER OF ENTRIES PROCESSED WAS"), true);
}

async function test() {
  try {
    await setUp();
    await test_execute_successful_execution();
    await test_execute_failed_execution();
    await test_execute_authorized_successful_execution();
    await test_execute_authorized_new_disposition();
    await test_execute_authorized_new_disposition_delete_input_ds_on_success_or_failure();
    await test_execute_authorized_output_to_pds_member();
    console.log("All tests passed.");
  } catch(err) {
    var json = JSON.parse(err.message);
    console.error(`Failed: ${json["command"]}`);
    console.error(`rc = ${json["rc"]}`);
    console.error(`stderr =  ${json["stderr"]}`);
    console.error(`stdout = ${json["stdout"]}`);
    process.exit(-1);
  }
}

test();
