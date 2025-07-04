const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  // Dev and production cookie options
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax",
    secure: process.env.NODE_ENV === "PRODUCTION",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
