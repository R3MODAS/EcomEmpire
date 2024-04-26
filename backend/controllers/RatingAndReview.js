const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")
const mongoose = require("mongoose")

// Create Rating and Review
exports.creatingRating = async (req, res) => {
    try {
        // get user id (from auth middleware)
        const userId = req.user.id

        // get data from request body
        const { courseId, rating, review } = req.body

        // check if the user is enrolled in the course or not
        const courseDetails = await Course.findById(
            { _id: courseId },
            {
                studentsEnrolled: { $elemMatch: { $eq: userId } }
            })
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "Student is not enrolled to this course"
            })
        }

        // check if user already reviewed the course or not
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        })
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed the course"
            })
        }

        // create the rating and review
        const ratingandreview = await RatingAndReview.create({ course: courseId, user: userId, rating, review })

        // update the rating in the course
        await Course.findByIdAndUpdate(
            { _id: courseId },
            {
                $push: { RatingAndReview: ratingandreview._id }
            },
            { new: true }
        )

        // return the response
        return res.status(200).json({
            success: true,
            message: "Rating and Review is created successfully",
            ratingandreview
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the rating and review",
            error: err.message
        })
    }
}

// Get Average Rating
exports.getAverageRating = async (req, res) => {
    try {
        // get course id from request body
        const { courseId } = req.body

        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])

        // return the rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            })
        }

        // if no rating reviews exists
        return res.status(200).json({
            success: true,
            message: "No Rating/Review exists",
            averageRating: 0
        })

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the average rating",
            error: err.message
        })
    }
}

// Get all Rating and Review
exports.getAllRating = async (req, res) => {
    try {
        // get all the rating and reviews
        const allRatingReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({ path: "user", select: "firstName lastName email image" })
            .populate({ path: "course", select: "courseName" })
            .exec()

        // return the response
        return res.status(200).json({
            success: true,
            message: "All rating and review is fetched successfully",
            allRatingReviews,
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching all the rating and review",
            error: err.message
        })
    }
}