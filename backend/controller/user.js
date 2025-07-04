const express = require("express");
const User = require("../model/user");
const router = express.Router();
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// create user
router.post(
  "/create-user",
  catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, avatar } = req.body;
    const userEmail = await User.findOne({ email });
    if (userEmail) return next(new ErrorHandler("User already exists", 400));
const myCloud = await cloudinary.uploader.upload(avatar, {
  folder: "avatars",
});

    
    const user = {
      name,
      email,
      password,
      avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
    };

    const activationToken = createActivationToken(user);
    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please activate your account: ${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `Please check ${user.email} to activate your account!`,
    });
  })
);

// activation token creator
const createActivationToken = (user) =>
  jwt.sign(user, process.env.ACTIVATION_SECRET, { expiresIn: "5" });

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;
    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User already exists", 400));

    user = await User.create({ name, email, password, avatar });
    sendToken(user, 201, res);
  })
);

// login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Please provide all fields", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("User doesn't exist", 400));

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return next(new ErrorHandler("Invalid credentials", 400));

    sendToken(user, 201, res);
  })
);

// get current user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorHandler("User not found", 400));
    res.status(200).json({ success: true, user });
  })
);

// logout
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "lax",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  })
);

// update info
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { email, password, name, phoneNumber } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return next(new ErrorHandler("Invalid password", 400));

    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;
    await user.save();

    res.status(200).json({ success: true, user });
  })
);

// update avatar
router.put(
  "/update-avatar",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const existsUser = await User.findById(req.user.id);
    if (req.body.avatar !== "") {
      const imageId = existsUser.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
      });
      existsUser.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    await existsUser.save();
    res.status(200).json({ success: true, user: existsUser });
  })
);

// update address
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const existsAddress = user.addresses.find((a) => a._id === req.body._id);

    if (existsAddress) Object.assign(existsAddress, req.body);
    else user.addresses.push(req.body);

    await user.save();
    res.status(200).json({ success: true, user });
  })
);

// delete address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { addresses: { _id: req.params.id } } }
    );
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  })
);

// update password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched)
      return next(new ErrorHandler("Old password is incorrect!", 400));
    if (req.body.newPassword !== req.body.confirmPassword)
      return next(new ErrorHandler("Passwords do not match!", 400));

    user.password = req.body.newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  })
);

// get user by id
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({ success: true, user });
  })
);

// admin - get all users
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  })
);

// admin - delete user
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found", 400));

    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    await User.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully!" });
  })
);

module.exports = router;
