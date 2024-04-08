const mongoose = require("mongoose")

const profileSchema = new mongoose.Schema({
    about: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: String
    },
    gender: {
        type: String
    }
})

const Profile = mongoose.model("Profile", profileSchema)
module.exports = Profile