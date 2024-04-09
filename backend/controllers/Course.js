const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User")

const { uploadImageToCloudinary } = require("../utils/imageUploader")

// create a course
exports.createCourse = async (req, res) => {
    try {
        // get the user id from req.user (passed inside the auth middleware)
        const userId = req.user.id

        // get the data from request body
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body

        // get the thumbnail
        const thumbnail = req.files.thumbnailImage

        // validation of the data
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return res.status(400).json({
                error: "Please fill all the fields"
            });
        }

        // check if the user is instructor or not
        const instructorDetails = await User.findById({ _id: userId }, { accountType: "Instructor" })

        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: "Instructor details not found"
            });
        }

        // check if the category is valid or not
        const categoryDetails = await Category.findById({ _id: category })
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category details not found"
            });
        }

        // upload the image in cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

        // create an entry for course in db
        const newCourse = await Course.create({
            courseName, courseDescription, price, category: categoryDetails._id,
            instructor: instructorDetails._id,
            whatYouWillLearn, thumbnail: thumbnailImage.secure_url
        })

        // update the user model with the course id
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: { courses: newCourse._id }
            },
            { new: true }
        )

        // update the category model with the course id
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: { courses: newCourse._id }
            },
            { new: true }
        )

        // return the response
        return res.status(200).json({
            success: true,
            message: "Course has been created successfully",
            data: newCourse,
        });


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating a course",
            error: err.message
        })
    }
}