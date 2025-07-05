import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { UtilityReading, UtilityReadingDocument } from './schemas/utility-reading.schema';
import { CreateUtilityReadingDto } from './dto/create-utility-reading.dto';
import { UpdateUtilityReadingDto } from './dto/update-utility-reading.dto';
import { Room, RoomDocument } from '../room/schemas/room.schema';

@Injectable()
export class UtilityReadingsService {
  constructor(
    @InjectModel(UtilityReading.name) private utilityReadingModel: Model<UtilityReadingDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}

  private async findRoomByNumberOrId(roomIdentifier: string): Promise<RoomDocument> {
    let room: RoomDocument | null = null;

    // First try to find by MongoDB ID if it's a valid ObjectId
    if (isValidObjectId(roomIdentifier)) {
      room = await this.roomModel.findOne({
        _id: roomIdentifier,
        isDeleted: false
      });
    }

    // If not found by ID, try to find by room number
    if (!room) {
      room = await this.roomModel.findOne({
        number: roomIdentifier,
        isDeleted: false
      });
    }

    if (!room) {
      throw new NotFoundException(`Room ${roomIdentifier} not found`);
    }

    return room;
  }

  async create(createUtilityReadingDto: CreateUtilityReadingDto) {
    const room = await this.findRoomByNumberOrId(createUtilityReadingDto.room);

    // Check if reading already exists for this room and month
    const existingReading = await this.utilityReadingModel.findOne({
      room: room._id,
      month: createUtilityReadingDto.month,
      isDeleted: false
    });

    if (existingReading) {
      throw new BadRequestException(`Utility reading already exists for room ${room.number} in ${createUtilityReadingDto.month}`);
    }

    // Validate readings
    if (createUtilityReadingDto.electricityEnd < createUtilityReadingDto.electricityStart) {
      throw new BadRequestException('Electricity end reading cannot be less than start reading');
    }

    if (createUtilityReadingDto.waterEnd < createUtilityReadingDto.waterStart) {
      throw new BadRequestException('Water end reading cannot be less than start reading');
    }

    const utilityReading = new this.utilityReadingModel({
      ...createUtilityReadingDto,
      room: room._id
    });
    const savedReading = await (await utilityReading.save()).populate('room', 'number');
    return { data: savedReading };
  }

  async findAll() {
    const readings = await this.utilityReadingModel.find({ isDeleted: false })
      .populate('room', 'number')
      .sort({ month: -1 });
    return { data: readings };
  }

  async findByMonth(month: string) {
    const readings = await this.utilityReadingModel.find({
      month,
      isDeleted: false
    }).populate('room', 'number');
    return { data: readings };
  }

  async findOne(id: string) {
    const utilityReading = await this.utilityReadingModel.findOne({
      _id: id,
      isDeleted: false
    }).populate('room', 'number');

    if (!utilityReading) {
      throw new NotFoundException('Utility reading not found');
    }

    return { data: utilityReading };
  }

  async update(id: string, updateUtilityReadingDto: UpdateUtilityReadingDto) {
    const utilityReading = await this.utilityReadingModel.findOne({
      _id: id,
      isDeleted: false
    }).populate('room', 'number');

    if (!utilityReading) {
      throw new NotFoundException('Utility reading not found');
    }

    let roomId = (utilityReading.room as any)._id;

    // If room is being changed, check if new room exists
    if (updateUtilityReadingDto.room) {
      const newRoom = await this.findRoomByNumberOrId(updateUtilityReadingDto.room);
      roomId = newRoom._id;

      // Check if reading already exists for new room and month
      const existingReading = await this.utilityReadingModel.findOne({
        room: roomId,
        month: updateUtilityReadingDto.month || utilityReading.month,
        _id: { $ne: id },
        isDeleted: false
      });

      if (existingReading) {
        throw new BadRequestException(`Utility reading already exists for room ${newRoom.number} in ${updateUtilityReadingDto.month || utilityReading.month}`);
      }
    }

    // Validate readings if being updated
    const electricityStart = updateUtilityReadingDto.electricityStart ?? utilityReading.electricityStart;
    const electricityEnd = updateUtilityReadingDto.electricityEnd ?? utilityReading.electricityEnd;
    const waterStart = updateUtilityReadingDto.waterStart ?? utilityReading.waterStart;
    const waterEnd = updateUtilityReadingDto.waterEnd ?? utilityReading.waterEnd;

    if (electricityEnd < electricityStart) {
      throw new BadRequestException('Electricity end reading cannot be less than start reading');
    }

    if (waterEnd < waterStart) {
      throw new BadRequestException('Water end reading cannot be less than start reading');
    }

    const updatedReading = await this.utilityReadingModel.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...updateUtilityReadingDto,
          room: roomId
        }
      },
      { new: true }
    ).populate('room', 'number');

    if (!updatedReading) {
      throw new NotFoundException('Utility reading not found after update');
    }

    return { data: updatedReading };
  }

  async remove(id: string) {
    const utilityReading = await this.utilityReadingModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!utilityReading) {
      throw new NotFoundException('Utility reading not found');
    }

    await this.utilityReadingModel.findByIdAndUpdate(id, {
      isDeleted: true
    });

    return {
      data: {
        _id: id
      }
    };
  }
} 