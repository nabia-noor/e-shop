"use strict";

var express = require("express");

var ErrorHandler = require("./middleware/error");

var app = express();

var cookieParser = require("cookie-parser");

var bodyParser = require("body-parser");

var cors = require("cors");

app.use(cors({
  origin: ["https://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/test", function (req, res) {
  res.send("Hello world!");
});
app.use(bodyParser.urlencoded({
  extended: true,
  limit: "50mb"
})); // config

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env"
  });
} // import routes


var user = require("./controller/user");

var shop = require("./controller/shop");

var product = require("./controller/product");

var event = require("./controller/event");

var coupon = require("./controller/coupounCode");

var payment = require("./controller/payment");

var order = require("./controller/order");

var conversation = require("./controller/conversation");

var message = require("./controller/message");

var withdraw = require("./controller/withdraw");

app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw); // it's for ErrorHandling

app.use(ErrorHandler);
module.exports = app;