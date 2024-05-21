const userSchema = require("../model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../Middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");

const login = catchAsyncErrors(async (req, res, next) => {
  const { UsernameOrEmail, password, role } = req.body;

  if (!UsernameOrEmail || !password) {
    return next(
      new ErrorHandler("please enter email or username and password", 400)
    );
  }

  const isEmail = UsernameOrEmail.includes("@");

  let user;

  if (isEmail) {
    user = await userSchema.findOne({ email: UsernameOrEmail, role });
  } else {
    user = await userSchema.findOne({ username: UsernameOrEmail, role });
  }
  if (!user) {
    return next(new ErrorHandler("invalid credentials", 401));
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return next(new ErrorHandler("invalid credentials", 401));
  }

  sendToken(user, 200, res);
});

const userInsert = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      username,
      age,
      dateOfBirth,
      phoneNumber,
      email,
      confirmPassword,
      password,
    } = req.body;
    const userData = new userSchema({
      username: username,
      age: age,
      email: email,
      dateOfBirth: dateOfBirth,
      phoneNumber: phoneNumber,
      password: password,
    });
    const uname = await userSchema.find({ username: username });
    if (uname.length > 0) {
      return next(
        new ErrorHandler("Username already exists in the database", 409)
      );
    }

    const uemail = await userSchema.find({ email: email });
    if (uemail.length > 0) {
      return next(
        new ErrorHandler("Email already exists in the database", 409)
      );
    }

    const storeUser = await userData.save();
    storeUser.password = undefined;

    res.status(201).json({ success: true, storeUser });
  } catch (err) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

const forgetPassword = async (req, res, next) => {
  try {
    const foundUser = await userSchema.findOne({ email: req.body.email });

    if (!foundUser) {
      return next(new ErrorHandler("User not found with the given Email", 404));
    }

    const token = foundUser.createResetPasswordToken();
    foundUser.passwordResetTokenExpried = Date.now() + 10 * 60 * 1000;
    foundUser.passwordResetToken = token.passwordResetToken;
    await foundUser.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.hostname}:5173/resetPassword/${token.resetToken}`;

    const message = `Please reset your password using the link below:\n${resetUrl}\nThis reset link is valid for 10 minutes.`;

    try {
      await sendEmail({
        to: foundUser.email,
        subject: "Password Change Request Received from AyurBharat",
        text: message,
      });

      return res
        .status(200)
        .json({ status: "success", message: "Email sent successfully", token });
    } catch (error) {
      foundUser.passwordResetToken = undefined;
      foundUser.passwordResetTokenExpried = undefined;
      await foundUser.save({ validateBeforeSave: false });
      return next(new ErrorHandler("Error while sending Email", 500));
    }
  } catch (err) {
    return next(new ErrorHandler("Error while sending Email", 500));
  }
};

const Logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged Out" });
});

const passwordReset = catchAsyncErrors(async (req, res, next) => {
  try {
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await userSchema.findOne({
      passwordResetToken: token,
      passwordResetTokenExpried: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler("Reset Password Token is invalid or expired", 400)
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not password", 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpried = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return next(new ErrorHandler("Error occurred while sending Email", 500));
  }
});

const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await userSchema.findById(req.user._id);

  res.status(200).json({ success: true, user });
});

const updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await userSchema.findById(req.user._id);

  const isPasswordMatched = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { username, age, dateOfBirth, phoneNumber, email, avatar } = req.body;

  const newUserData = {
    username,
    age,
    dateOfBirth,
    phoneNumber,
    email,
    avatar,
  };

  const user = await userSchema.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await userSchema.find();

  res.status(200).json({
    success: true,
    users,
  });
});

const getUsers = catchAsyncErrors(async (req, res, next) => {
  const user = await userSchema.find(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler("User does not exit with Id: ", req.params.id)
    );
  }

  res.status(200).json({
    success: true,
    user,
    message: "User deleted successfully",
  });
});

const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const user = await userSchema.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler("User does not exist with ID: ", req.params.id)
    );
  }

  user.role = req.body.role;

  await user.save();

  res.status(200).json({ success: true });
});

const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const result = await userSchema.deleteOne({ _id: req.params.id });

  if (result.deletedCount === 0) {
    return next(
      new ErrorHandler("User does not exist with ID: ", req.params.id)
    );
  }

  res.status(200).json({ success: true });
});

module.exports = {
  userInsert,
  login,
  Logout,
  forgetPassword,
  passwordReset,
  getUserDetails,
  updateUserPassword,
  updateProfile,
  getUsers,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
