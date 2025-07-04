"use strict";

var mongoose = require("mongoose");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your shop name!"]
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address"]
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false
  },
  description: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    "default": "Seller"
  },
  avatar: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  zipCode: {
    type: Number,
    required: true
  },
  withdrawMethod: {
    type: Object
  },
  availableBalance: {
    type: Number,
    "default": 0
  },
  transections: [{
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      "default": "Processing"
    },
    createdAt: {
      type: Date,
      "default": Date.now()
    },
    updatedAt: {
      type: Date
    }
  }],
  createdAt: {
    type: Date,
    "default": Date.now()
  },
  resetPasswordToken: String,
  resetPasswordTime: Date
}); // Hash password

shopSchema.pre("save", function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!this.isModified("password")) {
            next();
          }

          _context.next = 3;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 10));

        case 3:
          this.password = _context.sent;

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}); // jwt token

shopSchema.methods.getJwtToken = function () {
  return jwt.sign({
    id: this._id
  }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES
  });
}; // comapre password


shopSchema.methods.comparePassword = function _callee2(enteredPassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(enteredPassword, this.password));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};

module.exports = mongoose.model("Shop", shopSchema);