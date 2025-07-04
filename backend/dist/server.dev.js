"use strict";

require("dotenv").config({
  path: "./.env"
});

var app = require("./app");

var connectDatabase = require("./db/Database"); // Handling uncaught  Exception


process.on("uncaughtException", function (err) {
  console.log("Error: ".concat(err.message));
  console.log("shutting down the server for handling uncaught exception");
}); //config

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "backend/config/.env"
  });
} // connect db


connectDatabase(); // create server

var PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log("Server is running on http://localhost:".concat(PORT));
}); // unhandled promise rejection

process.on("unhandledRejection", function (err) {
  console.log("shutting down the server for ".concat(err.message));
  console.log("shutting down the server for unhandle promise rejection");
  server.close(function () {
    process.exit(1);
  });
});