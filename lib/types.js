'use strict';

class DDStatement {
  /*
  DDStatement for use with mvscmd.execute and similar functions

  Parameters
  ==========
  `name` : string
      DD name

  `definition`: DatasetDefinition or FileDefinition or string or [DataDefinition]
      Additional arguments and options for DDStatement. For specifying a concatentation of datasets, use [DataDefinition] (array).
  */
  constructor(name, definition) {
    this.name = name;
    this.definition = definition;
  }

  get_mvscmd_string() {
    var dd_string, mvscmd_string = `--${this.name}="`
    if (Array.isArray(this.definition)) {
      console.log("TODO: ARRAY");
      for (var i=0; i<this.definition.length; i++) {
        dd_string = this.definition[i].build_arg_string();
        mvscmd_string += `:${dd_string}`;
      }
    } else if (typeof this.definition === "string" || this.definition instanceof String)
      mvscmd_string += this.definition;
    else
      mvscmd_string += this.definition.build_arg_string();
 
    mvscmd_string += "\"";
    return mvscmd_string;
  }
}

class DataDefinition extends Object {
  constructor(name) {
    super(name);
    this.name = name;
  }

  build_arg_string() {
    return (this.name + this._build_arg_string());
  }

  _append_mvscmd_string(string, variable_name, variable) {
    if (variable === null || variable_name === null
    || (Array.isArray(variable) && variable.length === 0)) {
      return string;
    }
    string += `,${variable_name}=`;
    if (Array.isArray(variable)) {
      var i;
      for (i=0; i<variable.length-1; i++)
        string += `${variable[i]},`;
      string += `${variable[i]}`;
    } else
      string += variable;
 
    return string;
  }
}

class FileDefinition extends DataDefinition {
  /*
  Definition of an HFS file

  Parameters
  ==========
  `path_name` : string
    Full path to the HFS file
  `args` = {
    `normal_disposition` : string
    `abnormal_disposition` : string
    `path_mode` : string
    `status_mode` : string
    `file_data` : string
    `record_length` : string
    `block_size` : string
    `record_format` : string
  }
  */
  constructor(path_name, args={}) {
    super(path_name);

    this.normal_disposition = args["normal_disposition"] || null;
    this.abnormal_disposition = args["abnormal_disposition"] || null;
    this.path_mode = args["path_mode"] || null;
    this.status_group = args["status_group"] || null;
    this.file_data = args["file_data"] || null;
    this.record_length = args["record_length"] || null;
    this.block_size = args["block_size"] || null;
    this.record_format = args["record_format"] || null;
  }

  _build_arg_string() {
    var mvscmd_string;
    mvscmd_string = "";
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "normdisp", this.normal_disposition);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "abnormdisp", this.abnormal_disposition);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "pathmode", this.path_mode);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "statusgroup", this.status_group);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "filedata", this.file_data);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "lrecl", this.record_length);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "blksize", this.block_size);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "recfm", this.record_format);
    return mvscmd_string;
  }
}

class DatasetDefinition extends DataDefinition {
  /*
  Definition of z/OS dataset

  Parameters
  ==========
  `dataset_name` : string
    Name of the dataset
  `args` = {
    `disposition` : string
    `type` : string
    `primary` : string
    `primary_unit` : string
    `secondary` : string
    `secondary_unit` : string
    `normal_disposition` : string
    `abnormal_disposition` : string
    `conditional_disposition` : string
    `block_size` : string
    `record_format` : string
    `storage_class` : string
    `data_class` : string
    `management_class` : string
    `key_length` : string
    `key_offset` : string
    `volumes` : string
    `dataset_key_label` : string
    `key_label1` : string
    `key_encoding1` : string
    `key_label2` : string
    `key_encoding2` : string
  }
  */

  constructor(dataset_name, args={}) {
    super(dataset_name);

    this.disposition = args["disposition"] || "SHR";
    this.type = args["type"] || null;
    this.primary = args["primary"] || null;
    this.primary_unit = args["primary_unit"] || null;
    this.secondary = args["secondary"] || null;
    this.secondary_unit = args["secondary_unit"] || null;
    this.normal_disposition = args["normal_disposition"] || null;
    this.abnormal_disposition = args["abnormal_disposition"] || null;
    this.conditional_disposition = args["conditional_disposition"] || null;
    this.block_size = args["block_size"] || null;
    this.record_format = args["record_format"] || null;
    this.record_length = args["record_length"] || null;
    this.storage_class = args["storage_class"] || null;
    this.data_class = args["data_class"] || null;
    this.management_class = args["management_class"] || null;
    this.key_length = args["key_length"] || null;
    this.key_offset = args["key_offset"] || null;
    this.volumes = args["volumes"] || null;
    this.dataset_key_label = args["dataset_key_label"] || null;
    this.key_label1 = args["key_label1"] || null;
    this.key_encoding1 = args["key_encoding1"] || null;
    this.key_label2 = args["key_label2"] || null;
    this.key_encoding2 = args["key_encoding2"] || null;
  }

  _build_arg_string() {
    var mvscmd_string;
    mvscmd_string = (this.disposition ? `,${this.disposition}` : "");
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "type", this.type);
    if (this.primary) {
      mvscmd_string += `,primary=${this.primary}`;
      if (this.primary_unit)
        mvscmd_string += this.primary_unit;
    }
    if (this.secondary) {
      mvscmd_string += `,secondary=${this.secondary}`;
      if (this.secondary_unit)
        mvscmd_string += this.secondary_unit;
    }
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "normdisp", this.normal_disposition);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "abnormdisp", this.abnormal_disposition);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "blksize", this.block_size);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "recfm", this.record_format);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "lrecl", this.record_length);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "storclas", this.storage_class);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "dataclas", this.data_class);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "mgmtclas", this.management_class);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "keylen", this.key_length);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "keyoffset", this.key_offset);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "volumes", this.volumes);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "dskeylbl", this.dataset_key_label);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "keylab1", this.key_label1);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "keylab2", this.key_label2);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "keycd1", this.key_encoding1);
    mvscmd_string = this._append_mvscmd_string(mvscmd_string, "keycd2", this.key_encoding2);
    return mvscmd_string;
  }
}

module.exports = {
  DDStatement,
  DataDefinition,
  FileDefinition,
  DatasetDefinition
};
