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

    async findAll(): Promise<any[]> {
        const orders = await this.orderModel.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .exec();
        
        // Ensure all fields are present with proper defaults
        return orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            subtotal: order.subtotal || 0,
            shippingFee: order.shippingFee || 0,
            total: order.total || 0,
            totalPrice: order.total || 0, // Thêm totalPrice để tương thích
            notes: order.notes,
            status: order.status || 'pending',
            items: order.items || [],
            isDeleted: order.isDeleted || false,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            __v: order.__v
        }));
    }

    async findOne(id: string): Promise<any> {
        const order = await this.orderModel.findOne({ 
            _id: id, 
            isDeleted: false 
        }).exec();
        
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        
        // Ensure all fields are present with proper defaults
        return {
            _id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            subtotal: order.subtotal || 0,
            shippingFee: order.shippingFee || 0,
            total: order.total || 0,
            totalPrice: order.total || 0, // Thêm totalPrice để tương thích
            notes: order.notes,
            status: order.status || 'pending',
            items: order.items || [],
            isDeleted: order.isDeleted || false,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            __v: order.__v
        };
    }

    async create(createOrderDto: CreateOrderDto): Promise<any> {
        // Validate products and calculate totals
        const orderItems: any[] = [];
        let subtotal = 0;

        // Handle empty items array
        if (!createOrderDto.items || createOrderDto.items.length === 0) {
            throw new BadRequestException('Order must contain at least one item');
        }

        for (const item of createOrderDto.items) {
            const product = await this.productsService.findOne(item.productId);
            
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
        
        return this.findOne((savedOrder._id as any));
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<any> {
        const order = await this.orderModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
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

    async remove(id: string): Promise<void> {
        const order = await this.orderModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
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