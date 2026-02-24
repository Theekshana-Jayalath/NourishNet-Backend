import mongoose from "mongoose";

const donationFormSchema = new mongoose.Schema({

    productId:{
        type: String,
        required: true
    },
    productName:{
        type: String,
        required: true
    },
    productCategory:{
        type: String,
        required: true
    },
    productType:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    unit:{
        type: String,
        required: true
    },
    expirationDate:{
        type: Date,
        required: true
    },
    StorageType:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ["pending", "received", "rejected"],
        default: "pending"
    }
    

}, { timestamps: true })

const DonationForm = mongoose.models.DonationForm || mongoose.model("DonationForm", donationFormSchema);

export default DonationForm;