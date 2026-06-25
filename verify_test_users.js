import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/userModel.js";
import Employee from "./src/models/employeeModel.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const testPasswords = ["123", "1234", "12345", "123456", "password", "admin", "pawan", "abc", "amal", "kasun", "sevidu", "amaya", "thusitha", "udula"];
    
    const users = await User.find({});
    const employees = await Employee.find({});
    
    console.log("Checking users...");
    for (const u of users) {
      for (const p of testPasswords) {
        if (await bcrypt.compare(p, u.password) || u.password === p) {
          console.log(`User found: username="${u.username}", role="${u.role}", password="${p}"`);
          break;
        }
      }
    }
    
    console.log("Checking employees...");
    for (const e of employees) {
      for (const p of testPasswords) {
        if (await bcrypt.compare(p, e.password) || e.password === p) {
          console.log(`Employee found: username="${e.username}", role="${e.role}", password="${p}"`);
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
