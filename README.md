connect-cache-manifest
======================

Express/connect middleware to generate HTML5 cache manifest file.
This module is highly inspired by
<https://github.com/dustMason/connect-offline/>.

The original reason I forked as a new project:
<https://github.com/dustMason/connect-offline/issues/1>

How to use
----------

    $ npm install connect-cache-manifest

In app.js:

    var express = require('express');
    var cacheManifest = require('connect-cache-manifest');
    var app = express();
    app.use(cacheManifest({
      manifestPath: '/application.manifest',
      cdn: ['http://yui.yahooapis.com/pure/0.5.0/pure-min.css'],
      files: [{
        file: __dirname + '/public/js/foo.js',
        path: '/js/foo.js'
      }, {
        dir: __dirname + '/public/css',
        prefix: '/css/'
      }, {
        dir: __dirname + '/views',
        prefix: '/html/',
        ignore: function(x) { return /\.bak$/.test(x); },
        replace: function(x) { return x.replace(/\.jade$/, '.html'); }
      }],
      networks: ['*'],
      fallbacks: []
    }));

Options
-------

* manifestPath: path name for the manifest file.
* cdn: list of cdn's you wish you cache in your manifest file
* files: list of items to cache entries; an item is either `{ dir: '<dir path>', prefix: '<url prefix>'}` or `{ file: '<file path>', path: '<url path>'}`
* networks: list of strings for network entries.
* fallbacks: list of strings for fallback entries.


