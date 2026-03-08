import mongoose from "mongoose";
import DonationFormModel from "../models/DonationFormModel.js";

/*
NEW PART
Import inventory builder
This will update the stock when donation becomes "Received"
*/
import { buildInventory } from "./displayController.js";

//CREATE 
export const create = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { donorId, items } = req.body;

    if (!donorId) {
      return res.status(400).json({ message: "donorId is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    const newDonationForm = await DonationFormModel.create({
      donorId,
      items,
      Status: "Pending",
    });

    return res.status(201).json({
      message: "Donation form created",
      data: newDonationForm,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// GET ALL 
export const getAllDonationForms = async (req, res) => {
  try {
    const donationForms = await DonationFormModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: donationForms.length,
      data: donationForms,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

//GET BY ID 
export const getDonationFormById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid donation form id" });
    }

    const donationForm = await DonationFormModel.findById(id);

    if (!donationForm) {
      return res.status(404).json({ message: "Donation form not found" });
    }

    return res.status(200).json({
      message: "Donation form retrieved successfully",
      data: donationForm,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// UPDATE
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid donation form id" });
    }

    // Prevent changing donorId / donationFormId
    if (req.body.donorId) delete req.body.donorId;
    if (req.body.donationFormId) delete req.body.donationFormId;

    // Prevent changing donorId / donationFormId
    if (req.body.donorId) delete req.body.donorId;
    if (req.body.donationFormId) delete req.body.donationFormId;

    const updatedData = await DonationFormModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedData) {
      return res.status(404).json({ message: "Donation form not found" });
    }
    

    /*
    NEW INVENTORY PART
    If donation status becomes "Received",
    rebuild inventory stock automatically
    */

    if (updatedData.Status === "Received") {
      await buildInventory(); 
    }


    return res.status(200).json({
      message: "Donation form updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// DELETE
export const deleteDonationForm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid donation form id" });
    }

    const donationForm = await DonationFormModel.findByIdAndDelete(id);

    if (!donationForm) {
      return res.status(404).json({ message: "Donation form not found" });
    }

    return res.status(200).json({
      message: "Donation form deleted successfully",
      data: donationForm,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// DONATION HISTORY 
// Call like: GET /api/donationForms/my-history?donorId=XXXXXXXX
export const getMyDonationHistory = async (req, res) => {
  try {
    const { donorId } = req.query;

    if (!donorId) {
      return res.status(400).json({ message: "donorId query param is required" });
    }

    const forms = await DonationFormModel.find({ donorId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};