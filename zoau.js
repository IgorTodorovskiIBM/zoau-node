'use strict';

const { exec } = require('child_process');

class Dataset {
 constructor(name, recfm, lrecl, block_size, dsorg, volume, last_referenced, used_space, total_space) { 
   this.name = name;
   this.recfm = recfm || 0;
   this.lrecl = lrecl || 0;
   this.block_size = block_size || 0;
   this.dsorg = dsorg || 0;
   this.volume = volume || 0;
   this.last_referenced = last_referenced || 0;
   this.used_space = used_space || 0;
   this.total_space = total_space || 0;
 }

 str() {
   return this.name;
 }
}

async function call_zoau_library(exe, params) {
  var exitPromise;
  let promise = new Promise((resolve, reject) => {
     var json = {}
     var child = exec(exe + " " + params, (err, stdout, stderr) => {
        json["stdout"] = stdout;
        json["stderr"] = stderr;
        resolve(json);
      });
      exitPromise = new Promise((resolve, reject) => {
        child.on('exit', code => {
          resolve(code);
        });
      });
  });
  let obj = await promise;
  obj["exit"] = await exitPromise;
  return obj;
}

/*
Returns a listing of the datasets matching the supplied pattern.

Returns
=======
`list` : List of `Dataset` objects, empty list if none found.

Raises
======
ZOAUException
    See message for details

Parameters
==========
`pattern` : str
    Pattern to match. e.g IBMUSER.*

Other Parameters
================
`migrated` : bool
    Display migrated datasets

Notes
=====
Users can call `_listing` for a raw listing function that returns a ZOAUResponse object.
*/
async function listing(pattern, detailed = 0, migrated = 0) {
  let obj = await _listing(pattern, true);
  var list_to_return = [];
  if (obj["exit"] > 1) {
    throw new Error(obj["stderr"]);
  }

  let unparsed_datasets = obj["stdout"].split("\n").filter(word => word != "");
  for (var dataset of unparsed_datasets) {
    let dataset_to_parse = dataset.split(/\s+/);
    //if (dataset_to_parse.length != 9) {
    //}
    list_to_return.push(new Dataset(dataset_to_parse[0], 
     dataset_to_parse[1], dataset_to_parse[2], dataset_to_parse[3],
     dataset_to_parse[4], dataset_to_parse[5], dataset_to_parse[6],
     dataset_to_parse[7], dataset_to_parse[8]));
    
  }
  return list_to_return;
}

async function _listing(pattern, detailed = 0, migrated = 0) {
  pattern = clean_shell_input(pattern);
  var options = ""
  if (migrated)
    options += "-m "

  if (detailed)
    options += "-l -u -s -b "

  options += "\"" + pattern + "\"";
  return call_zoau_library("dls", options);
}

// utilities
function clean_shell_input(str) {
    str= str.replace('"', '\\"')
    return str
}

exports.listing = listing;
