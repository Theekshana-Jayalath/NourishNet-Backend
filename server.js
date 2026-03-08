// server.js

import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js";
import donationRoute from "./src/routes/DonationFormRoute.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import deliveryRoutes from "./src/routes/delivery.routes.js";
import displayRoutes from "./src/routes/displayRoutes.js"


// Connect DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/display", displayRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});