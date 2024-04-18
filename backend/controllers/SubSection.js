const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadToCloudinary } = require("../utils/cloudinaryUploader");

// Create SubSection
exports.createSubSection = async (req, res) => {
  try {
    // get data from request body
    const { title, description, sectionId } = req.body;

    // get videofile from request files
    const video = req.files.videoFile;

    // validation of the data
    if (!title || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // upload the video to cloudinary
    const uploadDetails = await uploadToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create an entry for subsection in db
    const newSubSection = await SubSection.create({
      title,
      description,
      videoUrl: uploadDetails.secure_url,
      timeDuration: `${uploadDetails.duration}`,
    });

    // update the section with subsection in db
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSection: newSubSection._id },
      },
      { new: true }
    )
      .populate("subSection")
      .exec();

    // return the response
    return res.status(201).json({
      success: true,
      message: "SubSection is created successfully",
      updatedSection,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating subsection",
      error: err.message,
    });
  }
};

// Update SubSection
exports.updateSubSection = async (req, res) => {
  try {
    // get data from request body
    const { title, description, subSectionId, sectionId } = req.body;

    // get the subsection details
    const subSectionDetails = await SubSection.findById({ _id: subSectionId });

    // check the data given by user and update the data accordingly
    if (title !== undefined) {
      subSectionDetails.title = title;
    }

    if (description !== undefined) {
      subSectionDetails.description = description;
    }

    if (req.files && req.files.videoFile !== undefined) {
      const video = req.files.videoFile;
      const uploadDetails = await uploadToCloudinary(
        video,
        process.env.FOLDER_NAME
      );

      subSectionDetails.videoUrl = uploadDetails.secure_url;
      subSectionDetails.timeDuration = `${uploadDetails.duration}`;
    }

    // save all the changes in db
    await subSectionDetails.save();

    // get the section details
    const updatedSection = await Section.findById({ _id: sectionId })
      .populate("subSection")
      .exec();

    // return the response
    res.status(200).json({
      success: true,
      message: "SubSection is updated successfully",
      updatedSection,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating subsection",
      error: err.message,
    });
  }
};

// Delete SubSection
exports.deleteSubSection = async (req, res) => {
  try {
    // get data from request body
    const { subSectionId, sectionId } = req.body;

    // validation of the data
    if (!sectionId || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check if the subsection exists in the db or not
    const subsection = await SubSection.findById({ _id: subSectionId });
    if (!subsection) {
      return res.status(400).json({
        success: false,
        message: "SubSection is not found",
      });
    }

    // delete the subsection from db
    await SubSection.findByIdAndDelete({ _id: subSectionId });

    // delete the subsection from section in db
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: { subSection: subSectionId },
      },
      { new: true }
    );

    // show the updated section
    const section = await Section.findById({ _id: sectionId })
      .populate("subSection")
      .exec();

    // return the response
    return res.status(200).json({
      success: true,
      message: "SubSection is deleted successfully",
      section,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting subsection",
      error: err.message,
    });
  }
};
