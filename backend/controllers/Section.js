const Section = require("../models/Section")
const Course = require("../models/Course")
const SubSection = require("../models/SubSection")

// Create Section
exports.createSection = async (req,res) => {
  try{
    // get data from request body
    const {sectionName, courseId} = req.body

    // validation of the data
    if(!sectionName || !courseId){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    // create an entry for section in db
    const newSection = await Section.create({sectionName})

    // update the section inside the course in db
    const updatedCourse = await Course.findByIdAndUpdate(
      {_id: courseId},
      {
        $push: {courseContent: newSection._id}
      },
      {new: true}
    ).populate({
        path: "courseContent",
        populate: {
          path: "subSection"
        }
      }).exec()

    // return the response
    return res.status(201).json({
      success: true,
      message: "Section is created successfully",
      updatedCourse
    })

  }catch(err){
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the section",
      error: err.message
    })
  }
}

// Update Section
exports.updateSection = async (req,res) => {
  try{
    // get data from request body
    const {sectionName, sectionId, courseId} = req.body

    // check if the section exists in the db or not
    const section = await Section.findById(sectionId)
    if(!section){
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }

    // validation of the data
    if(!sectionName || !sectionId || !courseId){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    // update the section data in db
    const updatedSection = await Section.findByIdAndUpdate(
      {_id: sectionId},
      {sectionName},
      {new: true}
    )

    // show the updated course
    const course = await Course.findById(courseId)
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection"
      }
    })
    .exec()

    // return the response
    return res.status(200).json({
      success: true,
      message: "Section is updated successfully",
      updatedSection,
      course
    })

  }catch(err){
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the section",
      error: err.message
    })
  }
}

// Delete Section
exports.deleteSection = async (req,res) => {
  try{
    // get data from request body
    const {sectionId, courseId} = req.body

    // validation of the data
    if(!sectionId || !courseId){
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    // check if the section exists or not
    const section = await Section.findById(sectionId)
    if(!section){
      return res.status(400).json({
				success:false,
				message:"Section not Found",
			})
    }

    // delete the subsections
    await SubSection.deleteMany({
      _id: {
        $in: section.subSection
      }
    })

    // delete the section
    await Section.findByIdAndDelete({_id: sectionId})

    // delete the section from the course in db
    await Course.findByIdAndDelete(
      {_id: courseId},
      {
        $pull: {courseContent: sectionId}
      },
      {new: true}
    )

    // show the updated course
    const course = await Course.findById(courseId)
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection"
      }
    }).exec()

    // return the response
    return res.status(200).json({
      success: true,
      message: "Section is deleted successfully",
      course
    })

  }catch(err){
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the section",
      error: err.message
    })
  }
}