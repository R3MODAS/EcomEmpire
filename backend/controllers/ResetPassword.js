const User = require("../models/User")
const mailer = require("../utils/mailer")
const crypto = require("crypto")
const bcrypt = require("bcrypt")

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        // get the email from request body
        const { email } = req.body

        // validation of the data
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        // check if the user exists in the db or not   
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered, please visit the signup page"
            })
        }

        // generate a token
        const token = crypto.randomUUID()

        // update the user details in the db with token and token expiry
        await User.findOneAndUpdate(
            { email: email },
            { forgotPasswordToken: token, forgotPasswordTokenExpiry: Date.now() + 5 * 60 * 1000 },
            { new: true }
        )

        // create an url with the token
        const url = `http://localhost:${process.env.PORT}/update-password/${token}`

        // send a mail to the user with this url
        await mailer(email, "Password Reset by StudyNotion", `Your Link for email verification is ${url}. Please click this url to reset your password.`)

        // return the response
        return res.status(200).json({
            success: true,
            message: "Password Reset mail has been sent successfully"
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating reset password token",
            error: err.message
        })
    }
}

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        // get data from request body
        const { password, confirmPassword, token } = req.body

        // validation of the data
        if (!password || !confirmPassword || !token) {
            return res.status(400).json({
                success: false,
                message: "Please fill the details properly"
            })
        }

        // check if password and confirm password matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm Password does not match"
            })
        }

        // get user details using the token
        const user = await User.findOne({ forgotPasswordToken: token })

        // validation of token
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

        // hash the new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // update the user with the new password in db
        await User.findByIdAndUpdate(
            {_id: user._id},
            {password: hashedPassword},
            {new: true}
        )

        // return the response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
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