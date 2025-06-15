import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMealDto, UpdateMealDto } from './dto/create-meal.dto';

@Injectable()
export class MealsService {
    constructor(@InjectModel('Meal') private mealModel: Model<any>) { }

    async create(createMealDto: CreateMealDto) {
        const meal = new this.mealModel(createMealDto);
        return meal.save();
    }

    async findAll(page: number, limit: number, search: string) {
        const skip = (page - 1) * limit;
        const query = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};
        const data = await this.mealModel.find(query).skip(skip).limit(limit).exec();
        const total = await this.mealModel.countDocuments(query);
        return { data, total, page, limit };
    }

    async findOne(id: string) {
        return this.mealModel.findById(id).exec();
    }

    async update(id: string, updateMealDto: UpdateMealDto) {
        return this.mealModel.findByIdAndUpdate(id, { $set: updateMealDto }, { new: true }).exec();
    }

    async remove(id: string) {
        return this.mealModel.findByIdAndDelete(id).exec();
    }
}
