"use strict";

const fs = require("fs");
const { isIPv4 } = require("net");
const helpText = fs.readFileSync("./customModules/help.txt").toString("ascii");

var oscReceiveIP = "127.0.0.1";
var flushSegment = false;
var webPort = "80";
var oscReceivePort = "8001";
var oscSendPort = "8002";
var compAddress = "/gyrosc/comp";
var compassRangeOffset = 0;

function wrongUsage(flag) {
  console.log(
    `Wrong usage of ${flag}. Type "node app.js -help" for additional information.`
  );
  process.exit(1);
}

module.exports = () => {
  var flags = process.argv;
  for (let i = 2; i < flags.length; i++) {
    if (flags[i] == "help" || flags[i] == "-help" || flags[i] == "--help") {
      console.log(helpText);
      process.exit(0);
    }
    if (flags[i] == "i" || flags[i] == "-i") {
      isIPv4(flags[i + 1])
        ? (oscReceiveIP = flags[i + 1])
        : wrongUsage(flags[i] + " - No IPv4");
    }
    if (flags[i] == "f" || flags[i] == "-f") {
      flushSegment = true;
    }
    if (flags[i] == "p" || flags[i] == "-p") {
      Number(flags[i + 1])
        ? (webPort = flags[i + 1])
        : wrongUsage(flags[i] + " - No Port Number");
    }
    if (flags[i] == "r" || flags[i] == "-r") {
      Number(flags[i + 1])
        ? (oscReceivePort = flags[i + 1])
        : wrongUsage(flags[i] + " - No Port Number");
    }
    if (flags[i] == "s" || flags[i] == "-s") {
      Number(flags[i + 1])
        ? (oscSendPort = flags[i + 1])
        : wrongUsage(flags[i] + " - No Port Number");
    }
    if (flags[i] == "a" || flags[i] == "-a") {
      flags[i + 1].includes("/")
        ? (compAddress = flags[i + 1])
        : wrongUsage(flags[i] + " - No valid OSC Address");
    }
    if (flags[i] == "c" || flags[i] == "-c") {
      compassRangeOffset = 180;
    }
  }

  if (
    webPort == oscReceivePort ||
    webPort == oscSendPort ||
    oscSendPort == oscReceivePort
  ) {
    wrongUsage("Ports - use different ports");
  }

  return {
    oscReceiveIP: oscReceiveIP,
    flushSegment: flushSegment,
    webPort: webPort,
    oscReceivePort: oscReceivePort,
    oscSendPort: oscSendPort,
    compAddress: compAddress,
    compassRangeOffset: compassRangeOffset,
  };
};
