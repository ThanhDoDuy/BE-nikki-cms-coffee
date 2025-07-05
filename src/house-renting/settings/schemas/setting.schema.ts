import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Setting extends Document {
  @Prop({ required: true, default: 3000 })
  electricityUnitPrice: number;

  @Prop({ required: true, default: 10000 })
  waterUnitPrice: number;

  @Prop({ required: true, default: 20000 })
  garbageCharge: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting); 