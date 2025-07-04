"use strict";

var sendToken = function sendToken(user, statusCode, res) {
  var token = user.getJwtToken(); // Dev and production cookie options

  var options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax",
    secure: process.env.NODE_ENV === "PRODUCTION"
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: user,
    token: token
  });
};

module.exports = sendToken;