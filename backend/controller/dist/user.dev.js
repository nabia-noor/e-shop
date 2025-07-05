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


router.post("/create-user", function _callee(req, res, next) {
  var _req$body, name, email, password, avatar, userEmail, myCloud, user, activationToken, activationUrl;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password, avatar = _req$body.avatar;
          _context.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 4:
          userEmail = _context.sent;

          if (!userEmail) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", next(new ErrorHandler("User already exists", 400)));

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars"
          }));

        case 9:
          myCloud = _context.sent;
          user = {
            name: name,
            email: email,
            password: password,
            avatar: fileUrl
          };
          activationToken = createActivationToken(user);
          activationUrl = "http://localhost:3000/activation/".concat(activationToken);
          _context.prev = 13;
          _context.next = 16;
          return regeneratorRuntime.awrap(sendMail({
            email: user.email,
            subject: "Activate your account",
            message: "Hello ".concat(user.name, ", please click on the link to activate your account: ").concat(activationUrl)
          }));

        case 16:
          res.status(201).json({
            success: true,
            message: "please check your email:- ".concat(user.email, " to activate your account!")
          });
          _context.next = 22;
          break;

        case 19:
          _context.prev = 19;
          _context.t0 = _context["catch"](13);
          return _context.abrupt("return", next(new ErrorHandler(_context.t0.message, 500)));

        case 22:
          _context.next = 27;
          break;

        case 24:
          _context.prev = 24;
          _context.t1 = _context["catch"](0);
          return _context.abrupt("return", next(new ErrorHandler(_context.t1.message, 400)));

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 24], [13, 19]]);
}); // create activation token

var createActivationToken = function createActivationToken(user) {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m"
  });
}; // activate user


router.post("/activation", catchAsyncErrors(function _callee2(req, res, next) {
  var activation_token, newUser, name, email, password, avatar, user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          activation_token = req.body.activation_token;
          newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

          if (newUser) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHandler("Invalid token", 400)));

        case 5:
          name = newUser.name, email = newUser.email, password = newUser.password, avatar = newUser.avatar;
          _context2.next = 8;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 8:
          user = _context2.sent;

          if (!user) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHandler("User already exists", 400)));

        case 11:
          _context2.next = 13;
          return regeneratorRuntime.awrap(User.create({
            name: name,
            email: email,
            avatar: avatar,
            password: password
          }));

        case 13:
          user = _context2.sent;
          sendToken(user, 201, res);
          _context2.next = 20;
          break;

        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", next(new ErrorHandler(_context2.t0.message, 500)));

        case 20:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 17]]);
})); // login user

router.post("/login-user", catchAsyncErrors(function _callee3(req, res, next) {
  var _req$body2, email, password, user, isPasswordValid;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;

          if (!(!email || !password)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler("Please provide the all fields!", 400)));

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 6:
          user = _context3.sent;

          if (user) {
            _context3.next = 9;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler("User doesn't exists!", 400)));

        case 9:
          _context3.next = 11;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 11:
          isPasswordValid = _context3.sent;

          if (isPasswordValid) {
            _context3.next = 14;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler("Please provide the correct information", 400)));

        case 14:
          sendToken(user, 201, res);
          _context3.next = 20;
          break;

        case 17:
          _context3.prev = 17;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", next(new ErrorHandler(_context3.t0.message, 500)));

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 17]]);
})); // load user

router.get("/getuser", isAuthenticated, catchAsyncErrors(function _callee4(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 3:
          user = _context4.sent;

          if (user) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", next(new ErrorHandler("User doesn't exists", 400)));

        case 6:
          res.status(200).json({
            success: true,
            user: user
          });
          _context4.next = 12;
          break;

        case 9:
          _context4.prev = 9;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", next(new ErrorHandler(_context4.t0.message, 500)));

        case 12:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 9]]);
})); // log out user

