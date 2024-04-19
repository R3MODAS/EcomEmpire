const Profile = require("../models/Profile")
const User = require("../models/User")
const Course = require("../models/Course")

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        // get data from request body
        const { firstName = "", lastName = "", dateOfBirth = "", about = "", contactNumber = "", gender = "" } = req.body

        // get user id from req.user (from auth middleware)
        const userId = req.user.id;

        // find the profile
        const userDetails = await User.findById(userId)
        const profileDetails = await Profile.findById(userDetails.additionalDetails)

        // update the user
        await User.findByIdAndUpdate(
            {_id: userId},
            {firstName: firstName, lastName: lastName},
            {new: true}
        )

        // update the profile
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.contactNumber = contactNumber
        profileDetails.gender = gender

        await profileDetails.save()

        // get the updated user details
        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec()

        // return the response
        return res.status(200).json({
            success: true,
            message: "Profile is updated successfully",
            updatedUserDetails
        })

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the profile",
            error: err.message
        })
    }
}

// Delete Account
exports.deleteAccount = async (req,res) => {
    try{
        // get the user id from req.user (from auth middleware)
        const userId = req.user.id

        // validation of the data
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"Please login to delete profile",
              }); 
        }

        const userDetails = await User.findById(userId)
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        // delete user from course
       for (const courseId of userDetails.courses){
            await Course.findByIdAndUpdate(
                {_id: courseId},
                {$pull: {studentsEnrolled: userId}},
                {new: true}
            )
       }

        // delete profile
        await Profile.findByIdAndDelete({id: userDetails.additionalDetails})

        // delete user
        await User.findByIdAndDelete({id: userId})

        // return the response
        return res.status(200).json({
            success: true,
            message: "User is deleted successfully"
        })

    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the account",
            error: err.message
        })
    }
}

// Get the User Details
exports.getAllUserDetails = async (req,res) => {
    try{
        // get the user id from req.user (from auth middleware)
        const userId = req.user.id

        // find all the user details
        const userDetails = await User.findById(userId).populate("additionalDetails").exec()

        // validation
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        // return the response
        return res.status(200).json({
            success: true,
            message: "User Details is fetched successfully"
        })

    }catch(err){
        console.log(err.message);
        return res.status(400).json({
            success: false,
            message: "Something went wrong while getting the user details",
            error: err.message
        })
    }
}