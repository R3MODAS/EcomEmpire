const mongoose = require("mongoose")
const { mailer } = require("../utils/mailer")
const { verifyEmail } = require("../mail/verifyEmail")

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60
    }
})

// Sending the OTP to the user's email
async function sendEmailVerification(email, otp) {
    try {
        await mailer(email, "Email Verification | StudyNotion", verifyEmail(otp))
    } catch (err) {
        console.log(err.message);
    }
}

// Send the mail before saving the otp
otpSchema.pre("save", async function () {
    // Send an email when a new document is created 
    if (this.isNew) {
        await sendEmailVerification(this.email, this.otp)
    }
})


const Otp = mongoose.model("Otp", otpSchema)
module.exports = Otp