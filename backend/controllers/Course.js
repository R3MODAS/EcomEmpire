const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a Course
exports.createCourse = async (req, res) => {
  try {
    // get the data from request body
    const { courseName, courseDescription, price, whatYouWillLearn, category } =
      req.body;

    // get the thumbnail image from request files
    const thumbnail = req.files.thumbnailImage;

    // validation of the data
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category
    ) {
      return res.status(400).json({
        error: "Please fill all the data properly",
      });
    }

    // get the user id from req.user (passed by auth middleware)
    const userId = req.user.id;

    // check if the user is instructor or not
    const instructorDetails = await User.findById(
      { _id: userId },
      { accountType: "Instructor" }
    );
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor is not found",
      });
    }

    // check if the category is valid or not
    const categoryDetails = await Category.findById({ _id: category });
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Category does not exists",
      });
    }

    // upload the thumbnail to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create an entry for course in db
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      price,
      whatYouWillLearn,
      category: categoryDetails._id,
      instructor: instructorDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    // update the course in user model (belongs to which instructor)
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // update the course in category model (belongs to which category)
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Course is created successfully",
      course: newCourse,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating a course",
      error: err.message,
    });
  }
};

// Get all Courses
exports.getAllCourses = async (req, res) => {
  try {
    // get all the courses with course name, price, thumbnail, instructor
    const allCourses = await Course.find({}, {courseName: true, price: true, thumbnail: true, instructor: true}).populate("instructor").exec()

    // return the response
    return res.status(200).json({
        success: true,
        message: "Got all the courses successfully",
        courses: allCourses
    })

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching all the courses",
      error: err.message,
    });
  }
};
