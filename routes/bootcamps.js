const router = require('express').Router();
const {
    getBootcamps, getBootcamp,
    createBootcamp, updateBootcamp,
    deleteBootcamp, getBootcampsInRadius, uploadBootcampPhoto
} = require('../controllers/bootcamps');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth');


// include other resource routers
const courseRouter = require('./courses');

//reroute into other router
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), uploadBootcampPhoto);

router.route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);
router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
