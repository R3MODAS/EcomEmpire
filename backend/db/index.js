const mongoose = require("mongoose")

const connectDB = () => {
    mongoose.connect(`${process.env.MONGODB_URL}/studynotion`)
    .then(() => {
        console.log(`MongoDB is connected successfully`)
    })
    .catch((err) => {
        console.log(`Failed to connect to MongoDB with err: `,err)
        process.exit(1)
    })
}

module.exports = connectDB