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
            // map frontend managerType to employee.department
            const managerType = (req.body.managerType || '').toString().toUpperCase()
            let department = null
            if (managerType.includes('NGO')) department = 'ngo'
            else if (managerType.includes('DRIVER')) department = 'driver'
            else if (managerType.includes('DONOR')) department = 'donor'

            const newEmp = new Employee({ name: name || username, email: email || '', username, password: hashed, role: 'manager', status: 'ACTIVE', department });
            await newEmp.save();
            console.log('[userRoutes] created employee id:', newEmp._id.toString())
            const resp = { id: newEmp._id, name: newEmp.name, email: newEmp.email, username: newEmp.username, role: newEmp.role, status: newEmp.status, source: 'employee', managerType: department ? (department.toUpperCase() + '_MANAGER') : null }
            return res.status(201).json({ user: resp });
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

// helper: list users
// Admins can list all users. Managers may list users for their own department in some cases.
router.get("/", verifyToken, async (req, res) => {
    try {
        const { role } = req.query
        const requesterRole = (req.user?.role || '').toString().toLowerCase()

        // If a role filter is provided, enforce permissions per requested role
        if (role) {
            const r = role.toString().toLowerCase()

            // Managers asking for manager list: only admins may request all managers
            if (r === 'manager') {
                if (requesterRole !== 'admin') return res.status(403).json({ message: 'Access denied' });
                const emps = await Employee.find().sort({ createdAt: -1 });
                const mapped = emps.map(e => {
                    const obj = e.toObject()
                    obj.managerType = e.department ? (e.department.toUpperCase() + '_MANAGER') : null
                    return obj
                })
                return res.status(200).json(mapped);
            }

            // Allow admins to fetch any role
            if (requesterRole === 'admin') {
                const filtered = await User.find({ role: r }).sort({ createdAt: -1 });
                return res.status(200).json(filtered);
            }

            // Allow manager of a specific department to fetch users of that department (e.g., donor managers -> donors)
            if (requesterRole === 'manager') {
                const dept = (req.user?.department || '').toString().toLowerCase();
                if (r === 'donor' && dept === 'donor') {
                    const filtered = await User.find({ role: r }).sort({ createdAt: -1 });
                    return res.status(200).json(filtered);
                }

                // NGO manager has its own endpoint; deny other role queries
                return res.status(403).json({ message: 'Access denied' });
            }

            // other roles are not permitted to list users
            return res.status(403).json({ message: 'Access denied' });
        }

        // No role filter: only admins may fetch combined lists
        if (requesterRole !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const users = await User.find().sort({ createdAt: -1 });
        const employees = await Employee.find().sort({ createdAt: -1 });
        const combined = [...users, ...employees];
        res.status(200).json(combined);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// get single user/employee by id
// Accessible by: admin (any), manager of department 'donor' (but only for donor users), and a user for their own record
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const requester = req.user || {};
        const requesterRole = (requester.role || '').toString().toLowerCase();

        let user = null;

        // try find by ObjectId in users collection
        try { user = await User.findById(id); } catch (e) { user = null }

        // fallback to employee
        if (!user) {
            try { user = await Employee.findById(id); } catch (e) { user = null }
        }

        // final fallback: try username lookup
        if (!user) {
            user = await User.findOne({ username: id }) || await Employee.findOne({ username: id });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Allow admins
        if (requesterRole === 'admin') return res.status(200).json({ data: user });

        // Allow the user to fetch their own record
        const requesterId = requester.id || (requester._id ? requester._id.toString() : null);
        const targetId = user._id ? user._id.toString() : (user.id ? user.id.toString() : null);
        if (requesterId && targetId && requesterId.toString() === targetId.toString()) {
            return res.status(200).json({ data: user });
        }

        // Allow manager of donor department to fetch donor users only
        if (requesterRole === 'manager') {
            const dept = (requester.department || '').toString().toLowerCase();
            const targetRole = (user.role || '').toString().toLowerCase();
            if (dept === 'donor' && targetRole === 'donor') {
                return res.status(200).json({ data: user });
            }
        }

        return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching user' });
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

    // map managerType to department if present in update
    if (update.managerType) {
        const mt = update.managerType.toString().toUpperCase()
        if (mt.includes('NGO')) update.department = 'ngo'
        else if (mt.includes('DRIVER')) update.department = 'driver'
        else if (mt.includes('DONOR')) update.department = 'donor'
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