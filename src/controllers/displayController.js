import Display from "../models/displayModel.js";
import DonationForm from "../models/DonationFormModel.js";

/*
BUILD INVENTORY
*/
export const buildInventory = async (req, res) => {
  try {
    const donations = await DonationForm.find({ Status: "Received" });

    const inventoryMap = {};
    const today = new Date();

    donations.forEach(form => {
      form.items.forEach(item => {

        const key = item.productId + "_" + item.unit;

        if (!inventoryMap[key]) {
          inventoryMap[key] = {
            productName: item.productId,
            productCategory: item.processingType,
            unit: item.unit,
            totalQuantity: 0,
            nearestExpireDate: item.expirationDate,
            daysLeft: null,
            isExpiringSoon: false
          };
        }

        // add quantity
        inventoryMap[key].totalQuantity += item.quantity;

        // check nearest expiry
        if (
          item.expirationDate &&
          new Date(item.expirationDate) <
            new Date(inventoryMap[key].nearestExpireDate)
        ) {
          inventoryMap[key].nearestExpireDate = item.expirationDate;
        }
      });
    });

    // calculate daysLeft & isExpiringSoon AFTER loop
    Object.values(inventoryMap).forEach(item => {
      if (item.nearestExpireDate) {
        const diff =
          new Date(item.nearestExpireDate) - today;

        item.daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

        item.isExpiringSoon = item.daysLeft <= 3;
      }
    });

    const inventoryArray = Object.values(inventoryMap);

    await Display.deleteMany();
    const savedItems = await Display.insertMany(inventoryArray);

    res.status(200).json({
      message: "Inventory built successfully",
      data: savedItems
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
PUBLISH ITEM
*/
export const publishItem = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file?.filename;

    const updatedItem = await Display.findByIdAndUpdate(
      id,
      {
        image: image,
        published: true
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      message: "Item published successfully",
      data: updatedItem
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
GET DISPLAY ITEMS (FINAL SORT)
*/
export const getDisplayItems = async (req, res) => {
  try {
    const items = await Display.find({ published: true })
      .sort({ isExpiringSoon: -1, nearestExpireDate: 1 });

    res.status(200).json({
      count: items.length,
      data: items
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
DELETE ITEM
*/
export const deleteDisplayItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Display.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      message: "Item deleted",
      data: deleted
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};