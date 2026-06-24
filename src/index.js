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

const allowedOrigins = [
  "http://localhost:5173",
  "https://nourishnet-zeta.vercel.app",
  "https://nourishnet-backend-production.up.railway.app",
  "https://nourishnetzh.vercel.app"
];

if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

// CORS (IMPORTANT)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
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
