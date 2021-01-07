'use strict';

const { exec } = require('child_process');
const util = require('./util');
const { Dataset } = require('./types');

async function listing(pattern, args = {}) {
  let response = await _listing(pattern, args);
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

async function _listing(pattern, args = {}) {
  var options = util.parse_universal_arguments(args);
  if ("migrated" in args && args["migrated"])
    options += " -m";

  if ("detailed" in args && args["detailed"])
    options += " -l -u -s -b";

  options += " \"" + util.clean_shell_input(pattern) + "\"";
  return util.call_zoau_library("dls", options);
}

async function _list_members(pattern, args={}) {
  var options = util.parse_universal_arguments(args);
  options += " \"" + util.clean_shell_input(pattern) + "\"";
  return util.call_zoau_library("mls", options);
}

async function list_members(pattern, args={}) {
  let response = await _list_members(pattern, args);

  if (response["exit"] > 0) {
    throw new Error(response["stderr"]);
  }

  if (!response["stdout"]) {
    throw new Error("No members found for pattern " + pattern);
  }

  return response["stdout"].split("\n");
}

async function exists(dataset, args={}) {
  let list_arr = await listing(dataset, args);
  return list_arr.length > 0
}

async function _read(dataset, args={}) {
  var options = util.parse_universal_arguments(args);

  if ("tail" in args)
    options += " -n -" + args["tail"];
  else if ("from_line" in args)
    options += " -n +" + args["from_line"];
  else
    options += " -n +1";

  options += " " + dataset;

  return util.call_zoau_library("dtail", options);
}

async function read(dataset, args={}) {
  var response = await _read(dataset, args)

  if (response["exit"] > 0) {
    throw new Error(response["stderr"]);
  }

  return response["stdout"].trimEnd("\n");
}

async function _copy(source, target, args={}) {
  var source = util.clean_shell_input(source);
  var target = util.clean_shell_input(target);

  var options = util.parse_universal_arguments(args);
  options += " " + source + " " + target;

  return util.call_zoau_library("dcp", options);
}

async function copy(source, target, args={}) {
  var response = await _copy(source, target, args);
  return response["exit"];
}

async function _move(source, target, args={}) {
  var options = util.parse_universal_arguments(args);

  var source = util.clean_shell_input(source);
  var target = util.clean_shell_input(target);

  options += " " + source + " " + target;

  return util.call_zoau_library("dmv", options);
}

async function move(source, target, args={}) {
  var response = await _move(source, target, args);
  return response["exit"];
}

async function _create(name, type, args={}) {
  var options = util.parse_universal_arguments(args);
  options += " -t" + type;
  
  if ("primary_space" in args)
    options += ' -s' + args["primary_space"];

  if ("secondary_space" in args)
    options += ' -c' + args["secondary_space"];

  if ("block_size" in args)
    options += ' -B' + args["block_size"];

  if ("record_format" in args)
    options += ' -r' + args["record_format"];

  if ("storage_class_name" in args)
    options += ' -c' + args["storage_class_name"];

  if ("data_class_name" in args)
    options += ' -D' + args["data_class_name"];

  if ("management_class_name" in args)
    options += ' -m' + args["management_class_name"];

  if ("record_length" in args)
    options += ' -l' + args["record_length"];

  if ("key_length" in args && "key_offset" in args)
    options += ' -k' + args["key_length"] + ":" + args["key_offset"];

  if ("directory_blocks" in args)
    options += ' -b' + args["directory_blocks"];

  if ("volumes" in args)
    options += ' -V' + args["volumes"];

  options += " " + name;

  return util.call_zoau_library("dtouch", options);
}

async function create(name, type="pds", args={}) {
  var response = await _create(name, type, args);
  if (response["exit"] >= 8) {
    throw new Error(response["stderr"]);
  }

  var dataset = await listing(name, {"detailed" : true});
  return dataset;
}

async function _write(dataset, content, append=false, args={}) {
  dataset = util.clean_shell_input(dataset);
  content = util.clean_shell_input(content);

  var options = util.parse_universal_arguments(args);
  options += (append ? "-a " : "") + content + " " + dataset;

  return util.call_zoau_library("decho", options);
}

async function write(dataset, content, append=false, args={}) {
  var response = await _write(dataset, content, append, args)

  if (response["exit"] != 0) {
    throw new Error(response["stderr"]);
  }
  return 0;
}

async function _compare(source, target, args={}) {
  source = util.clean_shell_input(source);
  target = util.clean_shell_input(target);

  var options = util.parse_universal_arguments(args);

  if ("lines" in args && args["lines"])
    options += " -C" + args["lines"];

  if ("columns" in args && args["columns"])
    options += " -c" + args["columns"];

  if ("ignore_case" in args && args["ignore_case"])
    options += " -i";

  options += " \"" + source + "\" \"" + target + "\"";
  return util.call_zoau_library("ddiff", options);
}

async function compare(source, target, args={}) {
  var response = await _compare(source, target, args)

  if (!response["stdout"]) {
    return null;
  }
  return response["stdout"];
}

async function _search(dataset, value, args={}) {
  dataset = util.clean_shell_input(dataset);
  value = util.clean_shell_input(value);

  var options = util.parse_universal_arguments(args);

  if ("lines" in args && args["lines"])
    options += " -C" + args["lines"];

  if ("ignore_case" in args && args["ignore_case"])
    options += " -i";

  if ("display_lines" in args && args["display_lines"])
    options += " -n";

  if ("print_datasets" in args && args["print_datasets"])
    options += " -v";

  options += " \"" + value + "\" \"" + dataset + "\"";
  return util.call_zoau_library("dgrep", options);
}

async function search(dataset, value, args={}) {
  var response = await _search(dataset, value, args)

  if (!response["stdout"]) {
    return null;
  }
  return response["stdout"];
}

async function _delete_members(pattern, args={}) {
  pattern = util.clean_shell_input(pattern);

  var options = util.parse_universal_arguments(args);
  options += ' "' + pattern + '"';

  return util.call_zoau_library("mrm", options);
}

async function delete_members(pattern, args={}) {
  var response = await _delete_members(pattern, args)
  return response["exit"];
}

async function _move_member(dataset, source, target, args={}) {
  var dataset = util.clean_shell_input(dataset);
  var source = util.clean_shell_input(source);
  var target = util.clean_shell_input(target);

  var options = util.parse_universal_arguments(args);
  options += ` "${dataset}" "${source}" "${target}"`;

  return util.call_zoau_library("mmv", options);
}

async function move_member(dataset, source, target, args={}) {
  var response = await _move_member(dataset, source, target, args);

  if (response["exit"] > 0)
    throw new Error(response["stderr"]);
 
  return response["exit"];
}

async function _find_member(member, concatentation, args={}) {
  var member = util.clean_shell_input(member);
  var concatentation = util.clean_shell_input(concatentation);

  var options = util.parse_universal_arguments(args);
  options += ' "' + member+ '" "' + concatentation + '"';

  return util.call_zoau_library("dwhence", options);
}

async function find_member(member, concatentation, args={}) {
  var response = await _find_member(member, concatentation, args={});
  if (!response["stdout"]) {
    return null;
  }
  return response["stdout"].trimEnd("\n");
}

async function _hlq(args={}) {
  var options = util.parse_universal_arguments(args);
  return util.call_zoau_library("hlq", options);
}

async function hlq(args={}) {
  var response = await _hlq(args)
  return response["stdout"].trimEnd("\n");
}

module.exports = {
  listing,
  _listing,
  list_members,
  _list_members,
  exists,
  read,
  _read,
  create,
  _create,
  copy,
  _copy,
  move,
  _move,
  write,
  _write,
  compare,
  _compare,
  search,
  _search,
  delete_members,
  _delete_members,
  move_member,
  _move_member,
  find_member,
  _find_member,
  hlq,
  _hlq,
}
