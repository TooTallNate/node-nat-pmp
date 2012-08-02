
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
 * The opcodes for client requests.
 */

exports.OP_EXTERNAL_IP = 0;
exports.OP_MAP_TCP = 1;
exports.OP_MAP_UDP = 2;

/**
 * Map of result codes the gateway sends back when mapping a port.
 */

exports.RESULT_CODES = {
  0: 'Success',
  1: 'Unsupported Version',
  2: 'Not Authorized/Refused (gateway may have NAT-PMP disabled)',
  3: 'Network Failure (gateway may have not obtained a DHCP lease)',
  4: 'Out of Resources (no ports left)',
  5: 'Unsupported opcode'
};

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
 * Queues a UDP request to be send to the gateway device.
 */

Client.prototype.request = function (op, obj, cb) {
  if (typeof obj === 'function') {
    cb = obj;
    obj = null;
  }
  var size;
  switch (op) {
    case 0:
      size = 2;
      break;
    case 1:
    case 2:
      size = 12;
      break;
    default:
      throw new Error('Invalid OP code: ' + op);
  }

  var req = new Buffer(size);

  // Public address request
  req[0] = 0;
  req[1] = 0;

  this.socket.send(req, 0, size, exports.SERVER_PORT, this.gateway, function (err, bytes) {
    if (err) throw err;
  });
};

Client.prototype.externalIp = function (cb) {
  this.request(exports.OP_EXTERNAL_IP, cb);
};

Client.prototype.portMapping = function (opts, cb) {
  var opcode;
  switch (String(opts.type || 'tcp').toLowerCase()) {
    case 'tcp':
      opcode = exports.OP_MAP_TCP;
      break;
    case 'udp':
      opcode = exports.OP_MAP_UDP;
      break;
    default:
      throw new Error('"type" must be either "tcp" or "udp"');
  }
  this.request(opcode)
};

Client.prototype.close = function () {
  this.socket.close();
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

/**
 * Called for the underlying socket's "close" event.
 */

Client.prototype.onclose = function () {
  this.listening = false;
};

/**
 * Called for the underlying socket's "error" event.
 */

Client.prototype.onerror = function (err) {
  this.emit('error', err);
};

/**
 * Processes the next request.
 */

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
