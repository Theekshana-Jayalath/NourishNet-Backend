import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";

/**
 * Create inventory from a donation item object.
 * If an inventory record with same itemName and expiryDate exists, increment quantity.
 * Otherwise create a new inventory document.
 * @param {{ itemName: string, category: string, quantity: number, expiryDate?: Date, sourceDonationId?: ObjectId }} item
 * @returns {Promise<Inventory>}
 */
export const createInventoryFromDonationItem = async (item, sourceDonationId = null) => {
  if (!item || !item.itemName || typeof item.quantity !== "number") {
    throw new Error("Invalid donation item data for inventory creation");
  }

  const query = {
    itemName: item.itemName,
    // allow null equality for expiryDate: both null or same date
    expiryDate: item.expiryDate || null,
  };

  // Try to find an existing inventory record
  const existing = await Inventory.findOne(query);

  if (existing) {
    existing.quantity = existing.quantity + item.quantity;
    // if sourceDonationId not set, prefer setting it to provided id (optional)
    if (!existing.sourceDonationId && sourceDonationId) existing.sourceDonationId = sourceDonationId;
    await existing.save();
    return existing;
  }

  const newDoc = await Inventory.create({
    itemName: item.itemName,
    category: item.category || "", // category optional fallback
    quantity: item.quantity,
    expiryDate: item.expiryDate || null,
    sourceDonationId: sourceDonationId || null,
  });

  return newDoc;
};

/**
 * Create inventory records for all items in a donation form.
 * Expects donation object with fields: items (array), _id (donation id), Status
 * Only processes items with status "received"
 */
export const createInventoryFromDonation = async (donation) => {
  if (!donation || !Array.isArray(donation.items) || donation.Status !== "Received") return;

  const results = [];

  for (const it of donation.items) {
    if (it.status !== "received") continue;

    // Map donation item fields to inventory schema
    const mapped = {
      itemName: it.productName || it.itemName || "Unknown",
      category: it.processingType || it.category || "General",
      quantity: it.quantity || 0,
      expiryDate: it.expirationDate || it.expiryDate || null,
    };

    // Only create if quantity > 0
    if (mapped.quantity > 0) {
      const inv = await createInventoryFromDonationItem(mapped, donation._id);
      results.push(inv);
    }
  }

  return results;
};

// GET ALL inventory items
export const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch inventory", errorMessage: error.message });
  }
};

// UPDATE inventory quantity
export const updateInventoryQuantity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid inventory id" });
    }

    const { quantity } = req.body;

    if (typeof quantity !== "number") {
      return res.status(400).json({ message: "quantity (number) is required in body" });
    }

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    item.quantity = quantity;
    await item.save();

    return res.status(200).json({ message: "Inventory updated", data: item });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update inventory", errorMessage: error.message });
  }
};

// DELETE inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid inventory id" });
    }

    const doc = await Inventory.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Inventory item not found" });

    return res.status(200).json({ message: "Inventory item deleted", data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete inventory item", errorMessage: error.message });
  }
};