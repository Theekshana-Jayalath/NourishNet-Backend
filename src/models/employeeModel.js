import mongoose from "mongoose";
import Counter from "./request/counter.model.js";

const employeeSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: false,
        unique: false
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "manager", "ngo" , "donor" , "driver"],
        default: "manager"
    },
    status: {
        type: String,
        enum: ['ACTIVE','INACTIVE'],
        default: 'ACTIVE'
    },

}, { timestamps: true });

// Auto-generate userId safely for employees
employeeSchema.pre("save", async function () {
  if (this.userId) return;

  const counter = await Counter.findOneAndUpdate(
    { name: "user" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  const padded = String(counter.seq).padStart(4, "0");
  this.userId = `UI${padded}`;
});

// Force collection name to 'employees'
const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema, "employees");
export default Employee;
