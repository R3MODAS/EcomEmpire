const {instance} = require("../utils/razorpay")
const Course = require("../models/Course")
const User = require("../models/User")
const {mailer} = require("../utils/mailer")
const {courseEnrollment} = require("../mail/courseEnrollment")
const mongoose = require("mongoose")
const crypto = require("crypto")

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
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userId
            }
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

// Verify Signature
exports.verifySignature = async (req,res) => {
    try{
        // get the secret key from server and client (webhook)
        const webhookSecret = "123456"
        const signature = req.headers("x-razorpay-signature")

        // Encrypt the secret key
        const shasum = crypto.createHmac("sha256", webhookSecret)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest("hex")

        // compare the signature (client) and secret key from server
        if(signature === digest){
            console.log("Payment is authorized");

            const {courseId, userId} = req.body.payload.payment.entity.notes

            // fulfill the action
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {
                    $push: {studentsEnrolled: userId}
                },
                {new: true}
            )
            console.log(enrolledCourse)

            if(!enrolledCourse){
                return res.status(400).json({
                    success: false,
                    message: "Course is not found"
                })
            }

            // find the student and add the course 
            const enrolledStudent = await User.findOneAndUpdate(
                {_id: userId},
                {
                    $push: {courses: courseId}
                },
                {new: true}
            )
            console.log(enrolledStudent);
        }

        // send mail
        await mailer(enrolledStudent.email, "Payment Success", "Congratulations, you are onboarded into new Course")

        // return the response
        return res.status(200).json({
            success: true,
            message: "Signature verified and Course added"
        })

    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while verifying signature",
            error: err.message
        })
    }
}