import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
    ) {}

    async findAll(): Promise<any[]> {
        return this.productModel.find({ isDeleted: false }).exec();
    }

    async findOne(id: string): Promise<any> {
        const product = await this.productModel.findOne({ 
            _id: id, 
            isDeleted: false 
        }).exec();
        
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        
        return product;
    }

    async create(createProductDto: CreateProductDto): Promise<any> {
        const product = new this.productModel({
            ...createProductDto,
            status: createProductDto.status || 'in_stock',
        });
        return product.save();
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
        const product = await this.productModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
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

    async remove(id: string): Promise<Product> {
        const product = await this.productModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
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