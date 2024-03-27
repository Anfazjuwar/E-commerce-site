const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModels");
const catchAsyncErr = require("./catchAsyncErr");
const jwt = require("jsonwebtoken");

exports.isAuthenticateUser = catchAsyncErr(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Login first to handle this resourse", 404));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    //array values
    if (!roles.includes(req.user.role)) {
      //if the user role is in the array of roles that we pass as arguments
      return next(
        new ErrorHandler(`Role ${req.user.role} is not allowed`, 401)
      );
    }
    next();
  };
};
