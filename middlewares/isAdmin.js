const User = require("../model/User/User");
const appErr = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("./verifyToken");

const isAdmin = async (req, res, next) => {
    
    // get token from header
    const token = getTokenFromHeader(req);

    // Verify token 
    const decodedUser = verifyToken(token);

    const user = await User.findById(decodedUser.id);

    if (! user.isAdmin) {
        return next(appErr('Access denied, admin only', 500));
    }

    next();
   
};

module.exports = isAdmin;