
var natpmp = require('./');

var client = new natpmp.Client('10.0.1.1');

client.externalIp(function (err, ip) {
  if (err) throw err;
  console.log('External IP Address:', ip);
});

client.portMapping({ public: 3000, private: 3000 }, function (err, info) {
  if (err) throw err;
  console.log('Port Mapping:', info);
  client.close();
});
