(function () {
  "use strict";

  var plist = require('plist')
    , fs = require('fs')
    , pathname = process.argv[2]
    ;

  function run() {
    var chunks = []
      , rs
      ;

    console.log('reading', Date.now());
    rs = fs.createReadStream(pathname, { encoding: 'utf8' });

    rs.on('data', function (chunk) {
      chunks.push(chunk);
    });

    rs.on('end', function () {
      var data
        ;

      console.log('joining', chunks.length, Date.now());
      console.log(chunks[0]);
      data = chunks.join('');

      console.log('parsing', Date.now());
      plist.parseStringSync(chunks.join(''));

      console.log('done', Date.now());
    });
  }

  run();
}());
