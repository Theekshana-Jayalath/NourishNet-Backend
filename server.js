import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./src/config/mongodb.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// connect database
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

