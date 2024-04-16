const app = require("./app");
const { connectDB } = require("./db/index");
const { connectCloudinary } = require("./utils/cloudinary");
process.loadEnvFile();

const PORT = process.env.PORT || 5000;

connectDB();
connectCloudinary();

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
