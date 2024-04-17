const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  videoUrl: {
    type: String,
    trim: true,
    required: true,
  },
  timeDuration: {
    type: String,
    trim: true,
    required: true,
  },
});

const SubSection = mongoose.model("SubSection", subSectionSchema);
module.exports = SubSection;
