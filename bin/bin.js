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
      keyStack.push(key);
      util.print('\n' + JSON.stringify(key.toString()) + ': ');
    });
    plist.on('assignVal', function (val) {
      if (!Array.isArray(val) && '{}' !== JSON.stringify(val)) {
        util.print(JSON.stringify(val));
      }
      valStack.peek(-1)[keyStack.peek()] = val;
    });
    plist.on('popKey', function () {
      // awkward ','s
      keyStack.pop();
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
      //keyStack.push(valStack.peek(-1).length);
    });
    plist.on('pushEl', function (el) {
      valStack.peek(-1).push(el);
    });
    plist.on('popIndex', function () {
      //keyStack.pop();
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
