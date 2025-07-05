import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Room } from '../../room/schemas/room.schema';

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room: Types.ObjectId | Room;

  @Prop({ required: true, type: Date })
  moveInDate: Date;

  @Prop({ type: Date })
  moveOutDate: Date;

  @Prop({ 
    required: true, 
    enum: ['STAYING', 'DEBT', 'MOVED_OUT'],
    default: 'STAYING'
  })
  status: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);