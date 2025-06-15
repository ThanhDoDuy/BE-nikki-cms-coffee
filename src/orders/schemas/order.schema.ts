import { Schema } from 'mongoose';

export const OrderSchema = new Schema(
    {
        orderNumber: { type: String, unique: true },
        customerName: { type: String, required: true },
        tableNumber: String,
        items: [
            {
                mealId: String,
                mealName: String,
                quantity: Number,
                price: Number,
                subtotal: Number,
            },
        ],
        totalAmount: Number,
        paymentMethod: { type: String, enum: ['cash', 'card'] },
        status: { type: String, enum: ['pending', 'completed', 'cancelled'] },
        staffId: String,
        staffName: String,
        note: String,
        isDeleted: { type: Boolean, default: false },
        createdAt: Date,
        updatedAt: Date,
    },
    { timestamps: false },
);
