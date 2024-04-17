const Section = require("../models/Section");
const Course = require("../models/Course");

// Create Section
exports.createSection = async (req, res) => {
  try {
    // get data from request body
    const { sectionName, courseId } = req.body;

    // validation of the data
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // create the entry for section in db
    const newSection = await Section.create({ sectionName });

    // update the course model with section in db
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      { $push: { courseContent: newSection._id } },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // return the response
    return res.status(201).json({
      success: true,
      message: "Created section successfully",
      updatedCourseDetails,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the section",
      error: err.message,
    });
  }
};

// Update Section
exports.updateSection = async (req, res) => {
  try {
    // get the data from request body
    const { sectionName, sectionId } = req.body;

    // validation of the data
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // update the data to section in db
    const section = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { sectionName: sectionName },
      { new: true }
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Section is updated successfully",
      section,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the section",
      error: err.message,
    });
  }
};

// Delete Section
exports.deleteSection = async (req, res) => {
  try {
    // get the data from request body
    const { sectionId, courseId } = req.body;

    // validation of the data
    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // delete the section from the db
    await Section.findByIdAndDelete({ _id: sectionId });

    // delete the section from the course model in db
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $pull: { courseContent: sectionId },
      },
      { new: true }
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Section is deleted successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the section",
      error: err.message,
    });
  }
};
