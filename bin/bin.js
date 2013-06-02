(function () {
  "use strict";

  var fs = require('fs')
    , Plist = require('../lib/index.js')
    , pathname = process.argv[2]
    , util = require('util')
    ;

  function peek(n) {
    /*jshint validthis:true*/
    var me = this
      ;

    n = n || 0;

    return me[(me.length - 1) + n];
  }

  function run() {
    var plist = Plist.create()
      , keyStack = []
      , valStack = []
      ;

    valStack.peek = peek;
    keyStack.peek = peek;

    plist = plist.parse(fs.createReadStream(pathname));

    // Object cycle
    plist.on('pushObj', function () {
      util.print('{');
    });
    plist.on('pushKey', function (key) {
      util.print('\n"' + key.replace(/"/g, '\\"') + '": ');
    });
    plist.on('assignVal', function (val) {
    });
    plist.on('popKey', function () {
      // awkward
      util.print(',');
    });
    plist.on('popObj', function () {
      util.print('}');
    });

    // Array cycle
    plist.on('pushArray', function () {
      util.print('\n[');
    });
    plist.on('pushIndex', function () {
    });
    plist.on('pushEl', function (el) {
    });
    plist.on('popIndex', function () {
      util.print(',');
    });
    plist.on('popArray', function () {
      util.print(']');
    });

    // any value cycle
    plist.on('pushVal', function (val) {
      valStack.push(val);
    });
    plist.on('popVal', function () {
      valStack.pop();
    });

    // end of stream
    plist.on('end', function () {
      console.log('\n\nFIN');
      console.log(JSON.stringify(valStack[0], null, '  '));
    });
  }

  run();
}());
