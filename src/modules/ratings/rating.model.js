const mongoose = require('mongoose')
const { toJSON, paginate } = require('../../models/plugins');


const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    productId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    ratingDate: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        default: 0,
        required: true
    }

});
/**
 * @typedef Rating
 */
ratingSchema.plugin(toJSON);
ratingSchema.plugin(paginate);

/**
 * @typedef Rating
 */
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;