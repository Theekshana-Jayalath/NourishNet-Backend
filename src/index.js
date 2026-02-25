// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");

// const deliveryRoutes = require("./routes/delivery.routes");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));

// // Health check
// app.get("/api/health", (req, res) => res.json({ status: "OK", service: "NourishNet" }));

// // Delivery module routes
// app.use("/api/deliveries", deliveryRoutes);

// // Global error handler (nice + clean)
// app.use((err, req, res, next) => {
//   console.error("❌ Error:", err.message);
//   res.status(500).json({ message: err.message || "Server error" });
// });

// module.exports = app;
