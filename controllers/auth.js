const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc   register new user
// @route  POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const {name, password, email, role} = req.body;

    const user = await User.create({
        name, email, password, role
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({success: true, token});
});

// @desc   login user
// @route  POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const {password, email} = req.body;
    console.log(password, email)
    if(!email || !password){
        return next(new ErrorResponse("Please provide an email and password", 400));
    }

    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse("Please provide valid credentials", 401));
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse("Please provide valid credentials", 401));
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({success: true, token});
});