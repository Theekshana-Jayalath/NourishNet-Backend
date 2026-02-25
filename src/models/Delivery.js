import mongoose from "mongoose";

const DELIVERY_STATUS = [
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const deliverySchema = new mongoose.Schema(
  {
    deliverType: {
      type: String,
      enum: ["pickup", "drop"],
      required: true,
    },

    donationId: { 
      type: String, 
      required: function () { return this.deliverType === "pickup"; }, 
      trim: true 
    },
    
    ngoId: { 
      type: String, 
      required: function () { return this.deliverType === "drop"; }, 
      trim: true 
    },

    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },

    pickup: {
      address: { type: String, required: function () { return this.deliverType === "pickup"; }, trim: true },
      contactName: { type: String, default: "", trim: true },
      contactPhone: { type: String, default: "", trim: true },
    },

    drop: {
      address: { type: String, required: function () { return this.deliverType === "drop"; }, trim: true },
      contactName: { type: String, default: "", trim: true },
      contactPhone: { type: String, default: "", trim: true },
    },

    items: [
      {
        name: { type: String, required: true, trim: true },
        qty: { type: Number, required: true, min: 1 },
        unit: { type: String, default: "pack", trim: true },
      },
    ],

    status: {
      type: String,
      enum: DELIVERY_STATUS,
      default: "CREATED",
    },

    scheduledAt: { type: Date, default: null },
    notes: { type: String, default: "", trim: true },

    history: [
      {
        status: { type: String, enum: DELIVERY_STATUS },
        message: { type: String, default: "" },
        at: { type: Date, default: Date.now },
      },
    ],

    cancelledReason: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// ✅ Fixed pre-save hook
deliverySchema.pre("save", function () {
  if (this.isNew) {
    this.history.push({
      status: this.status,
      message: "Delivery created",
      at: new Date(),
    });
  }
});

export default mongoose.model("Delivery", deliverySchema);