router.get("/logout", catchAsyncErrors(function _callee5(req, res, next) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            sameSite: "none",
            secure: true
          });
          res.status(201).json({
            success: true,
            message: "Log out successful!"
          });
          _context5.next = 8;
          break;

        case 5:
          _context5.prev = 5;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", next(new ErrorHandler(_context5.t0.message, 500)));

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 5]]);
})); // update user info

router.put("/update-user-info", isAuthenticated, catchAsyncErrors(function _callee6(req, res, next) {
  var _req$body3, email, password, phoneNumber, name, user, isPasswordValid;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password, phoneNumber = _req$body3.phoneNumber, name = _req$body3.name;
          _context6.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 4:
          user = _context6.sent;

          if (user) {
            _context6.next = 7;
            break;
          }

          return _context6.abrupt("return", next(new ErrorHandler("User not found", 400)));

        case 7:
          _context6.next = 9;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 9:
          isPasswordValid = _context6.sent;

          if (isPasswordValid) {
            _context6.next = 12;
            break;
          }

          return _context6.abrupt("return", next(new ErrorHandler("Please provide the correct information", 400)));

        case 12:
          user.name = name;
          user.email = email;
          user.phoneNumber = phoneNumber;
          _context6.next = 17;
          return regeneratorRuntime.awrap(user.save());

        case 17:
          res.status(201).json({
            success: true,
            user: user
          });
          _context6.next = 23;
          break;

        case 20:
          _context6.prev = 20;
          _context6.t0 = _context6["catch"](0);
          return _context6.abrupt("return", next(new ErrorHandler(_context6.t0.message, 500)));

        case 23:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 20]]);
})); // update user avatar

router.put("/update-avatar", isAuthenticated, catchAsyncErrors(function _callee7(req, res, next) {
  var existsUser, imageId, myCloud;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 3:
          existsUser = _context7.sent;

          if (!(req.body.avatar !== "")) {
            _context7.next = 12;
            break;
          }

          imageId = existsUser.avatar.public_id;
          _context7.next = 8;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.destroy(imageId));

        case 8:
          _context7.next = 10;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150
          }));

        case 10:
          myCloud = _context7.sent;
          existsUser.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
          };

        case 12:
          _context7.next = 14;
          return regeneratorRuntime.awrap(existsUser.save());

        case 14:
          res.status(200).json({
            success: true,
            user: existsUser
          });
          _context7.next = 20;
          break;

        case 17:
          _context7.prev = 17;
          _context7.t0 = _context7["catch"](0);
          return _context7.abrupt("return", next(new ErrorHandler(_context7.t0.message, 500)));

        case 20:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 17]]);
})); // update user addresses

router.put("/update-user-addresses", isAuthenticated, catchAsyncErrors(function _callee8(req, res, next) {
  var user, sameTypeAddress, existsAddress;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 3:
          user = _context8.sent;
          sameTypeAddress = user.addresses.find(function (address) {
            return address.addressType === req.body.addressType;
          });

          if (!sameTypeAddress) {
            _context8.next = 7;
            break;
          }

          return _context8.abrupt("return", next(new ErrorHandler("".concat(req.body.addressType, " address already exists"))));

        case 7:
          existsAddress = user.addresses.find(function (address) {
            return address._id === req.body._id;
          });

          if (existsAddress) {
            Object.assign(existsAddress, req.body);
          } else {
            // add the new address to the array
            user.addresses.push(req.body);
          }

          _context8.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          res.status(200).json({
            success: true,
            user: user
          });
          _context8.next = 17;
          break;

        case 14:
          _context8.prev = 14;
          _context8.t0 = _context8["catch"](0);
          return _context8.abrupt("return", next(new ErrorHandler(_context8.t0.message, 500)));

        case 17:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 14]]);
})); // delete user address

