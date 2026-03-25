import mongoose from "mongoose";
import Counter from "./request/counter.model.js";

const applicationSchema = new mongoose.Schema({
     applicationId: {
         type: String,
         unique: true
     },
     name: { 
        type: String, 
        required: true 
    },
     email: {
         type: String, 
         required: true
    },
     contact: {
         type: String, 
         required: true
     },
     nic: {
         type: String,
          required: true
     },
     address: {
         type: String, 
         required: true
     },
     city: {
         type: String, 
         required: true
     },

     role: {
        type: String,
        enum: ["donor", "ngo", "driver"],
        required: true
    },

    // DONOR FIELD
    donorType: {
        type: String,
        required: function () {
            return this.role === "donor";
        }
    },

      // DRIVER FIELDS
    vehicleType: {
        type: String,
        required: function () {
            return this.role === "driver";
        }
    },

    vehicleNumber: {
        type: String,
        required: function () {
            return this.role === "driver";
        }
    },

    licenseNumber: {
        type: String,
        required: function () {
            return this.role === "driver";
        }
    },

    // NGO FIELDS
    registrationNumber: {
        type: String,
        required: function () {
            return this.role === "ngo";
        }
    },

    members: {
        type: [
            {
                name: { type: String, required: true },
                contact: { type: String, required: true }
            }
        ],
        validate: {
            validator: function (arr) {
                return this.role !== "ngo" || arr.length === 2;
            },
            message: "Exactly 2 members required for NGO"
        }
    },

    status: {
        type: String,
        default: "pending"
    },

    appliedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// ✅ Auto-generate applicationId safely
applicationSchema.pre("save", async function () {
  if (this.applicationId) return;

  const counter = await Counter.findOneAndUpdate(
    { name: "application" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  const padded = String(counter.seq).padStart(4, "0");
  this.applicationId = `AI${padded}`;
});

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);
export default Application;