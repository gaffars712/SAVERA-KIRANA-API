const mongoose = require("mongoose");
const Notification = require("../notification.modal");

const updateNotification = async (userId) => {
    try {
        const query = {
            active: true,
            userId: new mongoose.Types.ObjectId(userId),
            isRead:false
        };
        const Notifications = await Notification.find(query);
        if (!Notifications) {
            return { data: "Notifications Not Found", status: false, code: 400 };
        } else {
            const updatedNotifications = await Notification.updateMany(query, {isRead:true})
            return { data: updatedNotifications, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = updateNotification;
