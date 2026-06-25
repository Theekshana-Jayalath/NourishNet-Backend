import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";

// Register
export const register = async (req, res) => {
  try {
    const {
      username,
      password,
      role,
      name,
      email,
      nic,
      address,
      city,
      organizationName,
      registrationNumber,
      contact
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (also acts as employee record)
    const newUser = new User({
      name: name || username,
      email: email || "",
      username,
      password: hashedPassword,
      role,
      status: "ACTIVE",

      // Added profile fields
      nic: nic || "",
      address: address || "",
      city: city || "",
      organizationName: organizationName || "",
      registrationNumber: registrationNumber || "",
      contact: contact || ""
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // debug: log login attempt (do NOT log password)
    console.log("[auth] login attempt - username:", username, "role:", role);

    // lookup by username in users first, then employees
    const query = { username };
    console.log("[auth] login query:", query);

    let account = await User.findOne(query);
    let accountSource = "user";

    if (!account) {
      // try employees collection (managers stored here)
      account = await Employee.findOne(query);
      accountSource = account ? "employee" : "user";
    }

    console.log(
      "[auth] lookup result:",
      !!account,
      account ? { id: account._id, role: account.role, source: accountSource } : null
    );

    if (!account) {
      if (role && role.toString().toLowerCase() === "admin") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return res.status(404).json({ message: "User not found" });
    }

    if ((account.status || "").toString().toUpperCase() !== "ACTIVE") {
      return res.status(403).json({ message: "Account not active" });
    }

    let isMatch = await bcrypt.compare(password, account.password);
    console.log("[auth] password match:", isMatch);

    if (!isMatch) {
      try {
        if (typeof account.password === "string" && account.password === password) {
          console.log("[auth] detected plaintext password in DB for account, migrating to bcrypt");
          const newHash = await bcrypt.hash(password, 10);

          if (accountSource === "employee") {
            await Employee.findByIdAndUpdate(account._id, { password: newHash });
          } else {
            await User.findByIdAndUpdate(account._id, { password: newHash });
          }

          isMatch = true;
          console.log("[auth] migration complete");
        }
      } catch (migrateErr) {
        console.error("[auth] migration error", migrateErr.message);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const normalizedRole = (account.role || "").toString().toLowerCase();

    // If this account is a manager, try to read department
    let department = "";
    if (normalizedRole === "manager") {
      try {
        if (accountSource === "employee" && account.department) {
          department = account.department;
        } else {
          const emp = await Employee.findOne({ username: account.username });
          if (emp && emp.department) department = emp.department;
        }
      } catch (empErr) {
        console.error("[auth] could not read employee department", empErr.message);
      }
    }

    const normalizedDepartment = (department || "").toString().toLowerCase();

    const token = jwt.sign(
      {
        id: account._id,
        role: normalizedRole,
        department: normalizedDepartment
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      role: normalizedRole,
      userId: account._id,
      source: accountSource,
      department: normalizedDepartment,
      user: {
        _id: account._id,
        userId: account.userId || "",
        name: account.name || "",
        username: account.username || "",
        email: account.email || "",
        role: normalizedRole,
        department: normalizedDepartment,
        nic: account.nic || "",
        address: account.address || "",
        city: account.city || "",
        organizationName: account.organizationName || "",
        registrationNumber: account.registrationNumber || "",
        contact: account.contact || ""
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Login error: ${error.message}` });
  }
};