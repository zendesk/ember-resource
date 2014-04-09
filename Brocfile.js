module.exports = function(broccoli) {
  var concatenate = require('broccoli-concat'),
      uglify = require('broccoli-uglify-js'),
      mergeTrees = require('broccoli-merge-trees');

  var sourceTree = 'src';

  var concatenated = concatenate(sourceTree, {
    inputFiles: [
      'vendor/lru.js',
      'base.js',
      'remote_expiry.js',
      'identity_map.js',
      'fetch.js',
      'ember-resource.js',
      'debug_adapter.js'
    ],
    outputFile: '/ember-resource.js'
  });

  var minified = uglify(concatenated, {
    targetExtension: 'min.js'
  });

  return mergeTrees([concatenated, minified]);
};
