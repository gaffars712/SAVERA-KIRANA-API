const mongoose = require("mongoose");
const Rating = require('../rating.model');

const addRating = async (data, userId) => {
    try {
        const find = await Rating.findOne({ userId, productId: data?.productId })
        if (find) {
            const update = await Rating.findOneAndUpdate({ userId, productId: data?.productId }, { rating: data?.rating })
            console.log(update)
            return { data: update, status: true, code: 200 }
        } else {

            const create = await Rating.create({
                ...data,
                userId
            })
            if (create) {
                return { data: create, status: true, code: 201 };
            } else {
                return { data: 'Rating not created', status: false, code: 400 };
            }
        }
    } catch (error) {
        console.error("Error while adding cart:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = addRating;
