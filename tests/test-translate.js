(function () {
  "use strict";

  var Stream = require('stream')
    //, translate = require('../lib/translate-expat') 
    , translate = require('../lib/translate-sax') 
    ;

  function XmlStream() {
    Stream.Readable.call(this);
  }
  XmlStream.prototype = Object.create(Stream.Readable.prototype, { constructor: { value: XmlStream }});
  XmlStream.prototype._read = function (/*n*/) {
    this.push("<html><head><title>Hello World</title></head><body><p data='foo'>bar</p></body></html>");
    this.push(null);
    return false;
  };
  translate(new XmlStream());
}());
