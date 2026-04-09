import Driver from "../models/Driver.js";

// CREATE — POST /api/drivers
export const createDriver = async (req, res) => {
  try {
    const { name, phone, vehicleType, plateNumber, licenseNumber, isAvailable } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "name and phone are required" });
    }

    const existing = await Driver.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: "A driver with this phone number already exists" });
    }

    const driver = await Driver.create({
      name,
      phone,
      vehicleType: vehicleType || "Bike",
      plateNumber: plateNumber || "",
      licenseNumber: licenseNumber || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json(driver);
  } catch (err) {
    console.error("[driver.controller] create error:", err.message);
    res.status(500).json({ message: "Failed to create driver", error: err.message });
  }
};

// READ ALL — GET /api/drivers
export const getAllDrivers = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { vehicleType: { $regex: q, $options: "i" } },
        { licenseNumber: { $regex: q, $options: "i" } },
        { plateNumber: { $regex: q, $options: "i" } },
      ];
    }

    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    res.status(200).json(drivers);
  } catch (err) {
    console.error("[driver.controller] getAll error:", err.message);
    res.status(500).json({ message: "Failed to fetch drivers", error: err.message });
  }
};

// READ ONE — GET /api/drivers/:id
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.status(200).json(driver);
  } catch (err) {
    console.error("[driver.controller] getById error:", err.message);
    res.status(500).json({ message: "Failed to fetch driver", error: err.message });
  }
};

// UPDATE — PUT /api/drivers/:id
export const updateDriver = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "vehicleType", "plateNumber", "licenseNumber", "isAvailable"];
    const update = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    // Also accept `status` from frontend and map to isAvailable
    if (req.body.status !== undefined) {
      const normalized = String(req.body.status).toLowerCase();
      update.isAvailable = normalized.includes("available");
    }

    const driver = await Driver.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json(driver);
  } catch (err) {
    console.error("[driver.controller] update error:", err.message);
    res.status(500).json({ message: "Failed to update driver", error: err.message });
  }
};

// DELETE — DELETE /api/drivers/:id
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (err) {
    console.error("[driver.controller] delete error:", err.message);
    res.status(500).json({ message: "Failed to delete driver", error: err.message });
  }
};
