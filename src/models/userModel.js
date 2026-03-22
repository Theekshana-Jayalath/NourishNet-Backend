import mongoose from "mongoose";
import Counter from "./request/counter.model.js";

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "manager", "ngo" , "donor" , "driver"],
        default: "admin"
    },

}, { timestamps: true });

// ✅ Auto-generate userId safely
userSchema.pre("save", async function () {
  if (this.userId) return;

  const counter = await Counter.findOneAndUpdate(
    { name: "user" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  const padded = String(counter.seq).padStart(4, "0");
  this.userId = `UI${padded}`;
});


const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;