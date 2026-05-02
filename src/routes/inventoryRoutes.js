import express from "express";
import {
  getAllInventory,
  updateInventoryQuantity,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

// GET /inventory
router.get("/", getAllInventory);

// PUT /inventory/:id -> update quantity
router.put("/:id", updateInventoryQuantity);

// DELETE /inventory/:id
router.delete("/:id", deleteInventoryItem);

export default router;