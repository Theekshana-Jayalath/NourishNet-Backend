import Delivery from "../models/Delivery.js";
import Driver from "../models/Driver.js";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import { notify } from "../utils/notification.util.js";

function pushHistory(delivery, status, message) {
  delivery.history.push({ status, message, at: new Date() });
}

async function autoPickAvailableDriver() {
  return await Driver.findOne({ isAvailable: true }).sort({ updatedAt: 1 });
}

async function findDriverByIdOrUserId(driverId) {
  let driver = await Driver.findById(driverId);
  if (driver) return driver;
  return Driver.findOne({ userId: driverId });
}

async function ensureDriverForUserId(driverId) {
  let driver = await findDriverByIdOrUserId(driverId);
  if (driver) return driver;

  let account = await User.findById(driverId);
  if (!account) {
    account = await Employee.findById(driverId);
  }

  const isDriver =
    account &&
    ((account.role || "").toString().toLowerCase() === "driver" ||
      (account.department || "").toString().toLowerCase() === "driver");

  if (!isDriver) return null;

  let safePhone = account.contact || account.username || `driver-${account._id}`;
  const samePhoneDriver = await Driver.findOne({ phone: safePhone });
  if (samePhoneDriver && String(samePhoneDriver.userId || "") !== String(account._id)) {
    safePhone = `${account._id}`;
  }

  return Driver.create({
    userId: account._id,
    name: account.name || account.username || "Driver",
    phone: safePhone,
    vehicleType: account.vehicleType || "Bike",
    plateNumber: account.vehicleNumber || "",
    isAvailable: true,
  });
}

async function createDelivery(payload, { autoAssign = false } = {}) {
  const delivery = new Delivery(payload);

  if (autoAssign) {
    const driver = await autoPickAvailableDriver();
    if (driver) {
      delivery.driverId = driver._id;
      delivery.status = "ASSIGNED";
      pushHistory(delivery, "ASSIGNED", `Auto-assigned to driver: ${driver.name}`);
      driver.isAvailable = false;
      await driver.save();

      notify({
        to: `Driver:${driver.phone}`,
        title: "New Delivery Assigned",
        message: `Pickup: ${delivery.pickup.address} → Drop: ${delivery.drop.address}`,
        meta: { deliveryId: delivery._id },
      });
    }
  }

  await delivery.save();
  return delivery;
}

async function listDeliveries({ page = 1, limit = 10, status, q, driverId } = {}) {
  page = Number(page);
  limit = Math.min(Number(limit), 50);
  const filter = {};

  if (status) filter.status = status;
  if (driverId) {
    const resolved = await findDriverByIdOrUserId(driverId);
    filter.driverId = resolved ? resolved._id : driverId;
  }

  if (q) {
    filter.$or = [
      { "pickup.address": { $regex: q, $options: "i" } },
      { "drop.address": { $regex: q, $options: "i" } },
      { donationId: { $regex: q, $options: "i" } },
      { ngoId: { $regex: q, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Delivery.find(filter)
      .populate("driverId", "name phone vehicleType plateNumber isAvailable")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Delivery.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getDeliveryById(id) {
  const delivery = await Delivery.findById(id).populate(
    "driverId",
    "name phone vehicleType plateNumber isAvailable"
  );
  if (!delivery) throw new Error("Delivery not found");
  return delivery;
}

async function assignDriver(deliveryId, driverId) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new Error("Delivery not found");

  const newDriver = await ensureDriverForUserId(driverId);
  if (!newDriver) throw new Error("Driver not found");
  if (!newDriver.isAvailable) throw new Error("Driver is not available");

  if (delivery.driverId) {
    const oldDriver = await Driver.findById(delivery.driverId);
    if (oldDriver) {
      oldDriver.isAvailable = true;
      await oldDriver.save();
    }
  }

  delivery.driverId = newDriver._id;
  delivery.status = "ASSIGNED";
  pushHistory(delivery, "ASSIGNED", `Assigned/Reassigned to driver: ${newDriver.name}`);
  await delivery.save();

  newDriver.isAvailable = false;
  await newDriver.save();

  notify({
    to: `Driver:${newDriver.phone}`,
    title: "Delivery Assigned",
    message: `Delivery #${delivery._id} assigned. Pickup: ${delivery.pickup.address}`,
    meta: { deliveryId: delivery._id },
  });

  return getDeliveryById(delivery._id);
}

async function updateStatus(deliveryId, nextStatus, message = "") {
  const allowed = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(nextStatus)) throw new Error("Invalid status update");

  const delivery = await Delivery.findById(deliveryId).populate("driverId");
  if (!delivery) throw new Error("Delivery not found");

  delivery.status = nextStatus;
  pushHistory(delivery, nextStatus, message || `Status changed to ${nextStatus}`);

  if (nextStatus === "DELIVERED" || nextStatus === "CANCELLED") {
    if (delivery.driverId) {
      const driver = await Driver.findById(delivery.driverId._id);
      if (driver) {
        driver.isAvailable = true;
        await driver.save();
      }
    }
  }

  await delivery.save();

  notify({
    to: `System`,
    title: "Delivery Status Updated",
    message: `Delivery ${delivery._id} is now ${nextStatus}`,
    meta: { deliveryId: delivery._id },
  });

  return getDeliveryById(delivery._id);
}

async function updateDelivery(deliveryId, patch) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new Error("Delivery not found");

  const editable = ["pickup", "drop", "items", "notes", "scheduledAt"];
  for (const key of editable) {
    if (patch[key] !== undefined) delivery[key] = patch[key];
  }

  pushHistory(delivery, delivery.status, "Delivery details updated");
  await delivery.save();

  return getDeliveryById(delivery._id);
}

async function cancelDelivery(deliveryId, reason = "Cancelled by admin") {
  const delivery = await Delivery.findById(deliveryId).populate("driverId");
  if (!delivery) throw new Error("Delivery not found");

  delivery.status = "CANCELLED";
  delivery.cancelledReason = reason;
  pushHistory(delivery, "CANCELLED", reason);

  if (delivery.driverId) {
    const driver = await Driver.findById(delivery.driverId._id);
    if (driver) {
      driver.isAvailable = true;
      await driver.save();
    }
  }

  await delivery.save();
  return getDeliveryById(delivery._id);
}

async function deleteDelivery(deliveryId) {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new Error("Delivery not found");

  if (delivery.driverId) {
    const driver = await Driver.findById(delivery.driverId);
    if (driver) {
      driver.isAvailable = true;
      await driver.save();
    }
  }

  await Delivery.deleteOne({ _id: deliveryId });
  return { message: "Delivery deleted" };
}

export default {
  createDelivery,
  listDeliveries,
  getDeliveryById,
  assignDriver,
  updateStatus,
  updateDelivery,
  cancelDelivery,
  deleteDelivery,
};