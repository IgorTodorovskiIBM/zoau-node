'use strict';

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

 to_dict() {
   return {
     "name": this.name,
     "recfm": this.recfm,
     "lrecl": this.lrecl,
     "dsorg": this.dsorg,
     "volume": this.volume,
     "block_size": this.block_size,
     "last_referenced": this.last_referenced,
     "used_space": this.used_space,
     "total_space": this.total_space
   };
  }

  static from_dict(arr) {
   return new Dataset(arr['name'],
     arr['recfm'],
     arr['lrecl'],
     arr['dsorg'],
     arr['volume'],
     arr['block_size'],
     arr['last_referenced'],
     arr['used_space'],
     arr['total_space']);
  }
}

module.exports = {
  Dataset
};
