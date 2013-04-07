/*
  Copyright (C) 2013, Daishi Kato <daishi@axlight.com>
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var path = require('path');
var fs = require('fs');
var async = require('async');
var wrench = require('wrench');

function expandDirectories(entries) {
  var cwd = process.cwd();
  var files = [];
  entries.forEach(function(entry) {
    if (entry.file && entry.path) {
      if (entry.file.lastIndexOf(path.sep, 0) !== 0) {
        entry.file = path.join(cwd, entry.file);
      }
      files.push(entry);
    } else if (entry.dir && entry.prefix) {
      if (entry.dir.lastIndexOf(path.sep, 0) !== 0) {
        entry.dir = path.join(cwd, entry.dir);
      }
      wrench.readdirSyncRecursive(entry.dir).forEach(function(name) {
        var file = path.join(entry.dir, name);
        if (fs.statSync(file).isFile()) {
          files.push({
            file: file,
            path: entry.prefix + name
          });
        }
      });
    }
  });
  return files;
}

function getLastModified(files, callback) {
  var lastModified = 0;
  async.each(files, function(x, cb) {
    fs.stat(x.file, function(err, stats) {
      if (err) {
        cb(err);
      } else {
        if (stats.mtime > lastModified) {
          lastModified = stats.mtime;
        }
        cb();
      }
    });
  },

  function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, lastModified);
    }
  });
}

function generateManifest(options, lastModified) {
  var a = [];
  a.push('CACHE MANIFEST');
  a.push('# ' + lastModified);
  a.push('');
  a.push('CACHE:');
  options.files.forEach(function(x) {
    a.push(x.path);
  });
  a.push('');
  a.push('NETWORK:');
  options.networks.forEach(function(x) {
    a.push(x);
  });
  a.push('');
  a.push('FALLBACK:');
  options.fallbacks.forEach(function(x) {
    a.push(x);
  });
  a.push('');

  return a.join('\n');
}

function cacheManifest(options) {
  options = options || [];

  options.manifestPath = options.manifestPath || '/application.manifest';
  options.files = options.files || [{
    dir: 'public',
    prefix: '/'
  }];
  options.networks = options.networks || ['*'];
  options.fallbacks = options.fallbacks || [];

  options.files = expandDirectories(options.files);

  var lastModified = 0;
  var manifest = null;
  var getManifest = function(callback) {
    getLastModified(options.files, function(err, last) {
      if (err) {
        callback(err);
      } else {
        if (last > lastModified) {
          manifest = generateManifest(options, last);
          lastModified = last;
        }
        callback(null, manifest);
      }
    });
  };

  return function(req, res, next) {
    if (req.url === options.manifestPath) {
      getManifest(function(err, result) {
        if (err) {
          console.log('failed to generate manifest');
          next();
        } else {
          res.statusCode = 200;
          res.setHeader('content-type', 'text/cache-manifest');
          res.setHeader('content-length', Buffer.byteLength(result));
          res.end(result);
        }
      });
    } else {
      next();
    }
  };
}

if (process.env.NODE_ENV === 'unit-test') {
  exports.expandDirectories = expandDirectories;
  exports.getLastModified = getLastModified;
  exports.generateManifest = generateManifest;
  exports.cacheManifest = cacheManifest;
} else {
  module.exports = cacheManifest;
}
