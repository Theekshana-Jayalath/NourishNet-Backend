// server.js

import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js"; 

import donationRoute from "./src/routes/DonationFormRoute.js"; 
import authRoutes from "./src/routes/authRoutes.js"; 
import userRoutes from "./src/routes/userRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js"; 
import displayRoutes from "./src/routes/displayRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";

dotenv.config();  // Load environment variables from .env

// Connect to the database
connectDB();

// All routes to the app
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/applications", applicationRoutes); 
app.use("/donationForms", donationRoute);
app.use("/api/display", displayRoutes);
app.use("/api/inventory", inventoryRoutes);

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});