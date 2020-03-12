const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        // set token from authorization header
        token = req.headers.authorization.split(' ')[1];
    }
    //else if (req.cookies.token) {
    // set token from cookie
    //    token = req.cookies.token;
    // }

    // make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (e) {
        console.error(e)
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(
                `User Role ${req.user.role} is not authorized to access this role`, 403))
        }
        next();
    }
}