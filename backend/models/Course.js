const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    courseDescription: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    whatYouWillLearn: {
        type: String,
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    tag: {
        type: [String],
        required: true
    },
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview"
    }],
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],
    instructions: {
        type: [String]
    }
}, {timestamps: true})

const Course = mongoose.model("Course", courseSchema)
module.exports = Course