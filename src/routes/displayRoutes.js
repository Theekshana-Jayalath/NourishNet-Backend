import express from "express";
import {
buildInventory,
publishItem,
getDisplayItems,
deleteDisplayItem
} from "../controllers/displayController.js";

import upload from "../middleware/uploadImage.js";

const router = express.Router();

router.get("/build-inventory",buildInventory);

router.put("/publish/:id",upload.single("image"),publishItem);

router.get("/items",getDisplayItems);

router.delete("/delete/:id",deleteDisplayItem);

export default router;