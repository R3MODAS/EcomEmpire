const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadToCloudinary } = require("../utils/cloudinaryUploader");

// Create SubSection
exports.createSubSection = async (req, res) => {
  try {
    // get data from request body
    const { title, description, sectionId } = req.body;

    // get file from request file
    const video = req.files.videoFile;

    // validation of the data
    if (!sectionId || !title || !description || !video) {
      console.log(sectionId, title, description, video);
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // upload video to cloudinary
    const uploadDetails = await uploadToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // create an entry for subsection in db
    const subSectionDetails = await SubSection.create({
      title,
      description,
      videoUrl: uploadDetails.secure_url,
      timeDuration: `${uploadDetails.duration}`,
    });

    // update the section with subsection id in db
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    )
      .populate("subSection")
      .exec();

    // return the response
    return res.status(201).json({
      success: true,
      message: "SubSection created successfully",
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
    const { sectionId, subSectionId, title, description } = req.body;

    // check if the subsection exists or not
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(400).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // update the data by checking if user sent them or not
    if(title !== undefined){
        subSection.title = title
    }

    if(description !== undefined){
        subSection.description = description
    }

    if(req.files && req.files.video !== undefined){
        const video = req.files.video
        const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER_NAME)

        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
    }

    // save the subsection updates
    await subSection.save()

    // get the updated section data
    const updatedSection = await Section.findById(sectionId).populate("subSection").exec()

    // return the response 
    return res.status(200).json({
        success: true,
        message: "Updated the SubSection successfully",
        updatedSection
    })

  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating subsection",
      error: err.message,
    });
  }
};

// Delete SubSection