import { Schema } from 'mongoose';

export const MealSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  originPrice: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
});
