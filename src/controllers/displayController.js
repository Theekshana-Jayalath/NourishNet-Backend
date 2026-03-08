import DisplayItem from "../models/displayModel.js";
import InventoryModel from "../models/inventoryModel.js";


// Build display items from inventory
export const buildInventory = async () => {
  try {
    // Get all inventory items
    const inventoryItems = await InventoryModel.find();

    // Optional: clear old display items before rebuilding
    await DisplayItem.deleteMany({});

    // Create new display items from inventory
    const displayItems = inventoryItems.map((item) => ({
      inventoryId: item._id,
      image: item.image || "",
      published: true,
    }));

    if (displayItems.length > 0) {
      await DisplayItem.insertMany(displayItems);
    }

    return displayItems;
  } catch (error) {
    throw new Error(`Failed to build inventory: ${error.message}`);
  }
};


// Publish item (Admin action)
export const publishItem = async (req, res) => {
  try {
    const { inventoryId, image } = req.body;

    if (!inventoryId) {
      return res.status(400).json({ message: "inventoryId is required" });
    }

    const item = await DisplayItem.create({
      inventoryId,
      image: image || "",
      published: true,
    });

    return res.status(201).json({
      message: "Item published successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get display items sorted by fastest expiry
export const getDisplayItems = async (req, res) => {
  try {
    const items = await DisplayItem.find({ published: true })
      .populate("inventoryId");

    // Sort manually after populate
    const sortedItems = items.sort((a, b) => {
      const dateA = a.inventoryId?.nearestExpiry
        ? new Date(a.inventoryId.nearestExpiry)
        : new Date("9999-12-31");

      const dateB = b.inventoryId?.nearestExpiry
        ? new Date(b.inventoryId.nearestExpiry)
        : new Date("9999-12-31");

      return dateA - dateB;
    });

    return res.status(200).json({
      count: sortedItems.length,
      data: sortedItems,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};