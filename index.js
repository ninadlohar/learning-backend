const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const http = require("http");
const mongoose = require("mongoose");
const morgan = require("morgan");
const appConfig = require("./app/config/appConfig");

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

const modelsPath = "./app/models";

fs.readdirSync(modelsPath).forEach(function (file) {
  if (~file.indexOf(".js")) require(modelsPath + "/" + file);
});

let routesPath = "./app/routes/";

fs.readdirSync(routesPath).forEach(function (file) {
  if (~file.indexOf(".js")) {
    let route = require(routesPath + file);
    route.setRouter(app);
  }
});

const server = http.createServer(app);
// start listening to http server
server.listen(appConfig.appConfig.port);
server.on("error", onError);
server.on("listening", onListening);

// const socketLib = require("./app/libs/socketLib");
// const socketServer = socketLib.setServer(server);

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      process.exit(1);
      break;
    case "EADDRINUSE":
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  "Listening on " + bind;
  let db = mongoose.connect(appConfig.appConfig.db.uri, { useNewUrlParser: true });

  console.log(`server started on : localhost:${addr.port}`);
}

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // application specific logging, throwing an error, or other logic here
});

mongoose.connection.on("error", function (err) {
  console.log("database connection error");
  console.log(err);
});

mongoose.connection.on("open", function (err) {
  if (err) {
    console.log("database error");
    console.log(err);
  } else {
    console.log("database connection open success");
  }
});

// module.exports = app;
