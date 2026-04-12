import express from "express";
import cors from "cors";
import requestRoutes from "./routes/request/request.routes.js";
import donationRoute from "./routes/DonationFormRoute.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import ngoManagerRoutes from "./routes/ngoManagerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// CORS (IMPORTANT)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nourishnet-zeta.vercel.app",
      "https://nourishnet-backend-production.up.railway.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// JSON parser
app.use(express.json());

// Your routes
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/donationForms", donationRoute);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/ngo-manager", ngoManagerRoutes);
app.use("/api/admin", adminRoutes);

export default app;
