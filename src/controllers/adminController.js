import User from "../models/userModel.js";
import Employee from "../models/employeeModel.js";
import Display from "../models/displayModel.js";

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    // Count managers from employees collection
    const managers = await Employee.countDocuments();

    // Count donors/ngos/drivers from users collection
    const donors = await User.countDocuments({ role: 'donor' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    const drivers = await User.countDocuments({ role: 'driver' });

    // Inventory items (published)
    const inventory = await Display.countDocuments({ published: true });

    res.status(200).json({ managers, donors, ngos, drivers, inventory });
  } catch (err) {
    console.error('[adminController] getAdminStats error', err.message)
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
}

export default { getAdminStats }
