import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";

//Register

export const register = async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (also acts as employee record)
    const newUser = new User({
      name: name || username,
      email: email || '',
      username,
      password: hashedPassword,
      role,
      status: 'ACTIVE'
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

//Login

export const login = async (req, res) => {
  try {
  const { username, password, role } = req.body;

  // debug: log login attempt (do NOT log password)
  console.log('[auth] login attempt - username:', username, 'role:', role)
  // lookup by username only in users collection
  const query = { username }
  console.log('[auth] login query (users only):', query)
  let account = await User.findOne(query);
  const accountSource = 'user'
  console.log('[auth] lookup result:', !!account, account ? { id: account._id, role: account.role, source: accountSource } : null)
    if (!account) {
      // For admin logins avoid revealing existence — return generic invalid credentials
      if (role && role.toString().toLowerCase() === 'admin') {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow login for active users
    if ((account.status || '').toString().toUpperCase() !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account not active' });
    }

    let isMatch = await bcrypt.compare(password, account.password);
    console.log('[auth] password match:', isMatch)

    // If bcrypt compare failed, check for legacy plaintext password stored in DB
    if (!isMatch) {
      try {
        if (typeof account.password === 'string' && account.password === password) {
          // migrate: hash plaintext password and update DB
          console.log('[auth] detected plaintext password in DB for user, migrating to bcrypt')
          const newHash = await bcrypt.hash(password, 10)
          // update the correct collection where the account was found
          if (accountSource === 'employee') {
            await Employee.findByIdAndUpdate(account._id, { password: newHash })
          } else {
            await User.findByIdAndUpdate(account._id, { password: newHash })
          }
          isMatch = true
          console.log('[auth] migration complete')
        }
      } catch (migrateErr) {
        console.error('[auth] migration error', migrateErr.message)
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const normalizedRole = (account.role || '').toString().toLowerCase()
    const token = jwt.sign(
      { id: account._id, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, role: normalizedRole, userId: account._id, source: accountSource });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
};
