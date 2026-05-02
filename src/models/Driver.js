import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      unique: true,
      sparse: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    vehicleType: { type: String, default: "Bike", trim: true },
    plateNumber: { type: String, default: "", trim: true },

    isAvailable: { type: Boolean, default: true },

    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },

    lastKnownLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);