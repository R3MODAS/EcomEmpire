const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User")

const { uploadImageToCloudinary } = require("../utils/imageUploader")

// create a course
exports.createCourse = async (req, res) => {
    try {
        // get the user id using req.user (passed from auth middleware)
        const userId = req.user.id

        // get the data from request body
        const { courseName, courseDescription, price, whatYouWillLearn, category } = req.body
        const thumbnail = req.files.thumbnailImage

        // validation of the data
        if (!courseName || !courseDescription || !price || !whatYouWillLearn || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Please fill the data properly"
            })
        }

        // check if the user is instructor or not 
        const instructorDetails = await User.findById({ _id: userId }, { accountType: "Instructor" })
        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: "No data is found for this Instructor"
            })
        }

        // check if the category is valid or not
        const categoryDetails = await Category.findById({ _id: category })
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "No such category exists"
            })
        }

        // upload the thumbnail to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

        // create an entry for course in course db
        const newCourse = await Course.create(
            {
                courseName,
                courseDescription,
                price,
                whatYouWillLearn,
                thumbnail: thumbnailImage.secure_url,
                instructor: instructorDetails._id,
                category: categoryDetails._id
            })

        // update the entry for course in user db
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            { $push: { courses: newCourse._id } },
            { new: true }
        )

        // update the entry for course in category db
        await Category.findByIdAndUpdate(
            { _id: category },
            { $push: { courses: newCourse._id } },
            { new: true }
        )

        // return the response
        return res.status(200).json({
            success: true,
            message: "Course has been created successfully"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating a course",
            error: err.message
        })
    }
}

// get all courses
exports.getAllCourses = async (req, res) => {
    try {
        // get all the courses
        const allCourses = await Course.find({}, { courseName: true, price: true, thumbnail: true, instructor: true }).populate("instructor").exec();
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching all the courses",
            error: err.message
        })
    }
}