const mongoose = require("mongoose")

const subSectionSchema = new mongoose.Schema({
    title: String,
    timeDuration: String,
    description: String,
    videoUrl: String
})

const SubSection = mongoose.model("SubSection", subSectionSchema)
module.exports = SubSection

