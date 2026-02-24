import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import donationRoute from "./src/routes/DonationFormRoute.js";


dotenv.config();

const app = express();

app.use(express.json());

app.use("/donationForms", donationRoute);

// connect database
connectDB();



const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API Working 🚀");
});
