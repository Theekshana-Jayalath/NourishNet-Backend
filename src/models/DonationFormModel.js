import mongoose from "mongoose";
import Counter from "./request/counter.model.js"; // ✅ ensure this path exists

// Fixed dropdown lists
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

const ALL_PRODUCTS = [...UNPROCESSED_PRODUCTS, ...PROCESSED_PRODUCTS];

const UNPROCESSED_IDS = UNPROCESSED_PRODUCTS.map((p) => p.productId);
const PROCESSED_IDS = PROCESSED_PRODUCTS.map((p) => p.productId);

// Item schema
const itemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },

    productName: {
      type: String,
      trim: true,
    },

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
    _id: true,
    strict: "throw",
  }
);

// Donation Form schema
const donationFormSchema = new mongoose.Schema(
  {
    donationFormId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

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

// Validate and set productName
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

    const matchedProduct = ALL_PRODUCTS.find(
      (p) => p.productId === item.productId
    );

    if (!matchedProduct) {
      throw new Error(`Product name not found for productId: ${item.productId}`);
    }

    item.productName = matchedProduct.label;
  }
});

// Auto-generate donationFormId
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