import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import app from "./src/index.js";

dotenv.config();

// Connect to the database
connectDB();

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
