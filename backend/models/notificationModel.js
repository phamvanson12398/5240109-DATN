import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null means it's a global notification for everyone
    },
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề thông báo']
    },
    message: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung thông báo']
    },
    type: {
        type: String,
        enum: ['promotion', 'order', 'system'],
        default: 'system'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: '/cart'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
