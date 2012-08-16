
var natpmp = require('../');
var assert = require('assert');

var client = new natpmp.Client('10.0.1.1');

client.request(17, function (err) {
  assert(err);
  console.log('Got error:', err);
  assert.equal(5, err.code);
  client.close();
});
