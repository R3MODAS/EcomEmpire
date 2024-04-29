const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const mongoose = require("mongoose")

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        // get data from request body
        const { firstName = "", lastName = "", dateOfBirth = "", contactNumber = "", about = "", gender = "" } = req.body

        // find the user details using the user id (from auth middleware)
        const userDetails = await User.findById({ _id: req.user.id })

        // find the profile details using the id inside user details (additionalDetails)
        const profileDetails = await Profile.findById({ _id: userDetails.additionalDetails })

        // update the user info
        await User.findByIdAndUpdate(
            { _id: userDetails._id },
            { firstName, lastName },
            { new: true }
        )

        // update the profile info
        await Profile.findByIdAndUpdate(
            { _id: profileDetails._id },
            { dateOfBirth, contactNumber, about, gender },
            { new: true }
        )

        // show the updated user details
        const updatedUserDetails = await User.findById({ _id: userDetails._id })
            .populate("additionalDetails")
            .exec()

        // return the response
        return res.status(200).json({
            success: true,
            message: "Profile is updated successfully"
        })

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the profile details",
            error: err.message
        })
    }
}

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        // get the user id from req.user (from auth middleware)
        const userId = req.user.id

        // check if the user exists in the db or not
        const user = await User.findById({ _id: userId })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not found"
            })
        }

        // delete the profile for the user
        await Profile.findByIdAndDelete({ _id: new mongoose.Types.ObjectId(user.additionalDetails) })

        // delete the user from the course
        for (const courseId of user.courses) {
            await Course.findByIdAndUpdate(
                { _id: courseId },
                {
                    $pull: { studentsEnrolled: userId }
                },
                { new: true }
            )
        }

        // delete the user from db
        await User.findByIdAndDelete({ _id: userId })

        // return the response
        return res.status(200).json({
            success: true,
            message: "User is deleted successfully"
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the account",
            error: err.message
        })
    }
}

// Get all User Details
exports.getAllUserDetails = async (req,res) => {
    try {
        // get the user id from req.user (from auth middleware)
        const userId = req.user.id

        // find all the user details
        const userDetails = await User.findById({_id: userId})
        .populate("additionalDetails")
        .exec()

        // return the response
        return res.status(200).json({
            success: true,
            message: "User details is fetched successfully",
            userDetails
        })
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting all the user details",
            error: err.message
        })
    }
}