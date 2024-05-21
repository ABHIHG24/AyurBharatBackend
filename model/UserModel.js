const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
var validator = require("email-validator");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  age: {
    type: String,
    // required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.validate,
      message: "Email address is not valid",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
    minlength: [6, "password should be minimum 6 character"],
  },
  avatar: {
    type: String,
    default:
      "data:image/png;base64,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",
  },
  confirmPassword: {
    type: String,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpried: Date,
  refreshToken: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    this.repassword = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.isPasswordChanged = async function (jwttime) {
  if (this.passwordChangedAt) {
    const passwordchangetime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwttime < passwordchangetime;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpried = Date.now() + 10 * 60 * 1000;
  return { passwordResetToken, resetToken };
};

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_LOGIN_EXPIRES,
  });
};

module.exports = mongoose.model("User", userSchema);
