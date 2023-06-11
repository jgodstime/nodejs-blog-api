const appErr = require("../utils/appErr");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("./verifyToken");

const isLogin = (req, res, next) => {
    
    // get token from header
    const token = getTokenFromHeader(req);

    // Verify token 
    const decodedUser = verifyToken(token);
    
    if (! decodedUser) {
        return next(appErr('Invalid/Expired token, kindly login again', 500));
    }

     // save the user into the req object 
    req.authId = decodedUser.id;

    next();
   
};

module.exports = isLogin;