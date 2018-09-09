/* jslint node: true */
/* jslint esnext: true */
'use strict';

class Runner {
  constructor(name){
    this.name = name;
    this.it = 0;
  }
  *result() {
    while (true)
      yield +new Date();
    // setTimeout(() => {
    //   yield this.name + (+new Date());
    // }, 1e3);

  }
}


let r = new Runner('mark_');

for (let i = 0; i < 1e3; i++)
  console.log( r.result().next().value);
