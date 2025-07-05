import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room, RoomStatus, RoomDocument, ROOM_MAX_TENANTS } from './schemas/room.schema';
import { RoomResponse, RoomResponseData } from './types/room.types';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  private transformToResponse(room: RoomDocument): RoomResponse {
    const roomObj = room.toObject();
    const responseData: RoomResponseData = {
      id: roomObj._id.toString(),
      number: roomObj.number,
      status: roomObj.status,
      tenants: roomObj.tenants || [],
      currentTenants: room.currentTenants,
      maxTenants: roomObj.maxTenants,
      price: roomObj.price,
      deposit: roomObj.deposit,
      isDepositPaid: roomObj.isDepositPaid,
      isDeleted: roomObj.isDeleted,
      createdAt: roomObj.createdAt,
      updatedAt: roomObj.updatedAt,
      availableSpots: room.availableSpots,
      isFull: room.isFull
    };

    return {
      ...roomObj,
      ...responseData
    };
  }

  async create(createRoomDto: CreateRoomDto): Promise<RoomResponse> {
    // Check for duplicate room number
    const existingRoom = await this.roomModel.findOne({
      number: createRoomDto.number,
      isDeleted: false
    });

    if (existingRoom) {
      throw new ConflictException('Room number already exists');
    }

    // Validate maxTenants if provided
    if (createRoomDto.maxTenants && createRoomDto.maxTenants > ROOM_MAX_TENANTS) {
      throw new BadRequestException(`Maximum tenants cannot exceed ${ROOM_MAX_TENANTS}`);
    }

    // Create room with default or provided maxTenants
    const room = new this.roomModel({
      ...createRoomDto,
      maxTenants: createRoomDto.maxTenants || ROOM_MAX_TENANTS
    });

    const savedRoom = await room.save();
    console.log(savedRoom);
    return this.transformToResponse(savedRoom);
  }

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    const query = {
      isDeleted: false,
      ...(search ? { number: { $regex: search, $options: 'i' } } : {})
    };
    
    const data = await this.roomModel.find(query)
      .populate({
        path: 'tenants',
        match: { isDeleted: false, status: { $ne: 'MOVED_OUT' } },
        select: 'fullName phoneNumber moveInDate status'
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await this.roomModel.countDocuments(query);
    
    const formattedData = data.map(room => {
      // Update room status based on tenant count
      if (room.currentTenants >= room.maxTenants && room.status !== RoomStatus.FULL) {
        this.roomModel.findByIdAndUpdate(room._id, { status: RoomStatus.FULL }).exec();
        room.status = RoomStatus.FULL;
      } else if (room.currentTenants < room.maxTenants && room.status === RoomStatus.FULL) {
        this.roomModel.findByIdAndUpdate(room._id, { status: RoomStatus.AVAILABLE }).exec();
        room.status = RoomStatus.AVAILABLE;
      }
      return this.transformToResponse(room);
    });

    return { 
      data: formattedData, 
      total, 
      page, 
      limit 
    };
  }

  async findOne(id: string): Promise<RoomResponse> {
    const room = await this.roomModel.findOne({
      _id: id,
      isDeleted: false
    }).populate({
      path: 'tenants',
      match: { isDeleted: false, status: { $ne: 'MOVED_OUT' } },
      select: 'fullName phoneNumber moveInDate status'
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Update room status based on tenant count
    if (room.currentTenants >= room.maxTenants && room.status !== RoomStatus.FULL) {
      await this.roomModel.findByIdAndUpdate(room._id, { status: RoomStatus.FULL });
      room.status = RoomStatus.FULL;
    } else if (room.currentTenants < room.maxTenants && room.status === RoomStatus.FULL) {
      await this.roomModel.findByIdAndUpdate(room._id, { status: RoomStatus.AVAILABLE });
      room.status = RoomStatus.AVAILABLE;
    }

    return this.transformToResponse(room);
  }

  async update(id: string, updateRoomDto: Partial<CreateRoomDto>): Promise<RoomResponse> {
    // Validate maxTenants if provided
    if (updateRoomDto.maxTenants) {
      if (updateRoomDto.maxTenants > ROOM_MAX_TENANTS) {
        throw new BadRequestException(`Maximum tenants cannot exceed ${ROOM_MAX_TENANTS}`);
      }
    }

    const room = await this.roomModel.findOne({
      _id: id,
      isDeleted: false
    }).populate({
      path: 'tenants',
      match: { isDeleted: false, status: { $ne: 'MOVED_OUT' } },
      select: 'fullName phoneNumber moveInDate status'
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check for duplicate room number if updating number
    if (updateRoomDto.number && updateRoomDto.number !== room.number) {
      const existingRoom = await this.roomModel.findOne({
        number: updateRoomDto.number,
        isDeleted: false,
        _id: { $ne: id }
      });

      if (existingRoom) {
        throw new ConflictException('Room number already exists');
      }
    }

    // Check if new maxTenants is less than current tenant count
    if (updateRoomDto.maxTenants && room.currentTenants > updateRoomDto.maxTenants) {
      throw new BadRequestException('Cannot set maximum tenants below current tenant count');
    }

    const updatedRoom = await this.roomModel.findByIdAndUpdate(
      id,
      { $set: updateRoomDto },
      { new: true }
    ).populate({
      path: 'tenants',
      match: { isDeleted: false, status: { $ne: 'MOVED_OUT' } },
      select: 'fullName phoneNumber moveInDate status'
    });

    if (!updatedRoom) {
      throw new NotFoundException('Room not found after update');
    }

    return this.transformToResponse(updatedRoom);
  }

  async remove(id: string): Promise<{ data: { _id: string } }> {
    const room = await this.roomModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    await this.roomModel.findByIdAndUpdate(id, {
      isDeleted: true,
      status: RoomStatus.AVAILABLE // Reset status when soft deleting
    });

    return {
      data: {
        _id: id
      }
    };
  }

  // Method to check room availability and update status
  async checkAndUpdateRoomStatus(roomId: string): Promise<void> {
    const room = await this.roomModel.findById(roomId);
    if (!room) return;

    const isFull = room.currentTenants >= room.maxTenants;
    const newStatus = isFull ? RoomStatus.FULL : RoomStatus.AVAILABLE;

    if (room.status !== newStatus) {
      await this.roomModel.findByIdAndUpdate(roomId, {
        status: newStatus,
        updatedAt: new Date()
      });
    }
  }

  // Method to increment/decrement tenant count
  async updateTenantCount(roomId: string, tenantId: string, isAdding: boolean): Promise<void> {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    if (isAdding && room.currentTenants >= room.maxTenants) {
      throw new ConflictException(`Room ${room.number} is already at maximum capacity`);
    }

    const update: any = {
      $inc: { currentTenants: isAdding ? 1 : -1 },
      updatedAt: new Date()
    };

    if (isAdding) {
      update.$push = { tenants: tenantId };
    } else {
      update.$pull = { tenants: tenantId };
    }

    await this.roomModel.findByIdAndUpdate(roomId, update);
    await this.checkAndUpdateRoomStatus(roomId);
  }
}
