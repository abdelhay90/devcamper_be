const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc   register new user
// @route  GET /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const {name, password, email, role} = req.body;

    const user = await User.create({
        name, email, password, role
    });

    res.status(200).json({success: true});
});