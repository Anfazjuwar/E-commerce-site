const catchAsyncError = require("../middlewares/catchAsyncErr");
const User = require("../models/userModels");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");
const crypto = require("crypto");

//register user /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  let avatar;

  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }
  if (req.file) {
    avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
  }
  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });
  sendToken(user, 201, res);
});

//login user /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  //finding the user database

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("InValid Email OR password", 401));
  }
  if (!(await user.isValidPassword(password))) {
    return next(new ErrorHandler("InValid Email OR passworddd", 401));
  }

  sendToken(user, 201, res);
});

//logout user /api/v1/logout
exports.logoutUser = (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httponly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "loggedOut",
    });
};

//frogot password /api/v1//Password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user is not founde with this email", 404));
  }

  const resetToken = user.getresetToken();
  await user.save({ validateBeforeSave: false });

  let BASE_URL = process.env.FRONT_END_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }

  //create reset url

  const restUrl = `${BASE_URL}/password/reset/${resetToken}`;

  const message = `Your password reset url is as follows \n\n ${restUrl}\n\n If you have to requested this email, then ingore it `;

  try {
    sendEmail({
      email: user.email,
      subject: "JVLcart Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPassswordToken = undefined;
    user.resetPassswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message), 500);
  }
});

//restpassword /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPassswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPassswordToken,
    resetPassswordTokenExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new ErrorHandler("Password rest token is inavalid or expired"));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match"));
  }

  user.password = req.body.password;
  user.resetPassswordToken = undefined;
  user.resetPassswordTokenExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendToken(user, 201, res);
});

//Get User Profile /myProfile

exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

//Change Password /api/v1/password/change

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  //Check the current password
  if (!(await user.isValidPassword(req.body.oldPassword))) {
    return next(new ErrorHandler("old password is incorrect", 401));
  }
  //assinig password
  user.password = req.body.password;
  await user.save();

  res.status(200).json({
    success: true,
  });
});

//update profile

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  let newUserDate = {
    name: req.body.name,
    email: req.body.email,
  };
  let avatar;
  if (req.file) {
    avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`;
    newUserDate = { ...newUserDate, avatar };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserDate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Admin: GET All USERS /api/v1//admin/users

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//Admin : get specfic user /admin/users/:id

exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(` user not found with that id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Admin : upadate user
exports.updateuser = catchAsyncError(async (req, res, next) => {
  const newUserDate = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserDate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//delete User
exports.deletUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(` user not found with that id ${req.params.id}`, 404)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
  });
});
