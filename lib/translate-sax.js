(function () {
  "use strict";

  var sax = require("sax")
    , strict = true // set to false for html-mode
    ;

  function translate(istream, events) {
    //var parser = sax.parser(strict)
    var parser = sax.createStream(strict)
      , EventEmitter
      , ostream
      ;

    // Open Tag
    if (events) {
      if (events.onbegintag) { parser.on('opentag', events.onbegintag); }
      parser.on('attribute', events.onattribute);
      parser.on('closetag', events.onclose);
      parser.on('text', events.ontext);
      if (events.onerror) { parser.on('error', events.onerror); }
    } else {
      EventEmitter = require('events').EventEmitter;
      ostream = new EventEmitter();
      parser.on('opentag', function (things) {
        console.log('<:' + JSON.stringify(things.name), JSON.stringify(things.attributes));
        ostream.emit('begintag', things.name);
      });
      parser.on('attribute', function (name, val) {
        ostream.emit('attr', name, val);
      });
      parser.on('closetag', function (name) {
        console.log('</:' + name);
        ostream.emit('endtag', name);
      });
      parser.on('text', function (text) {
        console.log('text:', JSON.stringify(text));
        ostream.emit('text', text);
      });
      parser.on('error', function (err) {
        console.error('Error');
        console.error(err);
        ostream.emit('error', err);
      });
      parser.on('end', function () {
        ostream.emit('end');
      });
    }

    istream.pipe(parser);

    return ostream;
  }

  module.exports = translate;
}());
