import express from "express";
import {
  create,
  getAllDonationForms,
  getDonationFormById,
  update,
  deleteDonationForm,
  getMyDonationHistory,
  getMyPendingDonations,
} from "../controllers/DonationFormController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const route = express.Router();

route.post("/", create);

route.get("/my-history", authMiddleware, getMyDonationHistory);
route.get("/my-pending", authMiddleware, getMyPendingDonations);

route.get("/", getAllDonationForms);
route.get("/:id", getDonationFormById);
route.put("/:id", update);
route.delete("/:id", deleteDonationForm);

export default route;