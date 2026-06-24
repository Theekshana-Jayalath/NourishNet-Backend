import Driver from "../models/Driver.js";
import User from "../models/userModel.js";

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
    const userFilter = { role: "driver", status: "ACTIVE" };

    if (q) {
      userFilter.$or = [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { contact: { $regex: q, $options: "i" } },
        { vehicleType: { $regex: q, $options: "i" } },
        { vehicleNumber: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(userFilter).sort({ createdAt: -1 });

    const drivers = await Promise.all(
      users.map(async (u) => {
        // Keep delivery assignment compatible by always returning a Driver document ID.
        let driver = await Driver.findOne({ userId: u._id });

        if (!driver && u.contact) {
          // Backward compatibility with older Driver documents created before userId link existed.
          driver = await Driver.findOne({ phone: u.contact });
          if (driver && !driver.userId) {
            driver.userId = u._id;
            await driver.save();
          }
        }

        if (!driver) {
          let safePhone = u.contact || `${u.username || `driver-${u._id}`}`;
          const samePhoneDriver = await Driver.findOne({ phone: safePhone });
          if (samePhoneDriver && String(samePhoneDriver.userId || "") !== String(u._id)) {
            safePhone = `${u._id}`;
          }

          driver = await Driver.create({
            userId: u._id,
            name: u.name || u.username || "Driver",
            phone: safePhone,
            vehicleType: u.vehicleType || "Bike",
            plateNumber: u.vehicleNumber || "",
            isAvailable: true,
          });
        }

        return {
          _id: driver._id,
          userId: u._id,
          name: u.name || u.username || driver.name,
          phone: u.contact || driver.phone,
          vehicleType: u.vehicleType || driver.vehicleType,
          plateNumber: u.vehicleNumber || driver.plateNumber,
          licenseNumber: u.licenseNumber || "",
          status: u.status,
          isAvailable: driver.isAvailable !== false,
          createdAt: driver.createdAt,
          updatedAt: driver.updatedAt,
        };
      })
    );

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
