const User = require("../models/User");
const Otp = require("../models/Otp");
const Profile = require("../models/Profile");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { mailer } = require("../utils/mailer");
const { changePassword } = require("../mail/changePassword");

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    // get data from request body
    const { email } = req.body;

    // validation of the data
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // check if the user already exists in the db or not
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // generate an unique otp
    let otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });

    // validation of the otp
    let result = await Otp.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
      });
      result = await Otp.findOne({ otp });
    }

    // create an entry for otp in db
    await Otp.create({ email, otp });

    // return the response
    return res.status(200).json({
      success: true,
      message: "Otp sent successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the otp",
      error: err.message,
    });
  }
};

// Signup
exports.signup = async (req, res) => {
  try {
    // get data from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      accountType,
      otp,
    } = req.body;

    // validation of the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !contactNumber ||
      !accountType ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check if password and confirm password matches or not
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }

    // check if the user already exists in the db or not
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // find the recent otp from the db
    const recentOtp = await Otp.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    // validation of the otp
    if (recentOtp.length === 0 || otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create an entry for profile in db
    const profileDetails = await Profile.create({
      about: null,
      contactNumber: null,
      dateOfBirth: null,
      gender: null,
    });

    // create an entry for user in db
    const userDetails = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`,
    });

    // return the response
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user: userDetails,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering the user",
      error: err.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // get data from request body
    const { email, password } = req.body;

    // validation of the data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check if the user exists in the db or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered",
      });
    }

    // compare the user password and db password
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // create a payload for jwt
    const payload = {
      id: user._id,
      email: user.email,
      accountType: user.accountType,
    };

    // create a jwt
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // create options for cookie
    const options = {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };

    // create a cookie and return the response
    res.cookie("token", token, options).status(200).json({
      success: true,
      message: "Login done successfully",
      token,
      user,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while the user login",
      error: err.message,
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    // get data from request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // validation of the data
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // get the user details using req.user (passed using auth middleware)
    const user = await User.findById({ _id: req.user.id });

    // check if old password and db password matches or not
    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // check if new password and confirm new password matches or not
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm new password doesn't match",
      });
    }

    // encrypt the new password and update the new password in the db
    const newEncryptedPass = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(
      { _id: user._id },
      { password: newEncryptedPass },
      { new: true }
    );

    // send a mail regarding the updation of password
    await mailer(
      user.email,
      "Password Changed Successfully | StudyNotion",
      changePassword(user.email, `${user.firstName} ${user.lastName}`)
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while changing the password",
      error: err.message,
    });
  }
};
