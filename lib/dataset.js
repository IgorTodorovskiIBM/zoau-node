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

  return response["stdout"].slice(0, -1).split("\n");
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

  return response["stdout"].slice(0, -1);
}

async function _copy(source, target, args={}) {
  var source = util.clean_shell_input(source);
  var target = util.clean_shell_input(target);

  var options = util.parse_universal_arguments(args);
  options += `${source} ${target}`;

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
  options += (append ? "-a " : "") + `"${content}" "${dataset}"`;

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
  return response["stdout"].slice(0, -1);
}

async function _deletes(dataset, args={}) {
  dataset = util.clean_shell_input(dataset);
  
  var options = util.parse_universal_arguments(args);
  options += " -v \"" + dataset + "\"";
  
  return util.call_zoau_library("drm", options);
}

async function deletes(dataset, args={}) {
  var response = await _deletes(dataset, args);

  if (response["exit"] > 0)
    throw new Error(response["stderr"]);

  return response["exit"];
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
  return response["stdout"].slice(0, -1);
}

async function _hlq(args={}) {
  var options = util.parse_universal_arguments(args);
  return util.call_zoau_library("hlq", options);
}

async function hlq(args={}) {
  var response = await _hlq(args)
  return response["stdout"].slice(0, -1);
}

async function _tmp_name(hlq=null, args={}) {
  var options = util.parse_universal_arguments(args);
  if (hlq)
    options += " " + hlq;

  return util.call_zoau_library("mvstmp", options);
}

async function tmp_name(hlq=null, args={}) {
  var response = await _tmp_name(hlq, args)
  return response["stdout"].slice(0, -1);
}

async function _find_replace(dataset, find, replace, args={}) {
  var options = util.parse_universal_arguments(args);
  options += ` "s/${find}/${replace}/g" ${dataset}`;

  return util.call_zoau_library("dsed", options);
}

async function find_replace(dataset, find, replace, args={}) {
  var response = await _find_replace(dataset, find, replace, args);
  return response["exit"];
}

async function _zip(file, target, args={}) {
  file = util.clean_shell_input(file);
  target = util.clean_shell_input(target);

  var options = util.parse_universal_arguments(args);

  if ("size" in args)
    options += ` -s${args["size"]}`;

  if ("volume" in args && args["volume"])
      options += " -V";

  if ("force" in args && args["force"])
      options += " -f";

  if ("overwrite" in args && args["overwrite"])
      options += " -o";

  if ("dataset" in args && args["dataset"])
      options += " -D";

  if ("exclude" in args)
      options += ` -e"${args['exclude']}"`;

  if ("storage_class_name" in args)
      options += ` -S"${args['storage_class_name']}"`;

  if ("management_class_name" in args)
      options += ` -m"${args['management_class_name']}"`;

  if ("dest_volume" in args)
      options += ` -t"${args['dest_volume']}"`;

  options += ` "${file}" "${target}"`;

  if ("src_volume" in args)
      options += ` "${args['src_volume']}"`;

  return util.call_zoau_library("dzip", options);
}

async function zip(file, target, args={}) {
  var response = await _zip(file, target, args);
  if (response["exit"] > 0)
    throw new Error(`${response["stderr"]},RC=${response["exit"]}`);
  return response["exit"];
}

async function _unzip(file, hlq, args={}) {
  file = util.clean_shell_input(file);
  hlq = util.clean_shell_input(hlq);

  var options = util.parse_universal_arguments(args);

  if ("size" in args)
    options += ` -s${args["size"]}`;

  if ("volume" in args && args["volume"])
      options += " -V";

  if ("dataset" in args && args["dataset"])
      options += " -D";

  if ("overwrite" in args && args["overwrite"])
      options += " -o";

  if ("sms_for_tmp" in args && args["sms_for_tmp"])
      options += " -u";

  if ("include" in args)
      options += ` -i"${args['include']}"`;

  if ("exclude" in args)
      options += ` -e"${args['exclude']}"`;

  if ("storage_class_name" in args)
      options += ` -S"${args['storage_class_name']}"`;

  if ("management_class_name" in args)
      options += ` -m"${args['management_class_name']}"`;

  if ("dest_volume" in args)
      options += ` -t"${args['dest_volume']}"`;

  options += ` -H${hlq} "${file}"`;

  if ("volume" in args)
      options += ` "${args['volume']}"`;
  else if ("src_volume" in args)
      options += ` "${args['src_volume']}"`;

  return util.call_zoau_library("dunzip", options);
}

