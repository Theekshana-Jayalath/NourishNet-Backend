import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddlewares.js";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// only admin can access this router for management operations
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
    res.json({ message: "Welcome Admin" });
});

// create user (admin-only)
router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const { name, email, username, password, role } = req.body;
        console.log('[userRoutes] create user request by admin:', req.user?.id, 'body:', { name, email, username, role })
        if (!username || !password) return res.status(400).json({ message: "Username and password required" });

        // uniqueness check
        // ensure username not present in either users or employees
        const existingUser = await User.findOne({ username });
        const existingEmp = await Employee.findOne({ username });
        if (existingUser || existingEmp) {
            console.log('[userRoutes] username taken, existingUser:', !!existingUser, 'existingEmp:', !!existingEmp)
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashed = await bcrypt.hash(password, 10);
        if (role && role.toString().toLowerCase() === 'manager') {
            const newEmp = new Employee({ name: name || username, email: email || '', username, password: hashed, role: 'manager', status: 'ACTIVE' });
            await newEmp.save();
            console.log('[userRoutes] created employee id:', newEmp._id.toString())
            return res.status(201).json({ user: { id: newEmp._id, name: newEmp.name, email: newEmp.email, username: newEmp.username, role: newEmp.role, status: newEmp.status, source: 'employee' } });
        }

        const newUser = new User({ name: name || username, email: email || '', username, password: hashed, role: role || 'manager', status: 'ACTIVE' });
    await newUser.save();
    console.log('[userRoutes] created user id:', newUser._id.toString())

    res.status(201).json({ user: { id: newUser._id, name: newUser.name, email: newUser.email, username: newUser.username, role: newUser.role, status: newUser.status, source: 'user' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// helper: list users (admin)
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        // Respect role query parameter: return employees for manager, users filtered for other roles
        const { role } = req.query
        if (role) {
            const r = role.toString().toLowerCase()
            if (r === 'manager') {
                const emps = await Employee.find().sort({ createdAt: -1 });
                return res.status(200).json(emps);
            }
            // return users filtered by role
            const filtered = await User.find({ role: r }).sort({ createdAt: -1 });
            return res.status(200).json(filtered);
        }

        // otherwise return combined users and employees
        const users = await User.find().sort({ createdAt: -1 });
        const employees = await Employee.find().sort({ createdAt: -1 });
        const combined = [...users, ...employees];
        res.status(200).json(combined);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// update employee (admin)
router.put("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const update = { ...req.body };

        // if password present, hash it
        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        }

    // try updating in both collections
    let updated = await User.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
        updated = await Employee.findByIdAndUpdate(id, update, { new: true });
    }
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating user" });
    }
});

// delete employee (admin) - also remove legacy User by username if exists
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const { id } = req.params;
    let user = await User.findById(id);
    if (user) {
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted" });
    }

    user = await Employee.findById(id);
    if (user) {
        await Employee.findByIdAndDelete(id);
        return res.status(200).json({ message: "Employee deleted" });
    }

    return res.status(404).json({ message: "User not found" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

// role-based welcome endpoints retained
router.get("/manager", verifyToken, authorizeRoles("admin", "manager"), (req, res) => {
    res.json({ message: "Welcome Manager" });
});

router.get("/donor", verifyToken, authorizeRoles("admin", "manager", "donor"), (req, res) => {
    res.json({ message: "Welcome Donor" });
});

router.get("/ngo", verifyToken, authorizeRoles("admin", "manager", "ngo"), (req, res) => {
    res.json({ message: "Welcome NGO" });
});

router.get("/driver", verifyToken, authorizeRoles("admin", "manager", "driver"), (req, res) => {
    res.json({ message: "Welcome Driver" });
});

export default router;
