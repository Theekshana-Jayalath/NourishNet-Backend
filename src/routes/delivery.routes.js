import express from "express";
import ctrl from "../controllers/delivery.controller.js";

const router = express.Router();

router.get("/public", ...ctrl.validators.list, ctrl.handleValidation, ctrl.listDeliveries);
router.post("/", ...ctrl.validators.create, ctrl.handleValidation, ctrl.createDelivery);
router.get("/", ...ctrl.validators.list, ctrl.handleValidation, ctrl.listDeliveries);
router.get("/:id", ...ctrl.validators.idParam, ctrl.handleValidation, ctrl.getDelivery);
router.put("/:id/assign", ...ctrl.validators.assign, ctrl.handleValidation, ctrl.assignDriver);
router.put("/:id/status", ...ctrl.validators.status, ctrl.handleValidation, ctrl.updateStatus);
router.put("/:id", ...ctrl.validators.idParam, ctrl.handleValidation, ctrl.updateDelivery);
router.put("/:id/cancel", ...ctrl.validators.idParam, ctrl.handleValidation, ctrl.cancelDelivery);
router.delete("/:id", ...ctrl.validators.idParam, ctrl.handleValidation, ctrl.deleteDelivery);

export default router;