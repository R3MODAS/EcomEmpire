const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course")

// Create Rating and Review
exports.createRating = async (req, res) => {
    try {
        // get user id from req.user (from auth middleware)
        const userId = req.user.id

        // get data from request body
        const { rating, review, courseId } = req.body

        // validation of the data
        if (!rating || !review || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // check if the user is enrolled to the course or not
        const courseDetails = await Course.findById(
            { _id: courseId },
            {
                studentsEnrolled: { $elemMatch: { $eq: userId } }
            })
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "Course is not found"
            })
        }

        // check if the user already reviewed the course or not
        const alreadyReviewed = await RatingAndReview.findOne({ user: userId, course: courseId })
        if(alreadyReviewed){
            return res.status(400).json({
                success: false,
                message: "You have already reviewed the course"
            })
        }

        // create the rating and review
        const ratingreview = await RatingAndReview.create({
            rating,
            review,
            user: userId,
            course: courseId
        })

        // update the rating and review to the course in db
        await Course.findByIdAndUpdate(
            {_id: courseId},
            {
                $push: {ratingAndReviews: ratingreview._id}
           },
           {new: true}
        )

        // return the response
        return res.status(200).json({
            success: true,
            message: "Rating and review added successfully",
            ratingreview
        })

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating rating and review",
            error: err.message
        })
    }
}

// Get Average Rating
// Get All Ratings