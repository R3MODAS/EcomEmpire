const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    accountType: {
        type: String,
        enum: ["Admin", "Instructor", "Student"],
        required: true
    },
    image: {
        type: String,
        required: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    courseProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress"
    }],
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date
})

const User = mongoose.model("User", userSchema)
module.exports = User