async function unzip(file, hlq, args={}) {
  var response = await _unzip(file, hlq, args);
  if (response["exit"] > 0)
    throw new Error(`${response["stderr"]},RC=${response["exit"]}`);
  return response["exit"];
}

/* TODO(gabylb): datasets.py defines lineinfile with the following arguments:
(dataset, line, state=true, regex=null, ins_aft=null, ins_bef=null, args={})

Here I moved state, ins_aft and ins_bef to args - since JS doesn't support
named parameters.

Also, in datasets.py, there's no _lineinfile(), and lineinfile() there returns
the response as an object. Here we do that in _lineinfile() to match the other
functions, and lineinfile() return response["exit"] as the others.

For doc on lineinfile, see:
https://docs.ansible.com/ansible/latest/collections/ansible/builtin/lineinfile_module.html
*/

async function _lineinfile(dataset, line, regex=null, args={}) {
  var dataset = util.clean_shell_input(dataset);
  var options = util.parse_universal_arguments(args);

  var state = true, ins_aft = null, ins_bef = null;
  var match_character = "$";

  if ("state" in args) {
    if (typeof args["state"] !== "boolean") {
      throw new Error("lock should be true or false");
    } else {
      state = args["state"];
    }
  }
  if ("ins_aft" in args) {
    var v = args["ins_aft"].toUpperCase();
    if (v === "EOF")
      ins_aft = "EOF";
    else
      ins_aft = args["ins_aft"]; // a regex
  }
  if ("ins_bef" in args) {
    var v = args["ins_bef"].toUpperCase();
    if (v === "BOF")
      ins_bef = "BOF";
    else
      ins_bef = args["ins_bef"]; // a regex
  }

  if ("lock" in args) {
    if (typeof args["lock"] !== "boolean") {
      throw new Error("lock should be true or false");
    }
    if (args["lock"])
      options += " -l";
  }
  if ("encoding" in args)
    options += ` -c ${args["encoding"]}`;

  if ("backref" in args) {
    if (typeof args["backref"] !== "boolean") {
      throw new Error("backref should be true or false");
    }
    if (args["backref"])
      options += " -r";
  }
  if ("first_match" in args && args["first_match"])
    match_character = "1";

  if (state) { 
    if (regex) {
      if (ins_aft) {
        if (ins_aft === "EOF") {
          options += ` -s -e  \"/${regex}/c\\${line}/${match_character}\" -e \"$ a\\${line}\" \"${dataset}\"`;
        } else {
          options += ` -s -e \"/${regex}/c\\${line}/${match_character}\" -e \"/${ins_aft}/a\\${line}/${match_character}\" -e \"$ a\\${line}\" \"${dataset}\"`;
        }
      } else if (ins_bef) {
        if (ins_bef === "BOF") {
          options += ` -s -e \"/${regex}/c\\${line}/${match_character}\" -e \"1 i\\${line}\" \"${dataset}\"`;
        } else {
          options += ` -s -e \"/${regex}/c\\${line}/${match_character}\" -e \"/${ins_bef}/i\\${line}/${match_character}\" -e \"$ a\\${line}\" \"${dataset}\"`;
        }
      } else {
        options += ` \"/${regex}/c\\${line}/${match_character}\" \"${dataset}\"`;
      }
    } else {
      if (ins_aft) {
        if (ins_aft === "EOF") {
          options += ` \"$ a\\${line}\" \"${dataset}\"`;
        } else {
          options += ` -s -e \"/${ins_aft}/a\\${line}/${match_character}\" -e \"$ a\\${line}\" \"${dataset}\"`;
        }
      } else if (ins_bef) {
        if (ins_bef === "BOF") {
          options += ` \"1 i\\${line}\" \"${dataset}\"`;
        } else {
          options += ` -s -e \"/${ins_bef}/i\\${line}/${match_character}\" -e \"$ a\\${line}\" \"${dataset}\"`;
        }
      } else {
        throw new Error("Incorrect parameters");
      }
    }
  } else {
    if (regex) {
      if (line) {
        options += ` -s -e \"/${regex}/d\" -e \"/${line}/d\" \"${dataset}\"`;
      } else {
        options += ` "\"/${regex}/d\" \"${dataset}\"`; 
      }
    } else {
      options += ` \"/${line}/d\" \"${dataset}\"`; 
    }
  }
  return util.call_zoau_library("dsed", options);
}

