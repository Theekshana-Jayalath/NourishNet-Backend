import mongoose from "mongoose";
import DonationFormModel from "../models/DonationFormModel.js";

// ✅ CREATE donation form
export const create = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const donationFormExist = await DonationFormModel.findOne({ productId });
    if (donationFormExist) {
      return res
        .status(409)
        .json({ message: "Donation form already exists for this productId" });
    }

    const newDonationForm = await DonationFormModel.create(req.body);

    return res.status(201).json({
      message: "Donation form created",
      data: newDonationForm,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// ✅ GET ALL donation forms
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

// ✅ GET donation form BY ID
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

// ✅ UPDATE donation form
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid donation form id" });
    }

    const updatedData = await DonationFormModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Donation form not found" });
    }

    return res.status(200).json({
      message: "Donation form updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// ✅ DELETE donation form
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