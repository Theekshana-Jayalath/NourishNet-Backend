import express from "express";
import cors from "cors";
import requestRoutes from "./routes/request/request.routes.js";

const app = express();

//  CORS (IMPORTANT)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

//  JSON parser
app.use(express.json());

//  Your request routes
app.use("/api/requests", requestRoutes);

export default app;