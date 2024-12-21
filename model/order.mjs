import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date_purchase: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true,
    },
    valid_period: {
        type: Number,
        required: true,
        enum: [7, 14, 31, 60, 91, 181, 365],
    },
    valid_until: {
        type: String,
        required: true,
    },
    areas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true,
    }],
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
    },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;