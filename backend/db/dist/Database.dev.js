"use strict";

var mongoose = require("mongoose");

var connectDatabase = function connectDatabase() {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(function (data) {
    console.log("MongoDB connected with server: ".concat(data.connection.host));
  })["catch"](function (err) {
    console.log("DB Connection Failed:", err.message);
  });
};

module.exports = connectDatabase;