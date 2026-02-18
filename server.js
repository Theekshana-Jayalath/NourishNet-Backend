import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";

dotenv.config(); // load env first

const app = express();

// Test route
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

const PORT = 3000;

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
