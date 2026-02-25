import mongoose from "mongoose";

const donationFormSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    // Food-only category dropdown
    productCategory: {
      type: String,
      required: true,
      enum: [
        "Processed Food",
        "Unprocessed Food",
      ],
    },

    // Food type dropdown (dietary type)
    productType: {
      type: String,
      required: true,
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Halal"],
       required: function () {
        return this.productCategory === "Processed Food";
      },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Unit dropdown (enum)
    unit: {
      type: String,
      required: true,
      enum: ["Kg", "g", "L", "ml", "Packets", "Pieces"],
    },
    status:{
        type: String,
        enum: ["pending", "received", "rejected"],
        default: "pending"
    },
    expirationDate: {
      type: Date,
      required: true,
    },

    // Storage type dropdown 
    StorageType: {
      type: String,
      required: true,
      enum: ["Room Temperature", "Refrigerated", "Frozen", "Cool Place"],
    },

    // Status dropdown  with default
    Status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Recived"],
    },
  },
  { timestamps: true }
);


const DonationForm = mongoose.models.DonationForm || mongoose.model("DonationForm", donationFormSchema);

export default DonationForm;