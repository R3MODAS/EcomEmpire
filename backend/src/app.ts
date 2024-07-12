import express, { Express } from "express";
import userRoutes from "./routes/userRoutes.js";

// Configurations
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API endpoints are working ✨",
    });
});

// Routes
app.use("/api/v1/user", userRoutes);

export default app;
