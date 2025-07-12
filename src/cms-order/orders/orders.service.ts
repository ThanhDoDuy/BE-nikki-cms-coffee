import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        private productsService: ProductsService,
    ) {}

    private generateOrderNumber(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    }

    async findAll(userId: Types.ObjectId): Promise<any[]> {
        const orders = await this.orderModel.find({ 
            userId,
            isDeleted: false 
        })
            .sort({ createdAt: -1 })
            .exec();
        
        // Ensure all fields are present with proper defaults
        return orders.map(order => ({
            _id: order._id,
            userId: order.userId,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            subtotal: order.subtotal || 0,
            shippingFee: order.shippingFee || 0,
            total: order.total || 0,
            totalPrice: order.total || 0,
            notes: order.notes,
            status: order.status || 'pending',
            items: order.items || [],
            isDeleted: order.isDeleted || false,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            __v: order.__v
        }));
    }

    async findOne(id: string, userId: Types.ObjectId): Promise<any> {
        const order = await this.orderModel.findOne({ 
            _id: id,
            userId,
            isDeleted: false 
        }).exec();
        
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        
        return {
            _id: order._id,
            userId: order.userId,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            subtotal: order.subtotal || 0,
            shippingFee: order.shippingFee || 0,
            total: order.total || 0,
            totalPrice: order.total || 0,
            notes: order.notes,
            status: order.status || 'pending',
            items: order.items || [],
            isDeleted: order.isDeleted || false,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            __v: order.__v
        };
    }

    async create(createOrderDto: CreateOrderDto, userId: Types.ObjectId): Promise<any> {
        // Validate products and calculate totals
        const orderItems: any[] = [];
        let subtotal = 0;

        if (!createOrderDto.items || createOrderDto.items.length === 0) {
            throw new BadRequestException('Order must contain at least one item');
        }

        for (const item of createOrderDto.items) {
            const product = await this.productsService.findOne(item.productId, userId);
            
            if (!product) {
                throw new BadRequestException(`Product with ID ${item.productId} not found`);
            }

            if (product.status === 'out_of_stock') {
                throw new BadRequestException(`Product ${product.name} is out of stock`);
            }

            const totalPrice = product.price * item.quantity;
            subtotal += totalPrice;

            orderItems.push({
                productId: product._id,
                productName: product.name,
                productPrice: product.price,
                quantity: item.quantity,
                unit: product.unit,
                totalPrice: totalPrice,
            });
        }

        const total = subtotal + (createOrderDto.shippingFee || 0);
        
        const orderData = {
            userId,
            orderNumber: this.generateOrderNumber(),
            customerName: createOrderDto.customerName,
            customerPhone: createOrderDto.customerPhone,
            customerAddress: createOrderDto.customerAddress,
            subtotal: subtotal,
            shippingFee: createOrderDto.shippingFee || 0,
            total: total,
            notes: createOrderDto.notes || '',
            items: orderItems,
            status: 'pending',
            isDeleted: false,
        };
        
        const order = new this.orderModel(orderData);
        const savedOrder = await order.save();
        
        return this.findOne(savedOrder?._id?.toString() || '', userId);
    }

    async update(id: string, updateOrderDto: UpdateOrderDto, userId: Types.ObjectId): Promise<any> {
        const order = await this.orderModel.findOneAndUpdate(
            { 
                _id: id,
                userId,
                isDeleted: false 
            },
            { 
                ...updateOrderDto,
                updatedAt: new Date()
            },
            { new: true }
        ).exec();

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // Recalculate total if shipping fee changed
        if (updateOrderDto.shippingFee !== undefined) {
            const newTotal = order.subtotal + updateOrderDto.shippingFee;
            order.total = newTotal;
            await order.save();
        }

        return order;
    }

    async remove(id: string, userId: Types.ObjectId): Promise<void> {
        const order = await this.orderModel.findOneAndUpdate(
            { 
                _id: id,
                userId,
                isDeleted: false 
            },
            { 
                isDeleted: true,
                updatedAt: new Date()
            }
        ).exec();

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
    }
} 