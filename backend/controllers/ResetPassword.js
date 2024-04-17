const User = require("../models/User");
const { mailer } = require("../utils/mailer");
const { updatePassword } = require("../mail/updatePassword");

const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    // get the data from request body
    const { email } = req.body;

    // validation of the data
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
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

    // generate a token
    const token = crypto.randomUUID();

    // update the token and token expiry for user in db
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          forgotPasswordToken: token,
          forgotPasswordTokenExpiry: Date.now() + 5 * 60 * 1000,
        },
      },
      { new: true }
    );

    // create a url for user (client)
    const url = `http://localhost:${process.env.PORT}/reset-password/${token}`;

    // send a mail to the user with the url
    await mailer(
      email,
      "Reset Password Link | StudyNotion",
      `Your Link for Password Reset is ${url}. Please click this url to reset your password.`
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Reset Password Link is sent successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the reset password link",
      error: err.message,
    });
  }
};

// Reset Password
exports.resetPasswordToken = async (req, res) => {
  try {
    // get the data from request body
    const { password, confirmPassword, token } = req.body;

    // validation of the data
    if (!password || !confirmPassword || !token) {
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

    // validation of the token
    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    // encrypt the new password and update the password for the user in db
    const newEncryptedPass = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(
      { _id: user._id },
      { password: newEncryptedPass },
      { new: true }
    );

    // send a mail to the user regarding the password reset confirmation
    await mailer(
      user.email,
      "Reset Password Done Successfully | StudyNotion",
      updatePassword(user.email, `${user.firstName} ${user.lastName}`)
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Reset Password is done successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the reset password link",
      error: err.message,
    });
  }
};
