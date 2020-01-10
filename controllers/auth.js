const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc   register new user
// @route  POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const {
        name,
        password,
        email,
        role
    } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

// @desc   login user
// @route  POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const {
        password,
        email
    } = req.body;
    console.log(password, email)
    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
    }

    const user = await User.findOne({
        email
    }).select('+password');

    if (!user) {
        return next(new ErrorResponse("Please provide valid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse("Please provide valid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
});

/**
 * send user cookie and json response with token
 * @param {*} user 
 * @param {*} statusCode 
 * @param {*} res 
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000)),
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}