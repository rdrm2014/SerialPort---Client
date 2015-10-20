var io = require('socket.io-client');

var socket = io.connect('http://127.0.0.1:8080');
socket.on('connect', function () {
    console.log("socket connected");
});

socket.emit('join', {username: "Subscriber_Publisher", token: "ABCDEFGHIJLMNOPQRSTUVXZ", channelReceive: "Sensor_0", channelSend: "MAC_1_1"});

socket.on('update', function (result) {
    console.log(result);
    if (result.data.MAC != undefined && result.data.sensorID==1 && result.data.type==1) {
        console.log(JSON.stringify(result));
        socket.emit('send', {'MAC':result.data.MAC});
    }
});

socket.on('disconnect', function () {
    socket.leave(socket.type + "_" + socket.sensorN);
    console.log("EXIT");
});
