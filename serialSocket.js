// note, io(<port>) will create a http server for you
var TramasService = require('./TramasService.js');

var sp = require("serialport");

var SerialPort = sp.SerialPort;

var serialPort = {
    portCom: "COM5",
    serialPortOptions: {
        baudrate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false,
        parser: sp.parsers.raw
    }
};

var serialPort = new SerialPort(serialPort.portCom, serialPort.serialPortOptions);

var io = require('socket.io-client');
var socket = io.connect('http://192.168.160.98:8080');
socket.on('connect', function () {
    console.log("socket2 connected");
});

socket.emit('join', {username: "SerialSocket", room: "Sensor_0"});


readSerial(serialPort, socket);

socket.on('disconnect', function () {
    socket.leave(socket.type + "_" + socket.sensorN);
    console.log("EXIT");
});

var newBuffer = new Buffer(56);
function readSerial(serialPort, socket) {
    var fof = new Buffer([0xff, 0x00, 0xff]);
    var off = new Buffer([0x00, 0xff, 0xff]);

    if (serialPort.isOpen()) {
        serialPort.close();
    } else {
        console.log("global.serialPort.isOpen()1: " + serialPort.isOpen());
    }

    serialPort.on("open", function () {
        serialPort.on('data', function (data) {
            //console.log(data);
            newBuffer = Buffer.concat([newBuffer, data]);
        });

        serialPort.on('error', function (err) {
            console.error("error", err);
        });
    });

    //##################################################################################################################

    var paramSave;
    var size;
    var countFor;
    var parserTramas;
    var result = {};

    setInterval(function () {
        for (countFor = 0; countFor < 10; countFor++) {
            //console.log(newBuffer);
            if (newBuffer.length > 4) {
                // FOF
                if (newBuffer.slice(0, 3).equals(fof)) {
                    size = newBuffer.slice(3, 4).readInt8(0, 0);
                    //console.log("\033[31m################# Size: " + size + " #################\033[0m");
                    if (newBuffer.length >= size) {
                        // OFF
                        if (newBuffer.slice(size - 3, size).equals(off)) {

                            parserTramas = TramasService.parse(newBuffer.slice(0, size));

                            //paramSave["TrackSessionConfigurationId"] = 58; // Alterar
                            //paramSave["DataCollectionTime"] = parserTramas.header.ts;
                            //paramSave["sensorN"] = parserTramas.header.sensorN;

                            var listTypes = ["MAC", "MGY", "MCO", "GPS", "TEM"];
                            for (var type in parserTramas.result) {
                                //console.log(type);
                               // console.log(parserTramas.result);
                                //console.log(parserTramas.result[type]);

                                //socket2.broadcast.to(type + '_' + parserTramas.header.sensorID).emit('update', parserTramas.result[type]);

                                result[type] = parserTramas.result[type];
                                result['sensorID'] = parserTramas.header.sensorID;
                                result['type'] = parserTramas.header.type;

                                //console.log(JSON.stringify(result));

                                socket.emit('send', result);
                                result = {};
                            }

                            newBuffer = newBuffer.slice(size, newBuffer.length);
                        } else { // Other
                            console.log("\033[31m################# ERROR: SEM OFF #################\033[0m");
                            newBuffer = newBuffer.slice(1, newBuffer.length);
                            while (!newBuffer.slice(0, 3).equals(fof)) {
                                if (newBuffer.length < 4) {
                                    break;
                                }
                                newBuffer = newBuffer.slice(1, newBuffer.length);
                            }
                        }
                    }
                } else { // Descartar bytes "desconhecidos" sem inicio do FOF
                    console.log("\033[31m################# ERROR: SEM FOF #################\033[0m");
                    while (!newBuffer.slice(0, 3).equals(fof)) {
                        //console.log(newBuffer);
                        if (newBuffer.length < 4) {
                            break;
                        }
                        newBuffer = newBuffer.slice(1, newBuffer.length);
                    }
                }
            }
        }
    }, 100);
}