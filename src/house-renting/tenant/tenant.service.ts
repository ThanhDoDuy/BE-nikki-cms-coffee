import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from './schemas/tenant.schema';
import { Room, RoomStatus, ROOM_MAX_TENANTS } from '../room/schemas/room.schema';
import { CreateTenantDto, TenantStatus } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
  ) {}

  private countActiveTenantsExcept(tenants: any[], excludeTenantId?: string): number {
    return tenants.filter(t => {
      if (!t || !t._id) return false;
      if (excludeTenantId && t._id.toString() === excludeTenantId) return false;
      return true;
    }).length;
  }

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if room exists and is available
    const room = await this.roomModel.findOne({ 
      _id: createTenantDto.room,
      isDeleted: false 
    }).populate({
      path: 'tenants',
      match: { isDeleted: false, status: { $ne: TenantStatus.MOVED_OUT } }
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const activeTenantsCount = this.countActiveTenantsExcept(room.tenants);
    if (activeTenantsCount >= ROOM_MAX_TENANTS) {
      throw new BadRequestException('Phòng đã đầy người');
    }

    // Create tenant
    const tenant = new this.tenantModel(createTenantDto);
    await tenant.save();

    // Update room's tenant list and status
    await this.roomModel.findByIdAndUpdate(room._id, {
      $push: { tenants: tenant._id },
      status: activeTenantsCount + 1 >= ROOM_MAX_TENANTS ? RoomStatus.FULL : RoomStatus.AVAILABLE,
      updatedAt: new Date()
    });

    return tenant.populate('room', 'number price deposit maxTenants');
  }

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const query = {
      isDeleted: false,
      ...(search ? {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      } : {})
    };

    const data = await this.tenantModel.find(query)
      .populate('room', 'number price deposit maxTenants')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.tenantModel.countDocuments(query);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string) {
    const tenant = await this.tenantModel.findOne({ 
      _id: id,
      isDeleted: false 
    }).populate('room', 'number price deposit maxTenants');

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: Partial<CreateTenantDto>) {
    const tenant = await this.tenantModel.findOne({ 
      _id: id,
      isDeleted: false 
    }).populate('room');

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // If room is being changed
    if (updateTenantDto.room && updateTenantDto.room !== tenant.room.toString()) {
      const newRoom = await this.roomModel.findOne({ 
        _id: updateTenantDto.room,
        isDeleted: false 
      }).populate({
        path: 'tenants',
        match: { isDeleted: false, status: { $ne: TenantStatus.MOVED_OUT } }
      });

      if (!newRoom) {
        throw new NotFoundException('New room not found');
      }

      const activeTenantsCount = this.countActiveTenantsExcept(newRoom.tenants);
      if (activeTenantsCount >= ROOM_MAX_TENANTS) {
        throw new BadRequestException('New room is at maximum capacity');
      }

      // Remove from old room and update its status
      const oldRoom = await this.roomModel.findById(tenant.room).populate({
        path: 'tenants',
        match: { isDeleted: false, status: { $ne: TenantStatus.MOVED_OUT } }
      });

      if (oldRoom) {
        const oldRoomActiveTenantsCount = this.countActiveTenantsExcept(oldRoom.tenants, tenant?._id?.toString());
        await this.roomModel.findByIdAndUpdate(tenant.room, {
          $pull: { tenants: tenant._id },
          status: oldRoomActiveTenantsCount - 1 >= ROOM_MAX_TENANTS ? RoomStatus.FULL : RoomStatus.AVAILABLE,
          updatedAt: new Date()
        });
      }

      // Add to new room and update its status
      await this.roomModel.findByIdAndUpdate(newRoom._id, {
        $push: { tenants: tenant._id },
        status: activeTenantsCount + 1 >= ROOM_MAX_TENANTS ? RoomStatus.FULL : RoomStatus.AVAILABLE,
        updatedAt: new Date()
      });
    }

    // If status is changed to MOVED_OUT
    if (updateTenantDto.status === TenantStatus.MOVED_OUT) {
      await this.roomModel.findByIdAndUpdate(tenant.room, {
        $pull: { tenants: tenant._id },
        updatedAt: new Date()
      });

      // Set moveOutDate if not provided
      if (!updateTenantDto.moveOutDate) {
        updateTenantDto.moveOutDate = new Date();
      }

      // Update room status based on remaining active tenants
      const room = await this.roomModel.findById(tenant.room).populate({
        path: 'tenants',
        match: { isDeleted: false, status: { $ne: TenantStatus.MOVED_OUT } }
      });

      if (room) {
        const remainingActiveTenantsCount = this.countActiveTenantsExcept(room.tenants, tenant?._id?.toString());
        await this.roomModel.findByIdAndUpdate(tenant.room, {
          status: remainingActiveTenantsCount >= ROOM_MAX_TENANTS ? RoomStatus.FULL : RoomStatus.AVAILABLE
        });
      }
    }

    return this.tenantModel.findByIdAndUpdate(
      id,
      { $set: updateTenantDto },
      { new: true }
    ).populate('room', 'number price deposit maxTenants');
  }

  async remove(id: string) {
    const tenant = await this.tenantModel.findOne({ 
      _id: id,
      isDeleted: false 
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Update room's tenant list if tenant is not already moved out
    if (tenant.status !== TenantStatus.MOVED_OUT) {
      await this.roomModel.findByIdAndUpdate(tenant.room, {
        $pull: { tenants: tenant._id },
        updatedAt: new Date()
      });

      // Update room status based on remaining active tenants
      const room = await this.roomModel.findById(tenant.room).populate({
        path: 'tenants',
        match: { isDeleted: false, status: { $ne: TenantStatus.MOVED_OUT } }
      });

      if (room) {
        const remainingActiveTenantsCount = this.countActiveTenantsExcept(room.tenants, tenant?._id?.toString());
        await this.roomModel.findByIdAndUpdate(tenant.room, {
          status: remainingActiveTenantsCount >= ROOM_MAX_TENANTS ? RoomStatus.FULL : RoomStatus.AVAILABLE
        });
      }
    }

    // Soft delete
    return this.tenantModel.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        status: TenantStatus.MOVED_OUT,
        moveOutDate: tenant.moveOutDate || new Date()
      },
      { new: true }
    );
  }
} 