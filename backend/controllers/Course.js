const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    // get the user id (for verification of instructor)
    const userId = req.user.id;

    // get the data from request body (category -> categoryId)
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;

    // get the thumbnail img
    const thumbnail = req.files.thumbnailImage;

    // validation of the data
    if (!courseName || !courseDescription || !whatYouWillLearn || !price) {
      return res.status(400).json({
        success: false,
        message: "Please fill the details properly",
      });
    }

    // check if the user is instructor or not
    const instructorDetails = await User.findById(
      { _id: userId },
      { accountType: "Instructor" }
    );
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "No such instructor exists",
      });
    }

    // check if the category is valid or not
    const categoryDetails = await Category.findById({ _id: category });
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "No such category exists",
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
      category: categoryDetails._id,
      instructor: instructorDetails._id,
      price,
      whatYouWillLearn,
      thumbnail: thumbnailImage.secure_url,
    });

    // update the course entry for user in db
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // update the course entry for category in db
    await Category.findByIdAndUpdate(
      { _id: category },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Course is created successfully",
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
