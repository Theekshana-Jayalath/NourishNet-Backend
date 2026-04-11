import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import Display from "../models/displayModel.js";

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
  // Count managers from users collection (match your request to count from user DB)
  const managers = await User.countDocuments({ role: 'manager' });

    // Count donors/ngos/drivers from users collection
    const donors = await User.countDocuments({ role: 'donor' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    const drivers = await User.countDocuments({ role: 'driver' });

  // Log counts for debugging
  console.log('[adminController] getAdminStats ->', { managers, donors, ngos, drivers });

  // Return only the requested shape
  res.status(200).json({ managers, donors, drivers, ngos });
  } catch (err) {
    console.error('[adminController] getAdminStats error', err.message)
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
}

export default { getAdminStats }
