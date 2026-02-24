import Donation from "../models/donationFormModel.js";
import Inventory from "../models/inventoryModel.js";


// UPDATE INVENTORY (Calculate stock from received donations)
export const updateInventory = async (req, res) => {
  try {
    // Aggregate received donations
    const donations = await Donation.aggregate([
      { $match: { status: "received" } },

      {
        $group: {
          _id: {
            productName: "$productName",
            productCategory: "$productCategory",
            unit: "$unit"
          },
          totalQuantity: { $sum: "$quantity" },
          nearestExpiry: { $min: "$expirationDate" }
        }
      }
    ]);

    // Clear old inventory data
    await Inventory.deleteMany({});

    // Format aggregated data
    const formatted = donations.map(item => ({
      productName: item._id.productName,
      productCategory: item._id.productCategory,
      unit: item._id.unit,
      totalQuantity: item.totalQuantity,
      nearestExpiry: item.nearestExpiry
    }));

    // Insert new inventory records
    await Inventory.insertMany(formatted);

    res.status(200).json({
      message: "Inventory updated successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET INVENTORY LIST (for dashboard / display)
export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find()
      .sort({ nearestExpiry: 1 }); // sort by fast expiry

    res.status(200).json(items);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};