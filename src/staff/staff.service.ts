import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStaffDto, UpdateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
    constructor(@InjectModel('Staff') private staffModel: Model<any>) { }

    async create(dto: CreateStaffDto) {
        return new this.staffModel(dto).save();
    }

    async findAll(page: number, limit: number, search: string) {
        const skip = (page - 1) * limit;
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};
        const data = await this.staffModel.find(query).skip(skip).limit(limit).exec();
        const total = await this.staffModel.countDocuments(query);
        return { data, total, page, limit };
    }

    async findOne(id: string) {
        return this.staffModel.findById(id).exec();
    }

    async update(id: string, dto: UpdateStaffDto) {
        return this.staffModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    }

    async remove(id: string) {
        return this.staffModel.findByIdAndDelete(id).exec();
    }
}