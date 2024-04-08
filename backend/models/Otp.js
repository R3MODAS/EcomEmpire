const mongoose = require("mongoose")
const mailer = require("../utils/mailer")
const { verifyEmail } = require("../mail/emailVerification")

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        await mailer(email, "Email Verification by StudyNotion", verifyEmail(otp))
    } catch (err) {
        console.log(err)
        throw new Error(err)
    }
}

otpSchema.pre("save", async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp)
    }
})

const Otp = mongoose.model("Otp", otpSchema)
module.exports = Otp