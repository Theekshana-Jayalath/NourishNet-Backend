import DisplayItem from "../models/displayModel.js";


// Publish item (Admin action)
export const publishItem = async (req, res) => {
  try {
    const { inventoryId, image } = req.body;

    const item = await DisplayItem.create({
      inventoryId,
      image
    });

    res.status(201).json(item);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get display items sorted by fastest expiry
export const getDisplayItems = async (req, res) => {
  try {
    const items = await DisplayItem.find({ published: true })
      .populate("inventoryId")
      .sort({ "inventoryId.nearestExpiry": 1 });

    res.status(200).json(items);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};