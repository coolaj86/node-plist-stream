(function () {
  "use strict";

  var fs = require('fs')
    , plist = require('../lib/index.js').create()
    , pathname = process.argv[2]
    ;

  plist.parse(fs.createReadStream(pathname));
}());
