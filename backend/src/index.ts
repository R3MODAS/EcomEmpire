import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "src/.env" });
const PORT = process.env.PORT || 6000;

connectDB();
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
