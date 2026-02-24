// src/index.js

import express from "express";
import requestRoutes from "./routes/request/request.routes.js";  // Corrected path for request routes

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Register the routes
app.use("/api/requests", requestRoutes);  // Routes for requests

export default app;  // Export 'app' so it can be used in server.js