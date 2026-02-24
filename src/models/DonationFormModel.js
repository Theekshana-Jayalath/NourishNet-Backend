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

}, { timestamps: true })





export default mongoose.model("DonationForm", donationFormSchema)