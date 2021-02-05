'use strict';
const util = require('./util');

async function execute(pgm, pgm_args, dds, args={}) {
  let response = await _execute(pgm, pgm_args, dds, args);
  if (response["rc"] !== 0)
    throw new Error(JSON.stringify(response));
  return 0;
}

async function _execute(pgm, pgm_args, dds, args={}) {
  var options = util.parse_universal_arguments(args);

  options += ` --pgm=${pgm}`;

  if (pgm_args)
    options += ` --args='${pgm_args}'`;

  for (var i=0; i < dds.length; i++)
    options += ` ${dds[i].get_mvscmd_string()}`;

  return util.call_zoau_library("mvscmd", options);
}

async function execute_authorized(pgm, pgm_args, dds, args={}) {
  let response = await _execute_authorized(pgm, pgm_args, dds, args);
  if (response["rc"] !== 0)
    throw new Error(JSON.stringify(response));
  return 0;
}

async function _execute_authorized(pgm, pgm_args, dds, args={}) {
  var options = util.parse_universal_arguments(args);

  options += ` --pgm=${pgm}`;

  if (pgm_args)
    options += ` --args='${pgm_args}'`;

  for (var i=0; i < dds.length; i++)
    options += ` ${dds[i].get_mvscmd_string()}`;

  return util.call_zoau_library("mvscmdauth", options);
}

module.exports = {
  execute,
  _execute,
  execute_authorized,
  _execute_authorized
};
