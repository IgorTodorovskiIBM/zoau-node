'use strict';

const { exec } = require('child_process');
const { clean_shell_input, call_zoau_library } = require('./util');
const { Dataset } = require('./types');

async function listing(pattern, detailed = 0, migrated = 0) {
  let response = await _listing(pattern, detailed, migrated);
  var list_to_return = [];
  if (response["exit"] > 1) {
    throw new Error(response["stderr"]);
  }

  let unparsed_datasets = response["stdout"].split("\n").filter(word => word != "");
  for (var dataset of unparsed_datasets) {
    let dataset_to_parse = dataset.split(/\s+/);

    if (dataset_to_parse.length == 1) {
      list_to_return.push(new Dataset(dataset_to_parse[0]));
      continue;
    }

    if (dataset_to_parse.length == 9) {
      list_to_return.push(new Dataset(dataset_to_parse[0], 
        dataset_to_parse[3], dataset_to_parse[4], dataset_to_parse[5],
        dataset_to_parse[2], dataset_to_parse[6], dataset_to_parse[1],
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
  let response = await _list_members(pattern);

  if (response["exit"] > 0) {
    throw new Error(response["stderr"]);
  }

  if (!response["stdout"]) {
    throw new Error("No members found for pattern " + pattern);
  }

  return response["stdout"].split("\n");
}

async function exists(dataset) {
  let list_arr = await listing(dataset);
  return list_arr.length > 0
}

async function _read(dataset) {
  var options = ""

  // Read the entire file
  // TODO: add options for reading specific lines, ranges
  options += "-n +1 "

  options += dataset

  return call_zoau_library("dtail", options);
}

async function read(dataset) {
  var response = await _read(dataset)

  if (response["exit"] > 0) {
    throw new Error(response["stderr"]);
  }

  return response["stdout"].trimEnd("\n")
}

async function _copy(source, target) {
  var options = ""

  var source = clean_shell_input(source)
  var target = clean_shell_input(target)

  options += source + " " + target

  return call_zoau_library("dcp", options);
}

async function copy(source, target) {
  var response = await _copy(source, target)
  return response["exit"]
}

async function _move(source, target) {
  var options = ""

  var source = clean_shell_input(source)
  var target = clean_shell_input(target)

  options += source + " " + target

  return call_zoau_library("dmv", options);
}

async function move(source, target) {
  var response = await _move(source, target)
  return response["exit"]
}

async function _create(name, type, info) {
  var options = "-t" + type
  
  if ("primary_space" in info)
    options += ' -s' + info["primary_space"]

  if ("secondary_space" in info)
    options += ' -c' + info["secondary_space"]

  if ("block_size" in info)
    options += ' -B' + info["block_size"]

  if ("record_format" in info)
    options += ' -r' + info["record_format"]

  if ("storage_class_name" in info)
    options += ' -c' + info["storage_class_name"]

  if ("data_class_name" in info)
    options += ' -D' + info["data_class_name"]

  if ("management_class_name" in info)
    options += ' -m' + info["management_class_name"]

  if ("record_length" in info)
    options += ' -l' + info["record_length"]

  if ("key_length" in info && "key_offset" in info)
    options += ' -k' + info["key_length"] + ":" + info["key_offset"];

  if ("directory_blocks" in info)
    options += ' -b' + info["directory_blocks"]

  if ("volumes" in info)
    options += ' -V' + info["volumes"]

  options += " " + name

  return call_zoau_library("dtouch", options);
}

async function create(name, info = {}, type = "pds") {
  var response = await _create(name, type, info)
  if (response["exit"] >= 8) {
    throw new Error(response["stderr"]);
  }

  var dataset = await listing(name, 1);
  return dataset;
}

module.exports = {
  listing,
  list_members,
  exists,
  read,
  create,
  copy,
  move,
  write,
}

async function _write(dataset, content, append=false) {
  dataset = clean_shell_input(dataset)
  content = clean_shell_input(content)

  var options = (append ? "-a " : "") + content + " " + dataset;;

  return call_zoau_library("decho", options);
}

async function write(dataset, content, append=false) {
  var response = await _write(dataset, content, append)

  if (response["exit"] != 0) {
    throw new Error(response["stderr"]);
  }
  return 0;
}

