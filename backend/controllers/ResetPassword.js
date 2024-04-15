const User = require("../models/User");
const mailer = require("../utils/mailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Reset Password Token controller
exports.resetPasswordToken = async (req, res) => {
  try {
    // get the email from request body
    const { email } = req.body;

    // validation of the data
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // check if the user exists in the db or not
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is not registered",
      });
    }

    // generate a token
    const token = crypto.randomUUID();

    // update the token and token expiry for user model in db
    await User.findByIdAndUpdate(
      { _id: user._id },
      {
        forgotPasswordToken: token,
        forgotPasswordTokenExpiry: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    // create an url for the user to reset password
    const url = `http://localhost:${process.env.PORT}/update-password/${token}`;

    // send a mail to the user with the url
    await mailer(
      email,
      "Reset Password by StudyNotion",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Reset Password Link sent successfully",
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

// Reset Password controller
exports.resetPassword = async (req, res) => {
  try {
    // get the data from request body
    const { password, confirmPassword, token } = req.body;

    // validation of the data
    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "Please fill the data properly",
      });
    }

    // check if the password and confirm password matches or not
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

    // encrypt the new password and update it to the db
    const newEncryptedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(
      { _id: user._id },
      { password: newEncryptedPassword },
      { new: true }
    );

    // send the mail regarding the password updation
    await mailer(
      user.email,
      "Reset Password Done Successfully by Studynotion",
      `Password has been changed successfully for the email <b>${user.email}</b>`
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Reset password is done successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting the password",
      error: err.message,
    });
  }
};
