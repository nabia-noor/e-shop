"use strict";

var express = require("express");

var router = express.Router();

var catchAsyncErrors = require("../middleware/catchAsyncErrors");

var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/process",
  catchAsyncErrors(function _callee(req, res, next) {
    var myPayment;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(
              stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: "inr",
                metadata: {
                  company: "Becodemy",
                },
              })
            );

          case 2:
            myPayment = _context.sent;
            res.status(200).json({
              success: true,
              client_secret: myPayment.client_secret,
            });

          case 4:
          case "end":
            return _context.stop();
        }
      }
    });
  })
);
router.get(
  "/stripeapikey",
  catchAsyncErrors(function _callee2(req, res, next) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            res.status(200).json({
              stripeApikey: process.env.STRIPE_API_KEY,
            });

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    });
  })
);
module.exports = router;