async function lineinfile(dataset, line, regex=null, args={}) {
  var response = await _lineinfile(dataset, line, regex, args);
  if (response["exit"] > 0)
    throw new Error(`${response["stderr"]},RC=${response["exit"]}`);
  return response["exit"];
}

/* TODO(gabylb): datasets.py defines blockinfile with the following arguments:
(dataset, state=true, args={})

Here I moved state to args and added block - to be consistent with lineinfile
and since JS doesn't support named parameters.

Also, in datasets.py, there's no _blockinfile(), and blockinfile() there returns
the response as an object. Here we do that in _blockinfile() to match the other
functions, and blockinfile() return response["exit"] as the others.
*/

async function _blockinfile(dataset, block=null, args={}) {
  var dataset = util.clean_shell_input(dataset);
  var options = "-b " + util.parse_universal_arguments(args);

  var state = true, ins_aft = null, ins_bef = null;

  if ("state" in args) {
    if (typeof args["state"] !== "boolean")
      throw new Error("lock should be true or false");
    else
      state = args["state"];
  }
  if ("lock" in args) {
    if (typeof args["lock"] !== "boolean")
      throw new Error("lock should be true or false");
    if (args["lock"])
      options += " -l";
  }
  if ("encoding" in args)
    options += ` -c ${args["encoding"]}`;
  if ("marker" in args)
    options += ` -m \"${args["marker"]}\"`;

  if ("ins_aft" in args) {
    var v = args["ins_aft"].toUpperCase();
    if (v === "EOF")
      ins_aft = "EOF";
    else
      ins_aft = args["ins_aft"]; // a regex
  }
  if ("ins_bef" in args) {
    var v = args["ins_bef"].toUpperCase();
    if (v === "BOF")
      ins_bef = "BOF";
    else
      ins_bef = args["ins_bef"]; // a regex
  }

  if (state) { 
    if (!block)
      throw new Error("block is required when state=true");
    if (ins_aft) {
      if (ins_aft === "EOF")
        options += ` \"$ a\\${block}\" \"${dataset}\"`;
      else
        options += ` -s -e \"/${ins_aft}/a\\${block}/$\" -e \"$ a\\${block}\" \"${dataset}\"`;
    } else if (ins_bef) {
      if (ins_bef == "BOF")
        options += ` \"1 i\\${block}\" \"${dataset}\"`;
      else
        options += ` -s -e \"/${ins_bef}/i\\${block}/$\" -e \"$ a\\${block}\" \"${dataset}\"`;
    } else {
      throw new Error("insertafter or insertbefore is required when state=true")
    }
  } else {
    options += ` \"//d\" \"${dataset}\"`;
  }
  return util.call_zoau_library("dmod", options);
}

async function blockinfile(dataset, block=null, args={}) {
  var response = await _blockinfile(dataset, block, args);
  if (response["exit"] > 0)
    throw new Error(`${response["stderr"]},RC=${response["exit"]}`);
  return response["exit"];
}

exports.listing = listing;
exports._listing = _listing;
exports.list_members = list_members;
exports._list_members = _list_members;
exports.exists = exists;
exports.read = read;
exports._read = _read;
exports.create = create;
exports._create = _create;
exports.copy = copy;
exports._copy = _copy;
exports.move = move;
exports._move = _move;
exports.write = write;
exports._write = _write;
exports.compare = compare;
exports._compare = _compare;
exports.search = search;
exports._search = _search;
exports.delete_members = delete_members;
exports._delete_members = _delete_members;
exports.move_member = move_member;
exports._move_member = _move_member;
exports.find_member = find_member;
exports._find_member = _find_member;
exports.hlq = hlq;
exports._hlq = _hlq;
exports.tmp_name = tmp_name;
exports._tmp_name = _tmp_name;
exports.find_replace = find_replace;
exports._find_replace = _find_replace;
exports.zip = zip;
exports._zip = _zip;
exports.unzip = unzip;
exports._unzip = _unzip;
exports.delete = deletes;
exports._delete = _deletes;
exports.lineinfile = lineinfile;
exports._lineinfile = _lineinfile;
exports.blockinfile = blockinfile;
exports._blockinfile = _blockinfile;
