/**
 * Created by ricardomendes on 21/09/15.
 */
module.exports = function (socket) {
    socket.on('connect', function () {
        console.log("socket connected");
    });

    socket.emit('join', {username: "Consummer1", token: "ABCDEFGHIJLMNOPQRSTUVXZ", channelReceive: "MAC_1_1"});


    socket.on('update', function (result) {
        console.log("\033[32m" + result.username + "\033[31m" + JSON.stringify(result.data) + "\033[0m");
    });

    /*setInterval(function(){
        socket.emit('send', {'MAC':{x:Math.random(),y:Math.random(),z:Math.random()}});
    }, 1000);*/
};