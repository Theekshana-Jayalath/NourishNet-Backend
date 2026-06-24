import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    sourceDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationForm",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    strict: "throw",
  }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;