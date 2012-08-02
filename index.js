
/**
 * Node.js implementation of the NAT Port Mapping Protocol (a.k.a NAT-PMP).
 *
 * References:
 *   http://miniupnp.free.fr/nat-pmp.html
 *   http://wikipedia.org/wiki/NAT_Port_Mapping_Protocol
 *   http://tools.ietf.org/html/draft-cheshire-nat-pmp-03
 */

/**
 * Module dependencies.
 */

var dgram = require('dgram');
var assert = require('assert');
var debug = require('debug')('nat-pmp');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

/**
 * The ports defined in draft-cheshire-nat-pmp-03 to send NAT-PMP requests to.
 */

exports.CLIENT_PORT = 5350;
exports.SERVER_PORT = 5351;

/**
 * The NAT-PMP "Client" class.
 */

function Client (gateway) {
  if (!(this instanceof Client)) {
    return new Client(gateway);
  }
  debug('creating new Client instance for gateway', gateway);
  EventEmitter.call(this);

  this._queue = [];
  this.listening = false;
  this.gateway = gateway;

  this.socket = dgram.createSocket('udp4');
  on('listening', this);
  on('message', this);
  on('close', this);
  on('error', this);
  this.socket.bind(exports.CLIENT_PORT);
}
inherits(Client, EventEmitter);
exports.Client = Client;

/**
 *
 */

Client.prototype.request = function (op, obj) {
  var message = new Buffer(2);

  // Public address request
  message[0] = 0;
  message[1] = 0;

  client.send(message, 0, message.length, exports.SERVER_PORT, gateway, function (err, bytes) {
    if (err) throw err;
  });
};

/**
 * Called for the underlying socket's "listening" event.
 */

Client.prototype.onlistening = function () {
  this.listening = true;
  this._next();
};

/**
 * Called for the underlying socket's "message" event.
 */

Client.prototype.onmessage = function (msg, rinfo) {
  var parsed = {};
  var pos = 0;
  parsed.vers = msg.readUInt8(pos); pos++;
  parsed.OP = msg.readUInt8(pos); pos++;
  parsed.resultCode = msg.readUInt16BE(pos); pos += 2;
  parsed.seconds = msg.readUInt32BE(pos); pos += 4;
  parsed.ip = [];
  parsed.ip.push(msg.readUInt8(pos)); pos++;
  parsed.ip.push(msg.readUInt8(pos)); pos++;
  parsed.ip.push(msg.readUInt8(pos)); pos++;
  parsed.ip.push(msg.readUInt8(pos)); pos++;
  assert.equal(msg.length, pos);

  console.log(rinfo);
  console.log(parsed);
};

Client.prototype.onclose = function () {
  this.listening = false;
};

Client.prototype.onerror = function (err) {
  this.emit('error', err);
};

Client.prototype._next = function () {
  var req = this._queue.shift();
  if (!req) {
    debug('_next: nothing to process');
    return;
  }
};


function on (name, target) {
  target.socket.on(name, function () {
    debug('got socket event', name);
    return target['on' + name].apply(target, arguments);
  });
}
