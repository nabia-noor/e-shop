"use strict";

var express = require("express");

var User = require("../model/user");

var router = express.Router();

var cloudinary = require("cloudinary");

var ErrorHandler = require("../utils/ErrorHandler");

var catchAsyncErrors = require("../middleware/catchAsyncErrors");

var jwt = require("jsonwebtoken");

var sendMail = require("../utils/sendMail");

var sendToken = require("../utils/jwtToken");

var _require = require("../middleware/auth"),
    isAuthenticated = _require.isAuthenticated,
    isAdmin = _require.isAdmin; // create user


router.post("/create-user", catchAsyncErrors(function _callee(req, res, next) {
  var _req$body, name, email, password, avatar, userEmail, myCloud, user, activationToken, activationUrl;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password, avatar = _req$body.avatar;
          _context.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 3:
          userEmail = _context.sent;

          if (!userEmail) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", next(new ErrorHandler("User already exists", 400)));

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(cloudinary.uploader.upload(avatar, {
            folder: "avatars"
          }));

        case 8:
          myCloud = _context.sent;
          user = {
            name: name,
            email: email,
            password: password,
            avatar: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url
            }
          };
          activationToken = createActivationToken(user);
          activationUrl = "http://localhost:3000/activation/".concat(activationToken);
          _context.next = 14;
          return regeneratorRuntime.awrap(sendMail({
            email: user.email,
            subject: "Activate your account",
            message: "Hello ".concat(user.name, ", please activate your account: ").concat(activationUrl)
          }));

        case 14:
          res.status(201).json({
            success: true,
            message: "Please check ".concat(user.email, " to activate your account!")
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  });
})); // activation token creator

var createActivationToken = function createActivationToken(user) {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5"
  });
}; // activate user


router.post("/activation", catchAsyncErrors(function _callee2(req, res, next) {
  var activation_token, newUser, name, email, password, avatar, user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          activation_token = req.body.activation_token;
          newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
          name = newUser.name, email = newUser.email, password = newUser.password, avatar = newUser.avatar;
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 5:
          user = _context2.sent;

          if (!user) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHandler("User already exists", 400)));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(User.create({
            name: name,
            email: email,
            password: password,
            avatar: avatar
          }));

        case 10:
          user = _context2.sent;
          sendToken(user, 201, res);

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  });
})); // login user

router.post("/login-user", catchAsyncErrors(function _callee3(req, res, next) {
  var _req$body2, email, password, user, isPasswordValid;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;

          if (!(!email || !password)) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler("Please provide all fields", 400)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 5:
          user = _context3.sent;

          if (user) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler("User doesn't exist", 400)));

        case 8:
          _context3.next = 10;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 10:
          isPasswordValid = _context3.sent;

          if (isPasswordValid) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler("Invalid credentials", 400)));

        case 13:
          sendToken(user, 201, res);

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  });
})); // get current user

router.get("/getuser", isAuthenticated, catchAsyncErrors(function _callee4(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          user = _context4.sent;

          if (user) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", next(new ErrorHandler("User not found", 400)));

        case 5:
          res.status(200).json({
            success: true,
            user: user
          });

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
})); // logout

router.get("/logout", catchAsyncErrors(function _callee5(req, res, next) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            sameSite: "lax"
          });
          res.status(200).json({
            success: true,
            message: "Logged out successfully"
          });

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  });
})); // update info

router.put("/update-user-info", isAuthenticated, catchAsyncErrors(function _callee6(req, res, next) {
  var _req$body3, email, password, name, phoneNumber, user, isPasswordValid;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password, name = _req$body3.name, phoneNumber = _req$body3.phoneNumber;
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select("+password"));

        case 3:
          user = _context6.sent;
          _context6.next = 6;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 6:
          isPasswordValid = _context6.sent;

          if (isPasswordValid) {
            _context6.next = 9;
            break;
          }

          return _context6.abrupt("return", next(new ErrorHandler("Invalid password", 400)));

        case 9:
          user.name = name;
          user.email = email;
          user.phoneNumber = phoneNumber;
          _context6.next = 14;
          return regeneratorRuntime.awrap(user.save());

        case 14:
          res.status(200).json({
            success: true,
            user: user
          });

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  });
})); // update avatar

