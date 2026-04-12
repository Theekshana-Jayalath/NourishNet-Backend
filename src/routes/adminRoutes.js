import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddlewares.js";
import { getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

router.get('/stats', verifyToken, authorizeRoles('admin'), getAdminStats);

export default router;
