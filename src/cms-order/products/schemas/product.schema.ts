import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ 
    required: true, 
    enum: ['in_stock', 'out_of_stock'],
    default: 'in_stock'
  })
  status: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product); 