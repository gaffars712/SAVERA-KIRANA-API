const mongoose = require("mongoose");
const Notification = require('../notification.modal')

const addServiceProvider = async ({ userId, message, title }) => {
    try {

        const id = new mongoose.Types.ObjectId(userId);

        const addResult = await Notification.create({
            userId: id,
            message,
            title
        });

        if (addResult) {
            return { data: addResult, status: true, code: 200 };
        } else {
            return { data: "Error while adding Service Provider", status: false, code: 400 };
        }
    } catch (error) {
        console.error("Error while adding product:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = addServiceProvider;
