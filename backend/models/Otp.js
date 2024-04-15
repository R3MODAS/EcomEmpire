const mongoose = require("mongoose");
const mailer = require("../utils/mailer");
const { verifyEmail } = require("../mail/emailVerification");

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
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
    await mailer(email, `Email Verification by StudyNotion`, verifyEmail(otp));
  } catch (err) {
    console.log(err.message);
  }
}

otpSchema.pre("save", async function () {
  // if the document is saved then
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
});

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