router["delete"]("/delete-user-address/:id", isAuthenticated, catchAsyncErrors(function _callee9(req, res, next) {
  var userId, addressId, user;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          userId = req.user._id;
          addressId = req.params.id;
          _context9.next = 5;
          return regeneratorRuntime.awrap(User.updateOne({
            _id: userId
          }, {
            $pull: {
              addresses: {
                _id: addressId
              }
            }
          }));

        case 5:
          _context9.next = 7;
          return regeneratorRuntime.awrap(User.findById(userId));

        case 7:
          user = _context9.sent;
          res.status(200).json({
            success: true,
            user: user
          });
          _context9.next = 14;
          break;

        case 11:
          _context9.prev = 11;
          _context9.t0 = _context9["catch"](0);
          return _context9.abrupt("return", next(new ErrorHandler(_context9.t0.message, 500)));

        case 14:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 11]]);
})); // update user password

router.put("/update-user-password", isAuthenticated, catchAsyncErrors(function _callee10(req, res, next) {
  var user, isPasswordMatched;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select("+password"));

        case 3:
          user = _context10.sent;
          _context10.next = 6;
          return regeneratorRuntime.awrap(user.comparePassword(req.body.oldPassword));

        case 6:
          isPasswordMatched = _context10.sent;

          if (isPasswordMatched) {
            _context10.next = 9;
            break;
          }

          return _context10.abrupt("return", next(new ErrorHandler("Old password is incorrect!", 400)));

        case 9:
          if (!(req.body.newPassword !== req.body.confirmPassword)) {
            _context10.next = 11;
            break;
          }

          return _context10.abrupt("return", next(new ErrorHandler("Password doesn't matched with each other!", 400)));

        case 11:
          user.password = req.body.newPassword;
          _context10.next = 14;
          return regeneratorRuntime.awrap(user.save());

        case 14:
          res.status(200).json({
            success: true,
            message: "Password updated successfully!"
          });
          _context10.next = 20;
          break;

        case 17:
          _context10.prev = 17;
          _context10.t0 = _context10["catch"](0);
          return _context10.abrupt("return", next(new ErrorHandler(_context10.t0.message, 500)));

        case 20:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[0, 17]]);
})); // find user infoormation with the userId

router.get("/user-info/:id", catchAsyncErrors(function _callee11(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _context11.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 3:
          user = _context11.sent;
          res.status(201).json({
            success: true,
            user: user
          });
          _context11.next = 10;
          break;

        case 7:
          _context11.prev = 7;
          _context11.t0 = _context11["catch"](0);
          return _context11.abrupt("return", next(new ErrorHandler(_context11.t0.message, 500)));

        case 10:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[0, 7]]);
})); // all users --- for admin

router.get("/admin-all-users", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(function _callee12(req, res, next) {
  var users;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          _context12.next = 3;
          return regeneratorRuntime.awrap(User.find().sort({
            createdAt: -1
          }));

        case 3:
          users = _context12.sent;
          res.status(201).json({
            success: true,
            users: users
          });
          _context12.next = 10;
          break;

        case 7:
          _context12.prev = 7;
          _context12.t0 = _context12["catch"](0);
          return _context12.abrupt("return", next(new ErrorHandler(_context12.t0.message, 500)));

        case 10:
        case "end":
          return _context12.stop();
      }
    }
  }, null, null, [[0, 7]]);
})); // delete users --- admin

router["delete"]("/delete-user/:id", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(function _callee13(req, res, next) {
  var user, imageId;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          _context13.next = 3;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 3:
          user = _context13.sent;

          if (user) {
            _context13.next = 6;
            break;
          }

          return _context13.abrupt("return", next(new ErrorHandler("User is not available with this id", 400)));

        case 6:
          imageId = user.avatar.public_id;
          _context13.next = 9;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.destroy(imageId));

        case 9:
          _context13.next = 11;
          return regeneratorRuntime.awrap(User.findByIdAndDelete(req.params.id));

        case 11:
          res.status(201).json({
            success: true,
            message: "User deleted successfully!"
          });
          _context13.next = 17;
          break;

        case 14:
          _context13.prev = 14;
          _context13.t0 = _context13["catch"](0);
          return _context13.abrupt("return", next(new ErrorHandler(_context13.t0.message, 500)));

        case 17:
        case "end":
          return _context13.stop();
      }
    }
  }, null, null, [[0, 14]]);
}));
module.exports = router;