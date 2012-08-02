
var natpmp = require('./');

var client = natpmp.connect('10.0.1.1');

client.externalIp(function (err, ip) {
  if (err) throw err;
  console.log('External IP address:', ip);
});
