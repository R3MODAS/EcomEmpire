const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    trim: true,
  },
  accountType: {
    type: String,
    enum: ["Admin", "Instructor", "Student"],
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  image: {
    type: String,
    required: true,
  },
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseProgress",
    },
  ],
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
