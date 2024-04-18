const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadToCloudinary } = require("../utils/cloudinaryUploader");

// Create SubSection
exports.createSubSection = async (req, res) => {
  try {
    // get data from request body
    const { title, description, sectionId } = req.body;

    // get the video from request files
    const video = req.files.videoFile;

    // validation of the data
    if (!title || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // upload video to cloudinary
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

    // update the subsection inside the section in db
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
      message: "Something went wrong while creating the subsection",
      error: err.message,
    });
  }
};

// Update SubSection
exports.updateSubSection = async (req, res) => {
  try {
    // get data from request body
    const { title, description, subSectionId, sectionId } = req.body;

    // check if the subSection exists in the db or not
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // check which data is given by user and update it accordingly
    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }

    if (req.files && req.files.videoFile !== undefined) {
      const video = req.files.videoFile;
      const uploadDetails = await uploadToCloudinary(
        video,
        process.env.FOLDER_NAME
      );

      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    // save all the changes done
    await subSection.save();

    // show the updated Section
    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    // return the response
    return res.status(200).json({
      success: true,
      message: "SubSection is updated successfully",
      updatedSection,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the subsection",
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
    if (!subSectionId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check if the subsection exists or not
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(400).json({
        success: false,
        message: "SubSection not Found",
      });
    }

    // delete the subsection
    await SubSection.findByIdAndDelete({ _id: subSectionId });

    // delete the subsection from the section in db
    await Section.findByIdAndDelete(
      { _id: sectionId },
      {
        $pull: { subSection: subSectionId },
      },
      { new: true }
    );

    // show the updated section
    const updatedSection = await Section.findById(sectionId)
      .populate("subSection")
      .exec();

    // return the response
    return res.status(200).json({
      success: true,
      message: "SubSection is deleted successfully",
      updatedSection,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the subsection",
      error: err.message,
    });
  }
};
