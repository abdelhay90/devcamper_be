const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add a text'],
    },
    rating: {
        type: Number,
        required: [true, 'Please add rating between 1 and 10'],
        min: 1,
        max: 10
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
});

// prevent user from submitting more than one review per bootcamp
ReviewSchema.index({
    bootcamp: 1,
    user: 1
}, {
    unique: true
})

// static method to get avg bootcamp average ratings
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([{
            $match: {
                bootcamp: bootcampId
            },
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: {
                    $avg: '$rating'
                },
            },
        },
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        });
    } catch (e) {
        console.error(e);
    }
};

// call getAverageRating after save
ReviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.bootcamp);
});

// call getAverageRating after save
ReviewSchema.pre('remove', async function () {
    await this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);