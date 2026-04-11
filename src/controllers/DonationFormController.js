import mongoose from "mongoose";
import DonationFormModel from "../models/DonationFormModel.js";
import { buildInventory } from "./displayController.js";

// CREATE
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
      message: "Donation form created successfully",
      data: newDonationForm,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create donation form",
      errorMessage: error.message,
    });
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
    return res.status(500).json({
      message: "Failed to fetch donation forms",
      errorMessage: error.message,
    });
  }
};

// GET BY ID
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
    return res.status(500).json({
      message: "Failed to fetch donation form",
      errorMessage: error.message,
    });
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

    const existingDonation = await DonationFormModel.findById(id);

    if (!existingDonation) {
      return res.status(404).json({ message: "Donation form not found" });
    }

    const oldStatus = existingDonation.Status;

    const updatedData = await DonationFormModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // Rebuild inventory only when status changes to Received
    if (oldStatus !== "Received" && updatedData.Status === "Received") {
      await buildInventory();
    }

    return res.status(200).json({
      message: "Donation form updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update donation form",
      errorMessage: error.message,
    });
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
    return res.status(500).json({
      message: "Failed to delete donation form",
      errorMessage: error.message,
    });
  }
};

// DONATION HISTORY - RECEIVED ONLY
// GET /api/donationForms/my-history
export const getMyDonationHistory = async (req, res) => {
  try {
    const donorId = req.user?.id || req.user?._id;

    if (!donorId) {
      return res.status(400).json({
        message: "Authenticated donor ID not found",
      });
    }

    const forms = await DonationFormModel.find({
      donorId,
      Status: "Received",
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch donation history",
      errorMessage: error.message,
    });
  }
};

// PENDING DONATIONS - PENDING ONLY
// GET /api/donationForms/my-pending
export const getMyPendingDonations = async (req, res) => {
  try {
    const donorId = req.user?.id || req.user?._id;

    if (!donorId) {
      return res.status(400).json({
        message: "Authenticated donor ID not found",
      });
    }

    const forms = await DonationFormModel.find({
      donorId,
      Status: "Pending",
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pending donations",
      errorMessage: error.message,
    });
  }
};