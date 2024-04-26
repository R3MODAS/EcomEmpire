const {instance} = require("../utils/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const {mailer} = require("../utils/mailer")
const {courseEnrollment} = require("../mail/courseEnrollment")
const mongoose = require("mongoose")

// Capture the Payment and Initiate the Razorpay order
exports.capturePayment = async (req,res) => {
    try {
        // get courseId and userId (from auth middleware) from request body
        const {courseId} = req.body
        const userId = req.user.id

        // validation of the data
        if(!courseId){
            return res.status(400).json({
                success: false,
                message: "Please provide the Course"
            })
        }

        // check if the course is valid or not
        const course = await Course.findById({_id: courseId})
        if(!course){
            return res.status(400).json({
                success: false,
                message: "Course is not found"
            })
        }

        // check if the user already bought the course or not
        const convertedUserId = new mongoose.Types.ObjectId(userId)
        if(course.studentsEnrolled.includes(convertedUserId)){
           return res.status(400).json({
            success: false,
            message: "Student is already enrolled to this course"
           }) 
        }

        // create an order
        const amount = course.price
        const currency = "INR"

        var options = {
            amount: amount * 100,
            currency: currency,
            receipt: Math.random(Date.now()).toString()
        };

        // initiate the payment using razorpay
        const paymentResponse = instance.orders.create(options)
        console.log(paymentResponse);

        // return the response
        return res.status(200).json({
            success: true,
            paymentResponse
        })

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while capturing the payment"
        })
    }
}