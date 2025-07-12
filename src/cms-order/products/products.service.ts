import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
    ) {}

    async findAll(userId: Types.ObjectId): Promise<Product[]> {
        return this.productModel.find({ 
            userId,
            isDeleted: false 
        }).exec();
    }

    async findOne(id: string, userId: Types.ObjectId): Promise<Product> {
        const product = await this.productModel.findOne({ 
            _id: id,
            userId,
            isDeleted: false 
        }).exec();
        
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        
        return product;
    }

    async create(createProductDto: CreateProductDto, userId: Types.ObjectId): Promise<Product> {
        const product = new this.productModel({
            ...createProductDto,
            userId,
            status: createProductDto.status || 'in_stock',
        });
        return product.save();
    }

    async update(id: string, updateProductDto: UpdateProductDto, userId: Types.ObjectId): Promise<Product> {
        const product = await this.productModel.findOneAndUpdate(
            { 
                _id: id,
                userId,
                isDeleted: false 
            },
            { 
                ...updateProductDto,
                updatedAt: new Date()
            },
            { new: true }
        ).exec();

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async remove(id: string, userId: Types.ObjectId): Promise<Product> {
        const product = await this.productModel.findOneAndUpdate(
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

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
} 