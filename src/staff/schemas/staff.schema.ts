import { Schema } from 'mongoose';

export const StaffSchema = new Schema({
  name: { type: String, required: true },
  shift: { type: String, required: true },
  status: { type: String, required: true },
});
