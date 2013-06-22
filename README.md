connect-cache-manifest
======================

Express/connect middleware to generate HTML5 cache manifest file.
This module is highly inspired by
<https://github.com/dustMason/connect-offline/>.

How to use
----------

    % npm install connect-cache-manifest

In app.js:

    var express = require('express');
    var cacheManifest = require('connect-cache-manifest');
    var app = express();
    app.use(cacheManifest({
      manifestPath: '/application.manifest',
      files: [{
        file: __dirname + '/public/js/foo.js',
        path: '/js/foo.js'
      }, {
        dir: __dirname + '/public/css',
        prefix: '/css/'
      }],
      networks: ['*'],
      fallbacks: []
    }));

Options
-------

* manifestPath: path name for the manifest file.
* files: list of items to cache entries; an item is either `{ dir: '<dir path>', prefix: '<url prefix>'}` or `{ file: '<file path>', path: '<url path>'}`
* networks: list of strings for network entries.
* fallbacks: list of strings for fallback entries.

TODOs
-----

* some more tests
