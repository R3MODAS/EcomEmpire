const {instance} = require("../utils/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const {mailer} = require("../utils/mailer")
const {courseEnrollment} = require("../mail/courseEnrollment")

// Capture the Payment and Initiate the Razorpay order
exports.capturePayment = async (req,res) => {
    try {
        // get courseId and userId (from auth middleware) from request body
        const {courseId} = req.body
        const userId = req.user.id

        // validation of the data
        if(!courseId || !userId){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // check if the course is valid or not
        const course = await Course.findById({_id: courseId})
        if(!course){
            
        }

        // check if the user is valid or not
        // create an order
        // return the response
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while"
        })
    }
}





