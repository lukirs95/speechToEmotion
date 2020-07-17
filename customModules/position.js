const dgram = require("dgram");
const event = require("events");
const Emitter = new event.EventEmitter();

const socket = dgram.createSocket("udp4", (msgbuf, info) => {});

var init = true;
var offset = 0;
var realPosition = 0;
var area = 1;
var areaOld = 1;
var oldRealPosition = 1;
var oscAddress = "";
var positionRangeOffset = 0;

socket.on("message", (msgbuf, info) => {
  let sepMsg = msgbuf.indexOf(",", 0, "ascii");
  let sepPat = msgbuf.indexOf("/", 0, "ascii");
  let path = msgbuf
    .slice(sepPat, msgbuf.indexOf(0x00, sepPat))
    .toString("ascii");
  let msg = msgbuf.slice(sepMsg + 4, msgbuf.length).readFloatBE();
  let position = Math.floor(msg) + positionRangeOffset;
  if (path == oscAddress) {
    //console.log(position);
    if (init) {
      init = false;
      offset = 360 - position;
    }
    position = position + offset;
    if (position >= 360) {
      realPosition = position - 360;
    } else {
      realPosition = position;
    }
    if (realPosition != oldRealPosition) {
      Emitter.emit("change", realPosition);
      oldRealPosition = realPosition;
    }
    area = (0x07 & Math.round(realPosition / 45)) + 1;
    if (area != areaOld) {
      Emitter.emit("area", area);
      areaOld = area;
    }
  }
});

module.exports = {
  position: Emitter,
  area: () => area,
  init: () => {
    init = true;
  },
  listen: (port, address, compassRangeOffset) => {
    oscAddress = address;
    positionRangeOffset = compassRangeOffset;
    socket.bind(port, () =>
      console.log(
        "listen to position via OSC on port: " +
          port +
          " OSC address: " +
          address +
          (compassRangeOffset == 0 ? " {0-360}" : " {-180-180}")
      )
    );
  },
};
