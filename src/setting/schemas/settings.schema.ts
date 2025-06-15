import { Schema } from 'mongoose';

export const SettingsSchema = new Schema({
    shopName: String,
    shopAddress: String,
    contactPhone: String,
    openingTime: String,
    closingTime: String,
    currency: String,
    updatedAt: Date,
});
