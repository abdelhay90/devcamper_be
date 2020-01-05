const path = require('path')
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc   Get specific bootcamp with id
// @route  GET /api/v1/bootcamps/:id
// @access Private
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp})
});

// @desc   Add new bootcamp
// @route  POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    })
});

// @desc   update specific bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp})
});

// @desc   delete specific bootcamp
// @route  DELETE /api/v1/bootcamps
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id, req.body);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`, 404));
    }
    bootcamp.remove();
    res.status(200).json({success: true, data: bootcamp})
});

// @desc   upload photo to specific bootcamp
// @route  PUT /api/v1/bootcamps
// @access Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id, req.body);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // check type
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload a file of type image`, 400));

    }

    // check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(
            `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
            400));

    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(
                `Problem with file upload`,
                500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({success: true, data: file.name})
    });

});

// @desc   get bootcamps within radius
// @route  DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    const loc = await geocoder.geocode(zipcode);
    const {longitude, latitude} = loc[0];

    /**
     * calc radius using radians (divide distance by radius of earth)
     * earth radius = 3963 miles / 6378 kilometers
     */

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            '$geoWithin': {
                '$centerSphere': [[longitude, latitude], radius]
            }
        }
    });
    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps})
});
