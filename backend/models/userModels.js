const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    maxlength: [8, "Password cannot excced 8 characters"],
    select: false,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  resetPassswordToken: String,
  resetPassswordTokenExpire: Date,

  creatAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

userSchema.methods.isValidPassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

userSchema.methods.getresetToken = function () {
  // Generate a token
  const token = crypto.randomBytes(20).toString("hex");
  //Generte Hash and set to resetPasswordToken
  this.resetPassswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  // Set expiration time for the token
  this.resetPassswordTokenExpire = Date.now() + 10 * 60 * 1000;

  return token;
};
let model = mongoose.model("User", userSchema);

module.exports = model;
