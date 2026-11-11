import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({

    message: {
        type: String,
        required: true
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },

    customerName: {
        type: String,
        default: 'Customer'
    },

    amount: {
        type: Number,
        default: 0
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)