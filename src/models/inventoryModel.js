import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCategory: { type: String, required: true },
  unit: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  nearestExpiry: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Inventory", inventorySchema);