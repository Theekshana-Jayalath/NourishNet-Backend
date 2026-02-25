import mongoose from "mongoose";

const displaySchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory"
  },
  image: String,
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DisplayItem", displaySchema);