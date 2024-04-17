const mongoose = require("mongoose");
const { verifyEmail } = require("../mail/verifyEmail");
const { mailer } = require("../utils/mailer");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    await mailer(email, "Email Verification | StudyNotion", verifyEmail(otp));
  } catch (err) {
    console.log(err.message);
  }
}

otpSchema.pre("save", async function () {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
});

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
