(function () {
  "use strict";

  var atobWrapper
    , translate
    , EventEmitter = require('events').EventEmitter
    ;

  try {
    translate = require('./translate-expat');
  } catch(e) {
    translate = require('./translate-sax');
  }

  if ('undefined' !== typeof window) {
    atobWrapper = function (str) {
      return decodeURIComponent(window.escape(window.atob(str)));
    };
  } else {
    atobWrapper = function (str) {
      return new Buffer(str, 'base64').toString('utf8');
    };
  }

  function peek(n) {
    /*jshint validthis:true*/
    var me = this
      ;

    n = n || 0;

    return me[(me.length - 1) + n];
  }

  function Plist() {
  }
  Plist.prototype.init = function () {
  };
  Plist.prototype.parse = function (frstream) {
    var rstream
      , emitter = new EventEmitter()
      , hasroot = false
      , tagStack = []
      , keyStack = []
      , valStack = []
      ;

    tagStack.peek = peek;
    keyStack.peek = peek;
    valStack.peek = peek;

    // TODO use node transform
    rstream = translate(frstream);

    // this will only get called when the parent is an array, dict, or nil
    // integers and such cannot have members
    function pushVal(val) {
      // This is the aforementioned nil case
      //if (0 === keyStack.length)
      emitter.emit('pushVal', val);
      valStack.push(val);
      if (!hasroot) {
        hasroot = true;
        return;
      }

      if ('array' === tagStack.peek(-1)) {
        emitter.emit('pushEl', val);
        //keyStack.push(keyStack.pop() + 1); /* eventonly */
        //valStack.peek(-1)[keyStack.peek()] = val; /* eventonly */
        valStack.peek(-1).push(val);
      } else if ('dict' === tagStack.peek(-1)) {
        emitter.emit('assignVal', val);
        valStack.peek(-1)[keyStack.peek()] = val;
      } else {
        throw new Error("can't attach a value to a literal: " + val);
      }

    }

    function onTag(tag) {
      var ltag = tag.toLowerCase()
        ;

      tagStack.push(tag);

      if ('plist' === ltag) {
        return;
      }

      if ('dict' === ltag) {
        emitter.emit('pushObj');
        pushVal({});
      } else if ('array' === ltag) {
        emitter.emit('pushArray');
        pushVal([]);
        //keyStack.push(-1); /* eventonly */
      } else if ('key' === ltag) {
        return;

      // All literals are handled when text
      } else if ('string' === ltag) {
        return;
      } else if ('integer' === ltag) {
        return;
      } else if ('real' === ltag) {
        return;
      } else if ('data' === ltag) {
        return;
      } else if ('date' === ltag) {
        return;

      // Except true and false, they are what the are
      } else if ('true' === ltag) {
        pushVal(true);
        return;
      } else if ('false' === ltag) {
        pushVal(false);
        return;
      }
    }

    function onText(text) {
      var ltag = tagStack.peek().toLowerCase()
        , val
        ;

      // meta types
      if ('key' === ltag) {
        emitter.emit('pushKey', text);
        keyStack.push(text);
        return;
      } else if ('' === text.trim()) {
        return;
      }
      
      // object types
      if ('dict' === ltag) {
        throw new Error("'dict' can't have non-empty text before a key");
      } else if ('array' === ltag) {
        throw new Error("'array' can't have non-empty text before a key");
      }
      
      // literal types
      if ('string' === ltag) {
        val = text;
      } else if ('integer' === ltag) {
        val = Number(text);
      } else if ('real' === ltag) {
        val = Number(text);
      } else if ('data' === ltag) {
        // base64
        val = atobWrapper(text);
      } else if ('date' === ltag) {
        // ISO formatted
        val = new Date(text);
      } else if ('true' === ltag) {
        throw new Error("'true' can't have text at all");
      } else if ('false' === ltag) {
        throw new Error("'false' can't have text at all");
      }

      pushVal(val);
    }

    function onEndTag(name) {
      var tagname = tagStack.pop()
        ;

      if (name !== tagname) {
        throw new Error('bad accounting');
      }

      if ('plist' === tagStack.peek()) {
        return;
      }

      if ('dict' === tagname) {
        emitter.emit('popObj');
      }
      
      if ('array' === tagname) {
        emitter.emit('popIndex');
        //keyStack.pop(); /* eventonly */
      }

      // the key has already been handled
      if ('key' !== tagname && ('dict' === tagStack.peek())) {
        emitter.emit('popVal');
        valStack.pop();
        emitter.emit('popKey');
        keyStack.pop();
      } else if ('array' === tagStack.peek()) {
        emitter.emit('popArray');
        emitter.emit('popVal');
        valStack.pop();
      }
    }

    rstream.on('begintag', onTag);
    rstream.on('endtag', onEndTag);
    rstream.on('text', onText);
    rstream.on('attribute', function (attr, val) {
      //if (keyStack.length > 1)
      if (hasroot) {
        throw new Error('attributes are not allowed', attr, val);
      }
    });
    rstream.on('end', function () {
      emitter.emit('end');
      console.log(JSON.stringify(valStack[0], null, '  '));
    });

    return emitter;
  };
  Plist.create = function (a, b, c) {
    return new Plist(a, b, c);
  };

  module.exports = Plist;
}());
