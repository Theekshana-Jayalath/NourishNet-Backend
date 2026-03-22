import mongoose from "mongoose";
import Counter from "./request/counter.model.js"; // ✅ ensure this path exists

// Fixed dropdown lists (IDs only)
export const UNPROCESSED_PRODUCTS = [
  { productId: "UNP001", label: "Rice" },
  { productId: "UNP002", label: "Dhal" },
  { productId: "UNP003", label: "Milk Powder" },
  { productId: "UNP004", label: "Flour" },
  { productId: "UNP005", label: "Sugar" },
  { productId: "UNP006", label: "Salt" },
];

export const PROCESSED_PRODUCTS = [
  { productId: "PRO001", label: "Vegetable Curry" },
  { productId: "PRO002", label: "Chicken Fried Rice" },
  { productId: "PRO003", label: "Egg Sandwich" },
  { productId: "PRO004", label: "Fish Curry" },
  { productId: "PRO005", label: "Dhal Curry (Cooked)" },
];

const UNPROCESSED_IDS = UNPROCESSED_PRODUCTS.map((p) => p.productId);
const PROCESSED_IDS = PROCESSED_PRODUCTS.map((p) => p.productId);

// Item schema (one product line)
const itemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },

    processingType: {
      type: String,
      required: true,
      enum: ["Unprocessed", "Processed"],
    },

    quantity: { type: Number, required: true, min: 1 },

    unit: {
      type: String,
      required: true,
      enum: ["Kg", "g", "L", "ml", "Packets", "Pieces"],
    },

    expirationDate: { type: Date },

    StorageType: {
      type: String,
      required: true,
      enum: ["Room Temperature", "Refrigerated", "Frozen", "Cool Place"],
    },
  },
  {
    _id: true, // MongoDB auto item _id
    strict: "throw",
  }
);

// Donation Form schema
const donationFormSchema = new mongoose.Schema(
  {
    // Human-friendly form id (DF0001...)
    donationFormId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    // The user who created it (donor userId)
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [itemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one product item is required.",
      },
    },

    Status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Received"],
    },
  },
  { timestamps: true, strict: "throw" }
);

// Validation: productId must match correct list based on processingType
donationFormSchema.pre("validate", function () {
  if (!this.items || this.items.length === 0) {
    throw new Error("Add at least one product item.");
  }

  for (const item of this.items) {
    if (item.processingType === "Unprocessed") {
      if (!UNPROCESSED_IDS.includes(item.productId)) {
        throw new Error("Invalid unprocessed productId selected.");
      }
    }

    if (item.processingType === "Processed") {
      if (!PROCESSED_IDS.includes(item.productId)) {
        throw new Error("Invalid processed productId selected.");
      }
    }
  }
});


// Auto-generate donationFormId (DF0001, DF0002...)
donationFormSchema.pre("save", async function () {
  if (this.donationFormId) return;

  const counterDoc = await Counter.findOneAndUpdate(
    { name: "donationForm" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  this.donationFormId = `DF${String(counterDoc.seq).padStart(4, "0")}`;
});

export default mongoose.model("DonationForm", donationFormSchema);