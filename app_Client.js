/**
 * Created by ricardomendes on 21/09/15.
 */

var config = require('./config/myConfig.js');

var io = require('socket.io-client');

var socket = io.connect("http://"+config.myconfig.serverWebSocket.ipaddr + ":" + config.myconfig.serverWebSocket.port);

require('./sockets/base')(socket);