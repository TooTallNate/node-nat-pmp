
var natpmp = require('../');
var netroute = require('netroute');
var gateway = netroute.getGateway();

var client = new natpmp.Client(gateway);

client.portMapping({ public: 3000, private: 3000 }, function (err, info) {
  if (err) throw err;
  console.log('Port Mapping:', info);
  client.close();
});
