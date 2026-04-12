// server.js
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js"; // Import 'app' from index.js

import donationRoute from "./src/routes/DonationFormRoute.js"; // Your donation route
import authRoutes from "./src/routes/authRoutes.js"; // Your auth routes
import userRoutes from "./src/routes/userRoutes.js"; // Your user routes
import applicationRoutes from "./src/routes/applicationRoutes.js"; // Your application routes
import deliveryRoutes from "./src/routes/delivery.routes.js";
import ngoManagerRoutes from "./src/routes/ngoManagerRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config(); // Load environment variables from .env


// Connect to the database
connectDB();


// Add all your routes to the app

app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/users", userRoutes); // User routes
app.use("/api/applications", applicationRoutes); // Application routes
app.use("/donationForms", donationRoute); // Donation routes
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/ngo-manager", ngoManagerRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});