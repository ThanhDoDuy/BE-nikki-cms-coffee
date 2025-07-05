import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UtilityReading, UtilityReadingDocument } from './schemas/utility-reading.schema';
import { CreateUtilityReadingDto } from './dto/create-utility-reading.dto';
import { UpdateUtilityReadingDto } from './dto/update-utility-reading.dto';
import { Room, RoomDocument } from '../room/schemas/room.schema';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class UtilityReadingsService {
  constructor(
    @InjectModel(UtilityReading.name) private utilityReadingModel: Model<UtilityReadingDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}

  async create(createUtilityReadingDto: CreateUtilityReadingDto) {
    const room = await this.roomModel.findById(createUtilityReadingDto.room);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const utilityReading = new this.utilityReadingModel(createUtilityReadingDto);
    const savedReading = await utilityReading.save() as UtilityReadingDocument;

    return { data: savedReading };
  }

  async update(id: string, updateUtilityReadingDto: UpdateUtilityReadingDto) {
    // Validate if utility reading exists
    const existingReading = await this.utilityReadingModel.findById(id);
    if (!existingReading) {
      throw new NotFoundException('Utility reading not found');
    }

    // Validate readings if being updated
    const electricityStart = updateUtilityReadingDto.electricityStart ?? existingReading.electricityStart;
    const electricityEnd = updateUtilityReadingDto.electricityEnd ?? existingReading.electricityEnd;
    const waterStart = updateUtilityReadingDto.waterStart ?? existingReading.waterStart;
    const waterEnd = updateUtilityReadingDto.waterEnd ?? existingReading.waterEnd;

    if (electricityEnd < electricityStart) {
      throw new BadRequestException('Electricity end reading cannot be less than start reading');
    }

    if (waterEnd < waterStart) {
      throw new BadRequestException('Water end reading cannot be less than start reading');
    }

    const updatedReading = await this.utilityReadingModel.findByIdAndUpdate(
      id,
      updateUtilityReadingDto,
      { new: true }
    ).exec();

    if (!updatedReading) {
      throw new NotFoundException('Utility reading not found after update');
    }

    return { data: updatedReading };
  }

  async findAll() {
    const utilityReadings = await this.utilityReadingModel.find()
      .populate('room')
      .sort({ month: -1 })
      .exec();
    return { data: utilityReadings };
  }

  async findByMonth(month: string) {
    const utilityReadings = await this.utilityReadingModel.find({ month })
      .populate('room')
      .sort({ month: -1 })
      .exec();
    return { data: utilityReadings };
  }

  async findOne(id: string) {
    const utilityReading = await this.utilityReadingModel.findById(id)
      .populate('room')
      .exec();
    if (!utilityReading) {
      throw new NotFoundException('Utility reading not found');
    }
    return { data: utilityReading };
  }

  async remove(id: string) {
    const utilityReading = await this.utilityReadingModel.findByIdAndDelete(id);
    if (!utilityReading) {
      throw new NotFoundException('Utility reading not found');
    }
    return { data: utilityReading };
  }
} 