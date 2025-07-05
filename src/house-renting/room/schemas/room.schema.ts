import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  FULL = 'FULL'
}

export const ROOM_MAX_TENANTS = 3;

export type RoomDocument = Room & Document & {
  currentTenants: number;
  isFull: boolean;
  availableSpots: number;
};

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Room {
  @Prop({ required: true, unique: true })
  number: string;

  @Prop({ 
    type: String, 
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE 
  })
  status: RoomStatus;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  deposit: number;

  @Prop({ default: false })
  isDepositPaid: boolean;

  @Prop({ 
    type: Number,
    required: true, 
    default: ROOM_MAX_TENANTS,
    min: 1,
    max: ROOM_MAX_TENANTS,
    validate: {
      validator: function(v: number) {
        return v <= ROOM_MAX_TENANTS;
      },
      message: `Maximum tenants cannot exceed ${ROOM_MAX_TENANTS}`
    }
  })
  maxTenants: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Tenant' }] })
  tenants: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Virtual for getting active tenants count
RoomSchema.virtual('currentTenants').get(function(this: RoomDocument) {
  return this.tenants ? this.tenants.length : 0;
});

// Virtual for checking if room is full
RoomSchema.virtual('isFull').get(function(this: RoomDocument) {
  return this.currentTenants >= this.maxTenants;
});

// Virtual for getting available spots
RoomSchema.virtual('availableSpots').get(function(this: RoomDocument) {
  return this.maxTenants - this.currentTenants;
});
