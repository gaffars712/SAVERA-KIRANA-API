const mongoose = require("mongoose");
const Notification = require("../notification.modal");

const getNofitifation = async (userId) => {
    try {
        const query = {
            active: true,
            userId: new mongoose.Types.ObjectId(userId),
        };
        const Notifications = await Notification.find(query).sort({ createdAt: -1 });;
        if (!Notifications) {
            return { data: "Notifications Not Found", status: false, code: 400 };
        } else {
            return { data: Notifications, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getNofitifation;
