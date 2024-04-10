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
        // get the email from the request body
        const { email } = req.body

        // validation of the email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        // check if the user already exists in the db or not
        const user = await User.findOne({ email })
        if (user) {
            return res.status(401).json({
                success: false,
                message: "User is already registered, please visit the login page"
            })
        }

        // generate an otp
        let otp = otpGenerator.generate({
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        // check if the otp is unique or not
        let result = await Otp.findOne({ otp })
        while (result) {
            otp = otpGenerator.generate({
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            result = await Otp.findOne({ otp })
        }

        // create an entry for otp in db
        await Otp.create({ otp, email })

        // return the response
        return res.status(200).json({
            success: true,
            message: "Otp sent successfully"
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
        // get the data from request body
        const { firstName, lastName, email, password, confirmPassword, contactNumber, accountType, otp } = req.body

        // validation of the data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields'
            });
        }

        // check if password and confirm password matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password do not match , please try again'
            });
        }

        // check if the user already exists in the db or not
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered, please visit the login page'
            })
        }

        // find the recent otp from the db
        const recentOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1)

        // validate the otp
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
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({
                success: false,
                message: `Failed to hash the password`,
                error: err.message
            });
        }

        // create an entry for profile in db
        const profileDetails = await Profile.create({
            about: null,
            gender: null,
            contactNumber: null,
            dateOfBirth: null
        })

        // create an entry for user in db
        const userDetails = await User.create({
            firstName,
            lastName,
            email,
            password: hashedpassword,
            additionalDetails: profileDetails._id,
            accountType,
            contactNumber,
            image: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firstName} ${lastName}`
        })

        // return the response
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user: userDetails
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
        // get the email password from request body
        const { email, password } = req.body

        // validation of the data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/Password is missing, please fill it properly"
            })
        }

        // check if the user exists in the db or not
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered yet, please visit the signup page"
            })
        }

        // compare the password user gave and the db password
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(403).json({
                message: "Please enter the correct password",
                success: false
            })
        }

        // create a payload for the jwt
        const payload = {
            id: user._id,
            email: user.email,
            accountType: user.accountType
        }

        // create a token using jwt
        const token = await jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        user.token = token
        user.password = undefined

        // create options for cookie
        const options = {
            httpOnly: true,
            expires: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000))
        }

        // send that token to user using cookie and return the response
        res.cookie("token", token, options).status(200).json({
            success: false,
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
        // get the user details using the req.user (passed inside the auth middleware)
        const userDetails = await User.findById({ _id: req.user.id })

        // get the oldPassword, newPassword and confirmNewPassword from request body
        const { oldPassword, newPassword, confirmNewPassword } = req.body

        // validation of the data
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill the fields properly"
            })
        }

        // check if oldPassword and db password matches or not
        const comparePassword = await bcrypt.compare(oldPassword, userDetails.password)
        if (!comparePassword) {
            return res.status(403).json({
                message: "Please enter the correct password",
                success: false
            })
        }

        // check if newPassword and confirmNewPassword matches or not
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "The password and confirm password does not match",
            });
        }

        // encrypt the new password and update it in the db
        const newEncryptedPassword = await bcrypt.hash(newPassword, 10)
        await User.findByIdAndUpdate(
            {_id: userDetails._id},
            {password: newEncryptedPassword},
            {new: true}
        )

        // send the mail regarding the update of password
        try{
            await mailer(userDetails.email, 
                "Password Updated Successfully by StudyNotion",
                updatedPassword(userDetails.email, `${userDetails.firstName} ${userDetails.lastName}`)
            )
        }catch(err){
            console.log(err);
            return res.status(500).json({
              success:false,
              message:"Error while sending updated password email",
              error: err.message
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