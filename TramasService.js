/**
 * TramasService
 *
 * @description :: Server-side logic for managing Tramas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var nmea = require('nmea');
var header, data, ts;
var size;
var result;
module.exports = {
  parse: function (newBuffer) {
    try {
      size = newBuffer.length;
      header = parseHeader(newBuffer.slice(4, 5).readInt8(0, 0));
      data = newBuffer.slice(5, -7);
      ts = newBuffer.slice(size - 7, size - 3);

      /**
      console.log("Header");
      console.log(header);
      console.log("Data");
      console.log(data);
      console.log("TS");
      console.log(convertBase(ts.toString('hex'), 16, 10));
      /**/

      if (header.type == 0) { // GPS
        result = parseGPS(data);
      } else if (header.type == 1) { // Motion
        result = parseMotion(data);
      } else { // Other
        console.log("\033[31m################# OTHER TYPE #################");
        console.log("Size: " + size);
        console.log("Header: " + JSON.stringify(header));
        console.log(newBuffer.slice(0, size));
        console.log("\033[0m");
        return {
          error: true,
          description: "ERROR: OTHER TYPE"
        };
      }

      return {
        header: header,
        ts: convertBase(ts.toString('hex'), 16, 10),
        result: result
      };
    } catch (ex) {
      return {
        error: true,
        description: ex
      };
    }
  }
};

/**
 * Parse do Header da Trama
 * @param POS4
 * @returns {{sensorID: number, r: number, type: number}}
 */
function parseHeader(POS4) {
  var sensorID = POS4 & 0x1F;
  var r = (POS4 >> 5) & 0x01;
  var type = (POS4 >> 6) & 0x03;

  return {sensorID: sensorID, r: r, type: type};
}

/**
 * Parse dos dados de GPS
 * @param data
 */
function parseGPS(data) {
  return {GPS: {gps: nmea.parse("" + data)}};
}

/**
 * Parse dos dados de Motion
 * @param data
 * @param sensorID
 * @param sensorFlags
 * @returns {{}}
 */
function parseMotion(data) {
  var resultSocket;
  var macAux, mgyAux, mcoAux, tem;
  var macX, macY, macZ, mgyX, mgyY, mgyZ, mcoX, mcoY, mcoZ;
  var precision = 2;

  // MAC
  macAux = data.slice(0, 6);
  macX = ((macAux.slice(0, 2).readInt16BE(0, 0) / 2048));
  macY = ((macAux.slice(2, 4).readInt16BE(0, 0) / 2048));
  macZ = ((macAux.slice(4, 6).readInt16BE(0, 0) / 2048));

  // MGY
  mgyAux = data.slice(6, 12);
  mgyX = (mgyAux.slice(0, 2).readInt16BE(0, 0) / 16.4);
  mgyY = (mgyAux.slice(2, 4).readInt16BE(0, 0) / 16.4);
  mgyZ = (mgyAux.slice(4, 6).readInt16BE(0, 0) / 16.4);

  // MCO
  mcoAux = data.slice(12, 18);
  mcoX = (mcoAux.slice(0, 2).readInt16BE(0, 0) / 1.71);
  mcoY = (mcoAux.slice(2, 4).readInt16BE(0, 0) / 1.71);
  mcoZ = (mcoAux.slice(4, 6).readInt16BE(0, 0) / 1.71);

  // TEM
  tem = (data.slice(18, 20).readInt16BE(0, 0) / 333.87 + 21);

  resultSocket = {
    MAC: {
      "x": macX.toFixed(precision),
      "y": macY.toFixed(precision),
      "z": macZ.toFixed(precision)
    },
    MGY: {
      "x": mgyX.toFixed(precision),
      "y": mgyY.toFixed(precision),
      "z": mgyZ.toFixed(precision)
    },
    MCO: {
      "x": mcoX.toFixed(precision),
      "y": mcoY.toFixed(precision),
      "z": mcoZ.toFixed(precision)
    },
    TEM: {
      "tem": tem.toFixed(precision)
    }
  };

  return resultSocket;
}

/**
 * Conversão de base
 * @param num
 * @param baseFrom
 * @param baseTo
 * @returns {string}
 */
function convertBase(num, baseFrom, baseTo) {
  return parseInt(num, baseFrom).toString(baseTo);
}
/*
 //console.log(ConvertBase(ts.toString('hex')).from(32).to(10));
 var ConvertBase = function (num) {
 return {
 from : function (baseFrom) {
 return {
 to : function (baseTo) {
 return parseInt(num, baseFrom).toString(baseTo);
 }
 };
 }
 };
 };
 */
