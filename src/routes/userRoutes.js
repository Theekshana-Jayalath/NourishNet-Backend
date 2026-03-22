import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddlewares.js";
const router = express.Router();

//only admin can access this router
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
    res.json({ message : "Welcome Admin"});
});

//both admin and manager can access this router
router.get("/manager", verifyToken, authorizeRoles("admin", "manager"), (req, res) => {
    res.json({ message : "Welcome Manager"});
});

//Both admin, manager and Donor can access this router
router.get("/donor",verifyToken, authorizeRoles("admin", "manager", "donor"), (req, res) => {
    res.json({ message : "Welcome Donor"});
});

//Both admin, manager and NGO can access this router
router.get("/ngo", verifyToken, authorizeRoles("admin", "manager", "ngo"), (req, res) => {
    res.json({ message : "Welcome NGO"});
});

//Both admin, manager and Driver can access this router
router.get("/driver", verifyToken, authorizeRoles("admin", "manager", "driver"), (req, res) => {
    res.json({ message : "Welcome Driver"});
});

export default router;
