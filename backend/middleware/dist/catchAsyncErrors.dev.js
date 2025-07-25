"use strict";

module.exports = function (theFunc) {
  return function (req, res, next) {
    Promise.resolve(theFunc(req, res, next))["catch"](next);
  };
};

var ErrorHandler = require("../utils/ErrorHandler");