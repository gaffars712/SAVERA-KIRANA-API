const mongoose = require("mongoose");
const Order = require('../order.model');

const createOrder = async (data, userId) => {
    try {
        const create = await Order.create({
            ...data,
            userId
        })
        if (create) {
            return { data: create, status: true, code: 200 };
        } else {
            return { data: 'order not created', status: false, code: 400 };
        }

    } catch (error) {
        console.error("Error while adding cart:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = createOrder;
