const { exec } = require('child_process');

function clean_shell_input(str) {
    str= str.replace('"', '\\"')
    return str
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

function parse_universal_arguments(args={}) {
  var ret = "";
  if ("debug" in args && args["debug"])
    ret += "-d ";
  if ("verbose" in args && args["verbose"])
    ret += "-v ";
  if ("options" in args)
    ret += args["options"] + " ";
  return ret;
}

exports.clean_shell_input = clean_shell_input;
exports.call_zoau_library = call_zoau_library;
exports.parse_universal_arguments = parse_universal_arguments;
