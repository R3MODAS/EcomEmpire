const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      trim: true,
      required: [true, "Course name is required"],
    },
    courseDescription: {
      type: String,
      trim: true,
      required: [true, "Course description is required"],
    },
    whatYouWillLearn: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    tag: {
      type: [String],
      required: [true, "Tag is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    courseContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],
    instructions: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
