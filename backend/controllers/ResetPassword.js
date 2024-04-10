const User = require("../models/User")
const mailer = require("../utils/mailer")
const crypto = require("crypto")
const bcrypt = require("bcrypt")

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        // get the email from request body
        const { email } = req.body

        // validation of the email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        // check if the user exists in the db or not
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered yet, please visit the signup page"
            })
        }

        // generate a token using crypto
        const token = crypto.randomUUID()

        // update the token and token expiry in the user model in db
        await User.findOneAndUpdate(
            { email },
            { forgotPasswordToken: token, forgotPasswordTokenExpiry: Date.now() + 5 * 60 * 1000 },
            { new: true }
        )

        // create an url to send to the user
        const url = `http://localhost:${process.env.PORT}/update-password/${token}`

        // send the url in the mail to the user
        try {
            await mailer(email, "Reset Password Link by StudyNotion", `Your Link for email verification is ${url}. Please click this url to reset your password.`)
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Error while sending reset password link",
                error: err.message
            })
        }

        // return the response
        return res.status(200).json({
            success: true,
            message: "Link for reset password has been sent successfully"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the reset password link with token",
            error: err.message
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        // get password, confirmPassword, token from request body
        const { password, confirmPassword, token } = req.body

        // validation of the data
        if (!password || !confirmPassword || !token) {
            return res.status(400).json({
                success: false,
                message: "Please fill the data properly"
            })
        }

        // check if password and confirmPassword matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password does not match, please try again"
            })
        }

        // validation of the token
        const user = await User.findOne({ forgotPasswordToken: token })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        }

        else if (user.forgotPasswordTokenExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Token has expired"
            });
        }

        // hash the password
        let hashedpassword

        try {
            hashedpassword = await bcrypt.hash(password, 10)
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: `Failed to hash the password`,
                error: err.message
            });
        }

        // update the password in the db
        await User.findByIdAndUpdate(
            { _id: user._id },
            { password: hashedpassword },
            { new: true }
        )

        // send the mail regarding the change of password done
        try {
            await mailer(user.email, "Reset Password Done Successfully by Studynotion",
                `Password has been changed successfully for the email <b>${user.email}</b>, Please visit the login page and try again`)
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Error while sending the reset password confirmation",
                error: err.message
            })
        }

        // return the response
        return res.status(200).json({
            success: true,
            message: "Reset password is done successfully"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting the password",
            error: err.message
        })
    }
}