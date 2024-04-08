const User = require("../models/User")
const Otp = require("../models/Otp")
const Profile = require("../models/Profile")

const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mailer = require("../utils/mailer")
const { updatedPassword } = require("../mail/updatedPassword")

// Send OTP
exports.sendOtp = async (req, res) => {
    try {
        // get the email from request body
        const { email } = req.body

        // validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        // check if the user already exists in the db or not
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered, please visit the login page'
            })
        }

        // generate an otp
        let otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false,
            specialChars: false,
            upperCaseAlphabets: false
        })

        // check if the otp is unique or not
        let result = await Otp.findOne({ otp: otp })

        while (result) {
            otp = otpGenerator.generate(6, {
                lowerCaseAlphabets: false,
                specialChars: false,
                upperCaseAlphabets: false
            })
            result = await Otp.findOne({ otp: otp })
        }

        // create an entry for otp in db
        await Otp.create({ email: email, otp: otp })

        // return the response
        return res.status(200).json({
            success: true,
            message: "Otp sent successfully",
            otp
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending the otp",
            error: err.message
        })
    }
}

// Signup
exports.signup = async (req, res) => {
    try {
        // get data from request body
        const { firstName, lastName, email, password, confirmPassword, contactNumber, accountType, otp } = req.body

        // validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !accountType || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please fill the details properly"
            })
        }

        // check if the password and confirm password matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password doesn't match"
            })
        }

        // check if the user already exists in the db or not
        const user = await User.findOne({ email: email })
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User is already registered, please visit the login page"
            })
        }

        // find the recent otp from the db
        const recentOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1)

        if (recentOtp.length === 0 || otp !== recentOtp[0].otp) {
            return res.status(400).json({
                success: false,
                message: "Otp is not valid"
            })
        }

        // hash the password
        let hashedpassword

        try {
            hashedpassword = await bcrypt.hash(password, 10)
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to hash the password",
                error: err.message
            })
        }

        // create an entry for profile model
        const profileDetails = await Profile.create({
            about: null,
            contactNumber: null,
            dateOfBirth: null,
            gender: null
        })

        // create an entry for user model
        const userDetails = await User.create({
            firstName,
            lastName,
            email,
            password: hashedpassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        // return the response
        return res.status(200).json({
            success: true,
            message: "User has been signed up successfully"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while signing up the user",
            error: err.message
        })
    }
}

// Login
exports.login = async (req, res) => {
    try {
        // get the email and password from request body
        const { email, password } = req.body

        // validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/Password is required"
            })
        }

        // check if user already exists in the db or not
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found, please visit the signup page"
            })
        }

        // compare the password and db password
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(400).json({
                success: false,
                message: "Password does not match"
            })
        }

        // create a payload for token
        const payload = {
            id: user._id,
            email: user.email,
            accountType: user.accountType
        }

        // create a token using jwt
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        user.token = token
        user.password = undefined

        // creating cookie and returning the response
        const options = {
            expires: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)),
            httpOnly: true
        }

        res.cookie("token", token, options).status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging the user",
            error: err.message
        })
    }
}

// Change Password
exports.changePassword = async (req, res) => {
    try {
        // get the data from request body
        const { oldPassword, newPassword, confirmNewPassword } = req.body

        // get the user Details using the req.user (from auth middleware)
        const userDetails = await User.findById({ _id: req.user.id })

        // validation of the data
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill the details properly"
            })
        }

        // check if new password and confirm new password matches or not
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New Password and Confirm New Password does not match"
            })
        }

        // compare the old password and db password
        const comparePassword = await bcrypt.compare(oldPassword, userDetails.password)

        if (!comparePassword) {
            return res.status(400).json({
                success: false,
                message: "Old Password does not match"
            })
        }

        // update the db password with the newer one
        const newEncryptedPassword = await bcrypt.hash(newPassword, 10)
        await User.findByIdAndUpdate(
            { _id: userDetails._id },
            { password: newEncryptedPassword },
            { new: true }
        )

        // send the mail to the user regarding the changing of password
        try {
            await mailer(
                userDetails.email,
                `Password update for ${userDetails.firstName} ${userDetails.lastName} by StudyNotion`,
                updatedPassword(userDetails.email, `${userDetails.firstName} ${userDetails.lastName}`))
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                success: false,
                message: "Something went wrong while sending the mail to the user"
            })
        }

        // return the response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while changing the password",
            error: err.message
        })
    }
}