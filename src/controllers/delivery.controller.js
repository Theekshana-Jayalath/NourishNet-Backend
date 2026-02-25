import { body, param, query, validationResult } from "express-validator";
import deliveryService from "../services/delivery.service.js";

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

const validators = {
  create: [
    body("deliverType").isIn(["pickup", "drop"]).withMessage("deliverType must be 'pickup' or 'drop'"),
    body("donationId")
      .optional({ checkFalsy: true })
      .isString()
      .custom((value, { req }) => {
        if (req.body.deliverType === "pickup" && !value) throw new Error("donationId required");
        return true;
      }),
    body("ngoId")
      .optional({ checkFalsy: true })
      .isString()
      .custom((value, { req }) => {
        if (req.body.deliverType === "drop" && !value) throw new Error("ngoId required");
        return true;
      }),
    body("pickup").custom((value, { req }) => {
      if (req.body.deliverType === "pickup" && (!value || !value.address)) {
        throw new Error("pickup.address is required");
      }
      return true;
    }),
    body("drop").custom((value, { req }) => {
      if (req.body.deliverType === "drop" && (!value || !value.address)) {
        throw new Error("drop.address is required");
      }
      return true;
    }),
    body("items").isArray({ min: 1 }).withMessage("At least one item required"),
    body("items.*.name").isString().notEmpty(),
    body("items.*.qty").isInt({ min: 1 }),
  ],
  idParam: [param("id").isMongoId()],
  list: [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("status").optional().isString(),
    query("q").optional().isString(),
    query("driverId").optional().isMongoId(),
  ],
  assign: [param("id").isMongoId(), body("driverId").isMongoId()],
  status: [param("id").isMongoId(), body("status").isString().notEmpty(), body("message").optional()],
};

// Controllers
async function createDelivery(req, res, next) {
  try {
    const autoAssign = req.query.autoAssign === "true";
    const delivery = await deliveryService.createDelivery(req.body, { autoAssign });
    res.status(201).json(delivery);
  } catch (err) {
    next(err);
  }
}

async function listDeliveries(req, res, next) {
  try {
    const data = await deliveryService.listDeliveries(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getDelivery(req, res, next) {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    res.json(delivery);
  } catch (err) {
    next(err);
  }
}

async function assignDriver(req, res, next) {
  try {
    const updated = await deliveryService.assignDriver(req.params.id, req.body.driverId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const updated = await deliveryService.updateStatus(req.params.id, req.body.status, req.body.message);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function updateDelivery(req, res, next) {
  try {
    const updated = await deliveryService.updateDelivery(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function cancelDelivery(req, res, next) {
  try {
    const updated = await deliveryService.cancelDelivery(req.params.id, req.body.reason);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteDelivery(req, res, next) {
  try {
    const result = await deliveryService.deleteDelivery(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export default {
  validators,
  handleValidation,
  createDelivery,
  listDeliveries,
  getDelivery,
  assignDriver,
  updateStatus,
  updateDelivery,
  cancelDelivery,
  deleteDelivery,
};