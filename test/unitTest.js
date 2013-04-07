var assert = require('assert');

process.env.NODE_ENV = 'unit-test';
var theModule = require('../connect-cache-manifest.js');

describe('unit test for cacheManifest', function() {

  it('should get expand directories', function() {
    var expandDirectories = theModule.expandDirectories;

    var files = expandDirectories([{
      dir: './test/public',
      prefix: '/'
    }]);

    assert.equal(files.length, 2);
    assert.ok((files[0].file.match(/\/js\/foo.js$/) && files[1].file.match(/\/js\/bar.js$/)) || (files[1].file.match(/\/js\/foo.js$/) && files[0].file.match(/\/js\/bar.js$/)));
    assert.ok(files[0].path === '/js/foo.js' || files[1].path === '/js/foo.js');
  });

  it('should get last modified time', function(done) {
    var getLastModified = theModule.getLastModified;

    getLastModified([{
      file: __dirname + '/public/js/foo.js',
      path: '/js/foo.js'
    }], function(err, last) {
      assert.ifError(err);
      assert.ok(last > 0);
      done();
    });
  });

  it('should generate a manifest', function() {
    var generateManifest = theModule.generateManifest;

    var manifest = generateManifest({
      manifestPath: '/app.manifest',
      files: [{
        file: __dirname + '/public/js/foo.js',
        path: '/js/foo.js'
      }],
      networks: ['*'],
      fallbacks: []
    }, 999);
    assert.equal(manifest, 'CACHE MANIFEST\n# 999\n\nCACHE:\n/js/foo.js\n\nNETWORK:\n*\n\nFALLBACK:\n');

  });

});
