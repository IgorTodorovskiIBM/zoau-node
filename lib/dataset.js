'use strict';

const { exec } = require('child_process');
const { clean_shell_input, call_zoau_library } = require('./util');
const { Dataset } = require('./types');

async function listing(pattern, detailed = 0, migrated = 0) {
  let obj = await _listing(pattern, detailed, migrated);
  var list_to_return = [];
  if (obj["exit"] > 1) {
    throw new Error(obj["stderr"]);
  }

  let unparsed_datasets = obj["stdout"].split("\n").filter(word => word != "");
  for (var dataset of unparsed_datasets) {
    let dataset_to_parse = dataset.split(/\s+/);

    if (dataset_to_parse.length == 1) {
      list_to_return.push(new Dataset(dataset_to_parse[0]));
      continue;
    }

    if (dataset_to_parse.length == 9) {
      list_to_return.push(new Dataset(dataset_to_parse[0], 
        dataset_to_parse[1], dataset_to_parse[2], dataset_to_parse[3],
        dataset_to_parse[4], dataset_to_parse[5], dataset_to_parse[6],
        dataset_to_parse[7], dataset_to_parse[8]));
    } else {
      throw new Error("Unexpected number of elements to parse in dataset");
    }
  }
  return list_to_return;
}

async function _listing(pattern, detailed = 0, migrated = 0) {
  var options = ""
  if (migrated)
    options += "-m "

  if (detailed)
    options += "-l -u -s -b "

  options += "\"" + clean_shell_input(pattern) + "\"";
  return call_zoau_library("dls", options);
}

async function _list_members(pattern) {
  var options = "\"" + clean_shell_input(pattern) + "\"";
  return call_zoau_library("mls", options);
}

async function list_members(pattern) {
  let obj = await _list_members(pattern);

  if (obj["exit"] > 0) {
    throw new Error(obj["stderr"]);
  }

  if (!obj["stdout"]) {
    throw new Error("No members found for pattern " + pattern);
  }

  return obj["stdout"].split();
}

async function exists(dataset) {
  let list_arr = await listing(dataset);
  return list_arr.length > 0
}

module.exports = {
  listing,
  list_members,
  exists
}
