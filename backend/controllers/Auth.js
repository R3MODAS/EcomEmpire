const User = require("../models/User");
const Otp = require("../models/Otp");
const Profile = require("../models/Profile");

const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../utils/mailer");
const { updatedPassword } = require("../mail/updatedPassword");

// Send OTP controller
exports.sendOtp = async (req, res) => {
  try {
    // get the email from request body
    const { email } = req.body;

    // validation of the email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // check if the user already exists in the db or not
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User is Already Registered",
      });
    }

    // generate an otp
    let otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });

    // check if the otp is unique or not
    let result = await Otp.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false,
      });
      result = await Otp.findOne({ otp: otp });
    }

    // create an entry for otp in db
    await Otp.create({ email: email, otp: otp });

    // return the response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
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

// Signup controller
exports.signup = async (req, res) => {
  try {
    // get the data from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validation of the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    // check if the user already exists in the db or not
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User is Already Registered",
      });
    }

    // find the recent otp from the db
    const recentOTP = await Otp.find({ email: email })
      .sort({ createdAt: -1 })
      .limit(1);

    // validation of the otp
    if (recentOTP.length === 0 || otp !== recentOTP[0].otp) {
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
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      accountType,
      image: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firstName} ${lastName}`,
      contactNumber,
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

// Login controller
exports.login = async (req, res) => {
  try {
    // get the data from request body
    const { email, password } = req.body;

    // validation of the data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Password is missing, please fill it properly",
      });
    }

    // check if the user exists in the db or not
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered yet",
      });
    }

    // compare the user password and db password
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(403).json({
        message: "Please enter the correct password",
        success: false,
      });
    }

    // create a payload for jwt
    const payload = {
      id: user._id,
      email: user.email,
      accountType: user.accountType,
    };

    // generate a jwt for the user
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // add the token and remove the password before sending the data to the user
    user.token = token;
    user.password = undefined;

    // create a cookie and return the response
    res
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        user,
        token,
      });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while signing in the user",
      error: err.message,
    });
  }
};

// Change password controller
exports.changePassword = async (req, res) => {
  try {
    // get the oldPassword, newPassword, confirmNewPassword from request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // validation of the data
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill the fields properly",
      });
    }

    // get the user details from req.user object (passed from auth middleware)
    const user = await User.findById({ _id: req.user.id });

    // check if new password and confirm new password matches or not
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm New Password does not match",
      });
    }

    // check the old password and db password
    const comparePassword = await bcrypt.compare(oldPassword, user.password);
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not match",
      });
    }

    // encrypt the new password and update it to the db
    const EncryptedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(
      { _id: user._id },
      { password: EncryptedNewPassword },
      { new: true }
    );

    // send a mail to the user after updating the password
    await mailer(
      user.email,
      `Change of Password by StudyNotion`,
      updatedPassword(user.email, `${user.firstName} ${user.lastName}`)
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Password is changed successfully",
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
