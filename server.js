import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import deliveryRoutes from "./src/routes/delivery.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

// connect database
connectDB();

// routes
app.use("/api/deliveries", deliveryRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));