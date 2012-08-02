
var natpmp = require('./');

var client = new natpmp.Client('10.0.1.1');

client.request(0);
/*
client.externalIp(function (err, ip) {
  if (err) throw err;
  console.log('External IP address:', ip);
});
*/
