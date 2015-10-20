var io = require('socket.io-client');
var socket = io.connect('http://127.0.0.1:8080');
//var socket = io.connect('http://192.168.160.98:8080');

socket.on('connect', function () {
    console.log("socket connected");
});

socket.emit('join', {username: "SerialSocket", token: "ABCDEFGHIJLMNOPQRSTUVXZ", channelSend: "Sensor_0"});

setInterval(function(){
    socket.emit('send', {sensorID: 1, type:1,'MAC':{x:Math.random(),y:Math.random(),z:Math.random()}});
}, 1000);

socket.on('disconnect', function () {
    socket.leave(socket.type + "_" + socket.sensorN);
    console.log("EXIT");
});

