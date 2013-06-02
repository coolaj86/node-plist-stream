# plist-stream

A streaming parser for plist files (i.e. iTune's `Library.xml`).

# Desired API

  * Parse partial objects (i.e. metadata keys that preceed large array or object keys)

```javascript
var s = plist.parse(inputstream, ['Tracks.*', 'Playlists.']);

// only literals from the root
s.on('*$', function (key, val) {
});

// any members of any keys named 'Tracks'
s.on('*.Tracks.*', function (key, val) {
  // one track
  console.log(key, val);
});

// any members of any keys named 'Playlist' which are arrays
s.on('*.Playlists[].*', function (val, i) {
  // one playlist
  console.log(val, i);
});
```
