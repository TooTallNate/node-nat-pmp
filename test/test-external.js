
var natpmp = require('../');

var client = new natpmp.Client('10.0.1.1');

client.externalIp(function (err, info) {
  if (err) throw err;
  console.log('External IP Address:', info.ip.join('.'));
  client.close();
});