router.put("/update-avatar", isAuthenticated, catchAsyncErrors(function _callee7(req, res, next) {
  var existsUser, imageId, myCloud;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          existsUser = _context7.sent;

          if (!(req.body.avatar !== "")) {
            _context7.next = 11;
            break;
          }

          imageId = existsUser.avatar.public_id;
          _context7.next = 7;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.destroy(imageId));

        case 7:
          _context7.next = 9;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150
          }));

        case 9:
          myCloud = _context7.sent;
          existsUser.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
          };

        case 11:
          _context7.next = 13;
          return regeneratorRuntime.awrap(existsUser.save());

        case 13:
          res.status(200).json({
            success: true,
            user: existsUser
          });

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  });
})); // update address

router.put("/update-user-addresses", isAuthenticated, catchAsyncErrors(function _callee8(req, res, next) {
  var user, existsAddress;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          user = _context8.sent;
          existsAddress = user.addresses.find(function (a) {
            return a._id === req.body._id;
          });
          if (existsAddress) Object.assign(existsAddress, req.body);else user.addresses.push(req.body);
          _context8.next = 7;
          return regeneratorRuntime.awrap(user.save());

        case 7:
          res.status(200).json({
            success: true,
            user: user
          });

        case 8:
        case "end":
          return _context8.stop();
      }
    }
  });
})); // delete address

router["delete"]("/delete-user-address/:id", isAuthenticated, catchAsyncErrors(function _callee9(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(User.updateOne({
            _id: req.user._id
          }, {
            $pull: {
              addresses: {
                _id: req.params.id
              }
            }
          }));

        case 2:
          _context9.next = 4;
          return regeneratorRuntime.awrap(User.findById(req.user._id));

        case 4:
          user = _context9.sent;
          res.status(200).json({
            success: true,
            user: user
          });

        case 6:
        case "end":
          return _context9.stop();
      }
    }
  });
})); // update password

router.put("/update-user-password", isAuthenticated, catchAsyncErrors(function _callee10(req, res, next) {
  var user, isPasswordMatched;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select("+password"));

        case 2:
          user = _context10.sent;
          _context10.next = 5;
          return regeneratorRuntime.awrap(user.comparePassword(req.body.oldPassword));

        case 5:
          isPasswordMatched = _context10.sent;

          if (isPasswordMatched) {
            _context10.next = 8;
            break;
          }

          return _context10.abrupt("return", next(new ErrorHandler("Old password is incorrect!", 400)));

        case 8:
          if (!(req.body.newPassword !== req.body.confirmPassword)) {
            _context10.next = 10;
            break;
          }

          return _context10.abrupt("return", next(new ErrorHandler("Passwords do not match!", 400)));

        case 10:
          user.password = req.body.newPassword;
          _context10.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          res.status(200).json({
            success: true,
            message: "Password updated successfully!"
          });

        case 14:
        case "end":
          return _context10.stop();
      }
    }
  });
})); // get user by id

router.get("/user-info/:id", catchAsyncErrors(function _callee11(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          user = _context11.sent;
          res.status(200).json({
            success: true,
            user: user
          });

        case 4:
        case "end":
          return _context11.stop();
      }
    }
  });
})); // admin - get all users

router.get("/admin-all-users", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(function _callee12(req, res, next) {
  var users;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(User.find().sort({
            createdAt: -1
          }));

        case 2:
          users = _context12.sent;
          res.status(200).json({
            success: true,
            users: users
          });

        case 4:
        case "end":
          return _context12.stop();
      }
    }
  });
})); // admin - delete user

router["delete"]("/delete-user/:id", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(function _callee13(req, res, next) {
  var user, imageId;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          user = _context13.sent;

          if (user) {
            _context13.next = 5;
            break;
          }

          return _context13.abrupt("return", next(new ErrorHandler("User not found", 400)));

        case 5:
          imageId = user.avatar.public_id;
          _context13.next = 8;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.destroy(imageId));

        case 8:
          _context13.next = 10;
          return regeneratorRuntime.awrap(User.findByIdAndDelete(req.params.id));

        case 10:
          res.status(200).json({
            success: true,
            message: "User deleted successfully!"
          });

        case 11:
        case "end":
          return _context13.stop();
      }
    }
  });
}));
module.exports = router;