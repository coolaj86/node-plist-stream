(function () {
  "use strict";

  var expat = require('node-expat')
    ;

  function translate(istream, events) {
    //var parser = sax.parser(strict)
    var EventEmitter
      , parser = new expat.Parser("UTF-8")
      , ostream
      ;

    function onOpenCb(name, attrs) {
      //console.log('<:' + JSON.stringify(name));
      if (events.onbegintag) {
        events.onbegintag(name);
      }

      Object.keys(attrs).forEach(function (key) {
        if (events.onattr) {
          events.onattr(key, attrs[key]);
        }
      });
    }
    function onOpenEmit(name, attrs) {
      //console.log('<:' + JSON.stringify(name));
      ostream.emit('begintag', name);

      Object.keys(attrs).forEach(function (key) {
        ostream.emit('attr', key, attrs[key]);
      });
    }

    // Open Tag
    if (events) {
      if (events.onbegintag) { parser.on('startElement', onOpenCb); }
      //parser.on('attribute', events.onattribute);
      parser.on('endElement', events.onendtag);
      parser.on('text', events.ontext);
      if (events.onerror) { parser.on('error', events.onerror); }
    } else {
      EventEmitter = require('events').EventEmitter;
      ostream = new EventEmitter();
      parser.on('startElement', onOpenEmit);
      parser.on('attribute', function (name, val) {
        ostream.emit('attr', name, val);
      });
      parser.on('endElement', function (name) {
        //console.log('</:' + name);
        ostream.emit('endtag', name);
      });
      parser.on('text', function (text) {
        //console.log('text:', JSON.stringify(text));
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
