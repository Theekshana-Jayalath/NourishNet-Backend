import express from "express";
import {
  buildInventory,
  publishItem,
  getDisplayItems,
  deleteDisplayItem,
  getInventoryStats,
  updateInventoryQuantity,
} from "../controllers/displayController.js";
import upload from "../middleware/uploadImage.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(protect);

// Build inventory from received donations (Admin only)
router.get("/build-inventory", authorize("admin", "ngoManager"), buildInventory);

// Publish inventory item (Admin/NGO Manager only)
router.put("/publish/:id", authorize("admin", "ngoManager"), upload.single("image"), publishItem);

// Get display items (Public - for viewing available food)
router.get("/items", getDisplayItems);

// Get inventory statistics (Admin/NGO Manager only)
router.get("/stats", authorize("admin", "ngoManager"), getInventoryStats);

// Update inventory quantity (Admin/NGO Manager only)
router.patch("/update-quantity/:id", authorize("admin", "ngoManager"), updateInventoryQuantity);

// Delete/Unpublish display item (Admin only)
router.delete("/delete/:id", authorize("admin"), deleteDisplayItem);

export default router;