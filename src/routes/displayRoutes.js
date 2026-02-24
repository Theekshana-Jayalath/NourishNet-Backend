import express from "express";
import { publishItem, getDisplayItems } from "../controllers/displayController.js";

const router = express.Router();


//routes
router.post("/publish", publishItem);
router.get("/", getDisplayItems);

export default router;