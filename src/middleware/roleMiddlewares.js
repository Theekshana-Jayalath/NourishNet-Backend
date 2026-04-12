import User from "../models/userModel.js";

const authorization =(...allowedRoles) => {
    // normalize allowed roles to lowercase
    const allowed = allowedRoles.map(r => r.toString().toLowerCase())
    return (req,res,next) => {
        const userRole = req.user && req.user.role ? req.user.role.toString().toLowerCase() : ''
        if(!allowed.includes(userRole)){
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    }
};

export default authorization;