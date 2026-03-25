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
     // legacy field names — make optional and accept frontend equivalents
     contact: {
         type: String,
         required: false
     },
     nic: {
         type: String,
         required: false
     },
     address: {
         type: String,
         required: false
     },
     city: {
         type: String,
         required: false
     },

    // frontend field aliases

     role: {
        type: String,
        enum: ["donor", "ngo", "driver"],
        required: true
    },

    // optional credentials supplied by applicant
    username: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: false
    },

    // DONOR FIELD (support both donorType and donationType keys)
    donorType: {
        type: String,
        required: false
    },
    donationType: {
        type: String,
        // frontend may send `donorType`; only require `donationType` when role is donor AND donorType wasn't provided
        required: function () {
            return this.role === "donor" && !this.donorType;
        }
    },

      // DRIVER FIELDS
    vehicleType: {
        type: String,
        required: false
    },

    vehicleNumber: {
        type: String,
        required: false
    },

    licenseNumber: {
        type: String,
        required: false
    },

    // NGO FIELDS
    registrationNumber: {
        type: String,
        required: false
    },

    // frontend organization name
    organizationName: { type: String, required: false },

    members: {
        type: [
            {
                name: { type: String, required: true },
                contact: { type: String, required: true }
            }
        ],
        validate: {
            validator: function (arr) {
                if (this.role !== "ngo") return true;
                // members are optional for NGOs; if provided, ensure it's an array of at least one member
                if (arr === undefined || arr === null) return true;
                if (!Array.isArray(arr)) return false;
                return arr.length >= 1;
            },
            message: "Members must be an array of member objects when provided"
        }
    },

    status: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected"]
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