import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Room } from '../../room/schemas/room.schema';

export type UtilityReadingDocument = UtilityReading & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true
  }
})
export class UtilityReading {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Room', required: true })
  room: Room;

  @Prop({ required: true })
  month: string;

  @Prop({ required: true })
  electricityStart: number;

  @Prop({ required: true })
  electricityEnd: number;

  @Prop({ required: true })
  waterStart: number;

  @Prop({ required: true })
  waterEnd: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UtilityReadingSchema = SchemaFactory.createForClass(UtilityReading);

// Virtual for electricity consumption
UtilityReadingSchema.virtual('electricityConsumption').get(function(this: UtilityReadingDocument) {
  return this.electricityEnd - this.electricityStart;
});

// Virtual for water consumption
UtilityReadingSchema.virtual('waterConsumption').get(function(this: UtilityReadingDocument) {
  return this.waterEnd - this.waterStart;
}); 