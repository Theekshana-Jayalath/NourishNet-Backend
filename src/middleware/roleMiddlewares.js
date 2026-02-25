import User from "../models/userModel.js";

const authorization =(...allowedRoles) => {
    return (req,res,next) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    }
};

export default authorization;