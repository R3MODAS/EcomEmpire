const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const {uploadToCloudinary} = require("../utils/cloudinaryUploader")

// Create Course
exports.createCourse = async (req, res) => {
  try {
    // get user id from req.user (from auth middleware) as only instructor can create course
    const userId = req.user.id

    // get data from request body
    const {courseName, courseDescription, price, whatYouWillLearn, category} = req.body

    // get the thumbnail img from request files
    const thumbnail = req.files.thumbnailImage

    // validation of the data
    if (!courseName || !courseDescription || !price || !whatYouWillLearn || !category || !thumbnail) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

    // check if the user is instructor or not
      const instructorDetails = await User.findById({_id: userId})
      if(!instructorDetails){
        return res.status(400).json({
            success: false,
            message: "Instructor is not found",
          });
      }

    // check if the category exists or not
    const categoryDetails = await Category.findById({_id: category})
    if(!categoryDetails){
        return res.status(400).json({
            success: false,
            message: "Category is not found",
          });
    }

    // upload the thumbnail to cloudinary
    const thumbnailImage = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME)

    // create the entry for course in db
    const newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id,
        price,
        whatYouWillLearn,
        thumbnail: thumbnailImage.secure_url
    })

    // update the user with the course id in db
    await User.findByIdAndUpdate(
        {_id: instructorDetails._id},
        {$push: {courses: newCourse._id}},
        {new: true}
    )

    // update the category with the course id in db
    await Category.findByIdAndUpdate(
        {_id: category},
        {$push: {courses: newCourse._id}},
        {new: true}
    )

    // return the response
    return res.status(200).json({
      success: true,
      message: "Created the Course successfully",
      course: newCourse
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the course",
      error: err.message,
    });
  }
};

// Get all the Courses
exports.getAllCourses = async (req, res) => {
  try {
    // get all the courses from the db
    const allcourses = await Course.find(
      {},
      { courseName: true, instructor: true, thumbnail: true, price: true }
    ).populate("instructor").exec()

    // return the response
    return res.status(200).json({
      success: true,
      message: "Got all the courses successfully",
      courses: allcourses,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching all the courses",
      error: err.message,
    });
  }
};
