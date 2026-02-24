import express from "express";
import { updateInventory, getInventory } from "../controllers/inventoryController.js";

const router = express.Router();

// recalculate inventory from donations
router.post("/update", updateInventory);

// get all inventory items
router.get("/", getInventory);

export default router;