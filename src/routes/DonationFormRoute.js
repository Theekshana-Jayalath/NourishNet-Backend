import express from "express";

import {
  create,
  getAllDonationForms,
  getDonationFormById,
  update,
  deleteDonationForm,
  getMyDonationHistory
} from "../controllers/DonationFormController.js";

const route = express.Router();

route.post("/", create);
route.get("/my-history", getMyDonationHistory);
route.get("/", getAllDonationForms);
route.get("/:id", getDonationFormById);
route.put("/:id", update);
route.delete("/:id", deleteDonationForm);

export default route;