const mongoose = require('mongoose');
const counterIncrementor = require('../../utils/counterIncrementer');
const { toJSON, paginate } = require('../../models/plugins');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    seqId: {
        type: Number,
        unique: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

/**
 * @typedef Notification
 */
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

notificationSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.seqId) {
        doc.seqId = await counterIncrementor('Notification');
    }
    next();
});

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
