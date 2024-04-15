const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  about: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: String,
    trim: true,
  },
});

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
