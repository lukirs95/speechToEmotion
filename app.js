"use strict";
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const OSC = require("osc");
const cors = require("cors");
const path = require("path");

const checkFlags = require("./customModules/checkFlags");
const moodChecker = require("./customModules/parser");
const compass = require("./customModules/position");

const compPos = compass.position;

const startArgs = checkFlags();
const remoteIP = startArgs.oscReceiveIP; // 127.0.0.1
const remotePort = startArgs.oscSendPort; // 8002
const apiPort = startArgs.webPort; // 80
const compassPort = startArgs.oscReceivePort; // 8001;
const oscCompassAddress = startArgs.compAddress;
const compassRangeOffset = startArgs.compassRangeOffset; //0

const oscSender = new OSC.UDPPort({
  localAddress: remoteIP,
  localPort: Number(remotePort) + 1, // 8003
  metadata: true,
});

oscSender.open();

oscSender.on("error", (err) => {
  if (err.code == "EADDRNOTAVAIL") {
  } else console.log(err);
});

compass.listen(compassPort, oscCompassAddress, compassRangeOffset);
compPos.on("change", (position) => {
  oscSender.send(
    {
      address: "/position/degrees",
      args: [{ type: "i", value: 360 - position }],
    },
    remoteIP,
    remotePort
  );
});

compPos.on("area", (area) => {
  if (startArgs.flushSegment) {
    oscSender.send(
      {
        address: "/position/segment",
        args: [{ type: "i", value: area }],
      },
      remoteIP,
      remotePort
    );
  }
});

app.use(bodyparser.json());

app.options("*", cors());

app.post("/recognition", cors(), (req, res, next) => {
  if (req.body.status) {
    oscSender.send(
      {
        address: "/speech/status",
        args: [{ type: "s", value: req.body.status }],
      },
      remoteIP,
      remotePort
    );
  }
  if (req.body.message) {
    let message = req.body.message.toLowerCase();
    let result = moodChecker(message);
    res.status(200).json({ mood: result.mood });
    if (result.mood) {
      oscSender.send(
        {
          timeTag: OSC.timeTag(0),
          packets: [
            {
              address: "/speech/message",
              args: [
                {
                  type: "s",
                  value: result.mood,
                },
              ],
            },
            {
              address: "/speech/addressee",
              args: [
                {
                  type: "s",
                  value: result.addressee,
                },
              ],
            },
            {
              address: "/position/segment",
              args: [
                {
                  type: "i",
                  value: compass.area(),
                },
              ],
            },
          ],
        },
        remoteIP,
        remotePort
      );
    }
  } else {
    res.status(200).json({ status: "sent!" });
  }
});

app.get("/index.html", (req, res, next) => {
  compass.init();
  next();
});

app.get("/:name", (req, res, next) => {
  if (req.params.name.includes(".")) {
    const options = {
      root: path.join(__dirname, "webView"),
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };

    const fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
      err ? next(err) : null;
    });
  } else {
    next();
  }
});

app.get("/", (req, res, next) => {
  res.status(301);
  res.location("/index.html");
  res.end();
});

let Server = app.listen(apiPort, (err) => {
  err
    ? (console.log(err), process.exit())
    : console.log(
        `Server established on Port ${apiPort}, OSC Receiver: ${remoteIP} | Port: ${remotePort}`
      );
  console.log("for additional information type 'node app.js help' ");
});

Server.on("error", (err) => {
  console.log("COULD NOT START SERVER!");
  if (err.code == "EADDRINUSE") {
    console.log(
      "Webport is already in use. Try a different port with flag 'p'"
    );
  } else console.log("Check Port and IP ... Exit Application");
  process.exit(2);
});
