const mongoose = require("mongoose");

exports.connectDB = () => {
  mongoose
    .connect(`${process.env.MONGODB_URL}/studynotion`)
    .then(() => {
      console.log(`MongoDB is connected Successfully`);
    })
    .catch((err) => {
      console.log(`Failed to connect to MongoDB: `, err.message);
      process.exit(1);
    });
};

