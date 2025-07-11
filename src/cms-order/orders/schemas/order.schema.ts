import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  productPrice: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  totalPrice: number;
}

@Schema({ timestamps: true })
export class Order extends Document {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ required: true })
  customerAddress: string;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  shippingFee: number;

  @Prop({ required: true })
  total: number;

  @Prop()
  notes: string;

  @Prop({ 
    required: true, 
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 