import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Room } from '../../room/schemas/room.schema';
import { UtilityReading } from '../../utility-readings/schemas/utility-reading.schema';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Schema({ timestamps: true })
export class Invoice {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Types.ObjectId | Room;

  @Prop({ type: Types.ObjectId, ref: 'UtilityReading', required: true })
  utilityReading: Types.ObjectId | UtilityReading;

  @Prop({ required: true })
  month: string; // Format: YYYY-MM

  @Prop({ required: true })
  roomCharge: number;

  @Prop({ required: true })
  electricityUsage: number;

  @Prop({ required: true })
  electricityUnitPrice: number;

  @Prop({ required: true })
  electricityCharge: number;

  @Prop({ required: true })
  waterUsage: number;

  @Prop({ required: true })
  waterUnitPrice: number;

  @Prop({ required: true })
  waterCharge: number;

  @Prop({ required: true })
  garbageCharge: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Prop()
  paidAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [{ sentAt: Date, message: String }], default: [] })
  reminderHistory: Array<{ sentAt: Date; message: string }>;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice); 