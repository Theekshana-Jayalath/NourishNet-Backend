import mongoose from "mongoose";
import Counter from "./counter.model.js";

const requestedItemSchema = new mongoose.Schema(
  {
    // user types this (keyboard input)
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true, trim: true }, // kg, meals, packs...
    category: { type: String, trim: true } // optional
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    // Auto-generated: RE0001, RE0002...
    requestId: { type: String, unique: true, index: true },

    // now required from logged-in NGO user
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    organizationName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },

    peopleCount: { type: Number, required: true, min: 1 },
    urgencyLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },

    neededBefore: { type: Date, required: true },

    location: {
      address: { type: String, required: true, trim: true }
    },

    // REQUIRED: user must add at least 1 item
    requestedItems: {
      type: [requestedItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "requestedItems must contain at least one item"
      }
    },

    dietaryNeeds: { type: [String], default: [] }, // optional
    notes: { type: String, trim: true }, // optional

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PARTIALLY_APPROVED", "WAITLISTED", "FULFILLED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

// FIXED: Auto-generate requestId without using next() in async hook (Mongoose 7+)
requestSchema.pre("save", async function () {
  if (this.requestId) return;

  const counter = await Counter.findOneAndUpdate(
    { name: "request" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(4, "0"); // 0001
  this.requestId = `RE${padded}`; // RE0001
});

export default mongoose.model("Request", requestSchema);